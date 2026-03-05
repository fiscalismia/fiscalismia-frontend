import React, { useRef, useState, useEffect, useCallback } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { startChromiumDeveloperProtocolSession } from '../../services/pgConnections';
import {
  Box,
  Button,
  FilledInput,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  useTheme
} from '@mui/material';
import { CDPUserInput, MouseClickInput, RouteInfo } from '../../types/custom/customTypes';
import { locales } from '../../utils/localeConfiguration';
import { localStorageKeys } from '../../resources/resource_properties';
import { serverConfig } from '../../resources/serverConfig';
import { canvasToCDP, toastOptions } from '../../utils/sharedFunctions';
import { toast } from 'react-toastify';

interface Admin_CDP_PerformanceTest {
  routeInfo: RouteInfo;
}

type StreamStatus = 'idle' | 'connecting' | 'streaming' | 'error';

const CDP_WIDTH = 1280;
const CDP_HEIGHT = 720;
const WS_BASE = serverConfig.FASTAPI_BASE_URL.replace(/^http/, 'ws');

const CUSTOM_URL_VALUE = '__custom__';

const PRESET_URLS: { label: string; value: string }[] = [
  { label: 'WebGL Blob', value: 'https://webglsamples.org/blob/blob.html' },
  { label: 'TestUFO', value: 'https://testufo.com/' },
  { label: 'JPEG payload size stress', value: 'https://www.shadertoy.com/view/Xds3zN' },
  { label: 'Interactive Game', value: 'https://hexgl.bkcore.com/play/' },
  { label: 'Custom URL…', value: CUSTOM_URL_VALUE }
];

const BUTTON_MAP: Record<number, MouseClickInput['button']> = {
  0: 'left',
  1: 'middle',
  2: 'right'
};

/**
 * Starts a remote CDP session on the FastAPI Python Backend and then uses Websockets to receive jpegs as binary packets
 * that can be displayed in a Canvas, which records mouse and keyboard input and sends it back via a bi-directional websocket
 * @param _props
 * @returns
 */
export default function Deals_MarketWebscraping(_props: Admin_CDP_PerformanceTest): JSX.Element {
  const { palette } = useTheme();
  // useRef for canvas: direct DOM access — drawImage() writes pixels without triggering re-renders
  // useRef for WebSocket: the WS instance must persist across renders and be accessible without a state dependency
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const frameCounter = useRef<number>(0);
  const lastRenderedFrame = useRef<number>(0);
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_URLS[0].value);
  const [customUrl, setCustomUrl] = useState<string>('');

  const isCustom = selectedPreset === CUSTOM_URL_VALUE;
  const targetUrl = isCustom ? customUrl : selectedPreset;

  const handlePresetChange = (e: SelectChangeEvent<string>): void => {
    setSelectedPreset(e.target.value);
  };

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCustomUrl(e.target.value);
  };

  /**
   * Sends user input in the rendered canvas back to the backend via websockets
   * @param ws websocket
   * @param userInput varying and extensible user input such as mouseclicks
   */
  const sendInput = (ws: WebSocket | null, userInput: CDPUserInput): void => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(userInput));
    }
  };

  // useCallback with [] deps: handleFrame is assigned to ws.onmessage once during connection setup.
  // Without memoization, a re-render would create a new closure, but the WebSocket still holds
  // the old reference — so the callback identity must be stable.
  const handleFrameBlob = useCallback((blob: Blob, ctx: CanvasRenderingContext2D, isBitmap: boolean = false) => {
    // ensures old frames are never painted above newer frames
    const frameToRender = (frameCounter.current += 1);
    if (isBitmap) {
      // more performant bitmap Promises
      createImageBitmap(blob).then(
        (bitmap: ImageBitmap) => {
          if (frameToRender >= lastRenderedFrame.current) {
            ctx.drawImage(bitmap, 0, 0, CDP_WIDTH, CDP_HEIGHT);
            lastRenderedFrame.current = frameToRender;
          }
          bitmap.close();
        },
        (onReject: any) => {
          toast.error(locales().ADMIN_AREA_CDP_PERFORMANCE_TEST_WS_UNDEFINED_BITMAP_ERROR + ` rejected: ${onReject}`);
        }
      );
    } else {
      const img = new Image();
      // default and trivial object url decoding
      const blobUrl = URL.createObjectURL(blob);
      img.onload = () => {
        if (frameToRender >= lastRenderedFrame.current) {
          ctx.drawImage(img, 0, 0, CDP_WIDTH, CDP_HEIGHT);
          lastRenderedFrame.current = frameToRender;
        }
        // cleans up memory to prevent a memory leak
        URL.revokeObjectURL(blobUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
      };
      img.src = blobUrl;
    }
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = canvasToCDP(e, CDP_WIDTH, CDP_HEIGHT);
    const mouseClick: MouseClickInput = {
      type: 'mouseclick',
      x: Math.round(x),
      y: Math.round(y),
      button: BUTTON_MAP[e.button] ?? 'left'
    };
    if (e.button === 0) toast.info(JSON.stringify(mouseClick));
    if (e.button === 1) toast.success(JSON.stringify(mouseClick));
    if (e.button === 2) toast.dark(JSON.stringify(mouseClick));
    sendInput(wsRef.current, mouseClick);
  }, []);

  /**
   * Opens a Websocket Connection to the FastAPI backend in order to stream a Playwright CDP session.
   * Calls a framehandler with binary jpeg data to transform into a performant ImageBitmap Promise pipeline.
   * The pipeline tracks rendered frames and discards stale frames not rendered fast enough in the async loop.
   */
  const handleWebsocketSessionInitialization = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (status === 'connecting' || status === 'streaming') return;
      const token = window.localStorage.getItem(localStorageKeys.token);
      if (!token) return;

      // Check for existing canvas context
      const canvas: HTMLCanvasElement | null = canvasRef.current;
      if (!canvas) return;
      const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (!ctx) return;

      setStatus('connecting');
      const result = await startChromiumDeveloperProtocolSession(targetUrl);
      if (!result?.session_id) {
        setStatus('error');
        return;
      }

      // handle websocket session streaming
      const wsUrl = `${WS_BASE}/ws/session/${result.session_id}?token=${token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => setStatus('streaming');
      ws.onmessage = (message: MessageEvent<Blob>) => {
        if (message.data) {
          try {
            const blob: Blob = message.data;
            // debugBlob(blob);
            handleFrameBlob(blob, ctx, true);
          } catch (error: unknown) {
            if (error instanceof Error) {
              toast.error(
                `Error: ${error}: ` +
                  locales().ADMIN_AREA_CDP_PERFORMANCE_TEST_WS_BLOB_ERROR_MSG(
                    message.data.size?.toFixed(),
                    typeof message.data
                  ),
                toastOptions
              );
            } else {
              toast.error(
                locales().ADMIN_AREA_CDP_PERFORMANCE_TEST_WS_BLOB_ERROR_MSG(
                  message.data.size?.toFixed(),
                  typeof message.data
                ),
                toastOptions
              );
            }
            ws.close();
            setStatus('error');
            return;
          }
        } else {
          ws.close();
          toast.error(locales().ADMIN_AREA_CDP_PERFORMANCE_TEST_WS_MESSAGE_DATA_NOT_DEFINED, toastOptions);
          setStatus('error');
          return;
        }
      };
      ws.onerror = () => {
        toast.error(locales().ADMIN_AREA_CDP_PERFORMANCE_TEST_WS_UNDEFINED_ERROR, toastOptions);
        setStatus('error');
      };
      ws.onclose = () => {
        toast.info(locales().ADMIN_AREA_CDP_PERFORMANCE_TEST_WS_CLOSED_MSG, toastOptions);
        wsRef.current = null;
        setStatus('idle');
      };
    },
    [status, handleFrameBlob, targetUrl]
  );

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const isDisabled = status === 'connecting' || status === 'streaming';

  return (
    <React.Fragment>
      <Grid container spacing={2} sx={{ marginTop: 2 }} justifyContent="flex-start">
        <Grid xs={12} sm={12} md={12} lg={12} xl={8}>
          <Box component="form" noValidate onSubmit={handleWebsocketSessionInitialization}>
            {/* FormControl 1: Select only — Select internally renders an InputBase */}
            <FormControl sx={{ width: 1 }}>
              <InputLabel id="targetUrlSelect-label" variant="filled" sx={{ fontFamily: 'Hack, Roboto' }}>
                {locales().ADMIN_AREA_CDP_PERFORMANCE_TEST_INPUT_LABEL_TARGETURL}
              </InputLabel>
              <Select
                labelId="targetUrlSelect-label"
                id="targetUrlSelect"
                value={selectedPreset}
                onChange={handlePresetChange}
                variant="filled"
                disableUnderline
                disabled={isDisabled}
                sx={{
                  borderRadius: 0,
                  fontFamily: 'Hack, Roboto',
                  '& .MuiSelect-select': { fontFamily: 'Hack, Roboto' }
                }}
              >
                {PRESET_URLS.map(({ label, value }) => (
                  <MenuItem key={value} value={value} sx={{ fontFamily: 'Hack, Roboto' }}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* FormControl 2: custom URL input — isolated so only one InputBase per FormControl */}
            {isCustom && (
              <FormControl sx={{ width: 1, mt: '2px' }}>
                <FilledInput
                  sx={{ borderRadius: 0, fontFamily: 'Hack, Roboto' }}
                  id="customUrlInput"
                  disableUnderline
                  hiddenLabel
                  placeholder="https://…"
                  value={customUrl}
                  onChange={handleCustomUrlChange}
                  disabled={isDisabled}
                />
              </FormControl>
            )}

            <Button
              type="submit"
              sx={{
                width: 1,
                borderRadius: 0,
                border: `3px solid ${palette.border.dark}`,
                fontFamily: 'Hack, Roboto',
                fontSize: '16px',
                mb: '-2px',
                letterSpacing: 3,
                textTransform: 'uppercase',
                fontWeight: 'bold'
              }}
              variant="contained"
              size="large"
              color="primary"
              disabled={isDisabled || (isCustom && !customUrl.trim())}
            >
              {locales().ADMIN_AREA_CDP_PERFORMANCE_TEST_START_CDP_SESSION_BTN}
            </Button>
          </Box>
          <Paper
            elevation={6}
            sx={{
              borderRadius: 0,
              border: `3px solid ${palette.border.dark}`,
              backgroundColor: palette.common.black
            }}
          >
            <canvas
              ref={canvasRef}
              width={CDP_WIDTH}
              height={CDP_HEIGHT}
              onMouseDown={handleCanvasClick}
              onContextMenu={(e) => e.preventDefault()}
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );

  // /**
  //  *
  //  * @param blob
  //  */
  // function debugBlob(blob: Blob) {
  //   // Add this to the DOM before debugging
  //   <Stack>
  //     <Link id="blob-test">Download Blob</Link>
  //     <Box
  //       id="blob-img"
  //       component="img"
  //       sx={{
  //         width: 320,
  //         height: 180,
  //         maxWidth: { xs: 640 },
  //         maxHeight: { xs: 360 }
  //       }}
  //     />
  //   </Stack>;
  //   // ##### BLOB DOWNLOAD LINK
  //   const blobUrl = URL.createObjectURL(blob);
  //   const link: HTMLElement = document.getElementById('blob-test')!;
  //   link.setAttribute('href', blobUrl);
  //   link.setAttribute('download', 'blob.jpeg');
  //   link.setAttribute('innertext', 'download blob');

  //   // ##### BLOB DISPLAY OBJECT URL AS IMG
  //   const imgBox: HTMLElement = document.getElementById('blob-img')!;
  //   imgBox.setAttribute('src', blobUrl);

  //   // #### DEBUG BLOB
  //   // console.log(blob);
  //   // console.log(blobUrl);
  //   // console.log(link);
  //   // console.log(imgBox);
  // }
}
