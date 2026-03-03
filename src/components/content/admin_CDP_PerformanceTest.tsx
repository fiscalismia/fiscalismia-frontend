import React, { useRef, useState, useEffect, useCallback } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { startChromiumDeveloperProtocolSession } from '../../services/pgConnections';
import { Box, Button, FilledInput, FormControl, InputLabel, Paper, useTheme } from '@mui/material';
import { RouteInfo } from '../../types/custom/customTypes';
import { locales } from '../../utils/localeConfiguration';
import { localStorageKeys } from '../../resources/resource_properties';
import { serverConfig } from '../../resources/serverConfig';

interface Admin_CDP_PerformanceTest {
  routeInfo: RouteInfo;
}

type StreamStatus = 'idle' | 'connecting' | 'streaming' | 'error';

const CDP_WIDTH = 1280;
const CDP_HEIGHT = 720;
const WS_BASE = serverConfig.FASTAPI_BASE_URL.replace(/^http/, 'ws');

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
  const [status, setStatus] = useState<StreamStatus>('idle');
  // https://testufo.com/
  // https://threejs.org/examples/#webgl_postprocessing_pixel
  // https://threejs.org/examples/#webgl_postprocessing_unreal_bloom
  // https://threejs.org/examples/#webgpu_camera
  const [targetUrl, setTargetUrl] = useState<string>('https://webglsamples.org/blob/blob.html');

  const inputChangeListener = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    switch (e.target.id) {
      case 'targetUrlInput':
        setTargetUrl(e.target.value);
        break;
    }
  };

  // useCallback with [] deps: handleFrame is assigned to ws.onmessage once during connection setup.
  // Without memoization, a re-render would create a new closure, but the WebSocket still holds
  // the old reference — so the callback identity must be stable.
  const handleFrame = useCallback((base64: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, CDP_WIDTH, CDP_HEIGHT);
    img.src = `data:image/jpeg;base64,${base64}`;
  }, []);

  const handleWebsocketSessionInitialization = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (status === 'connecting' || status === 'streaming') return;
      const token = window.localStorage.getItem(localStorageKeys.token);
      if (!token) return;

      setStatus('connecting');
      const result = await startChromiumDeveloperProtocolSession(targetUrl);
      if (!result?.session_id) {
        setStatus('error');
        return;
      }

      const wsUrl = `${WS_BASE}/ws/session/${result.session_id}?token=${token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setStatus('streaming');
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'frame') handleFrame(msg.data);
      };
      ws.onerror = () => setStatus('error');
      ws.onclose = () => {
        wsRef.current = null;
        setStatus('idle');
      };
    },
    [status, handleFrame, targetUrl]
  );

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return (
    <React.Fragment>
      <Grid container spacing={2} sx={{ marginTop: 2 }} justifyContent="flex-start">
        <Grid xs={12} sm={12} md={12} lg={12} xl={8}>
          <Box component="form" noValidate onSubmit={handleWebsocketSessionInitialization}>
            <FormControl sx={{ width: 1 }}>
              <InputLabel
                variant="outlined"
                htmlFor="targetUrlInput"
                sx={{
                  marginTop: -1,
                  marginLeft: -1.5,
                  fontFamily: 'Hack, Roboto'
                }}
              >
                {locales().ADMIN_AREA_CDP_PERFORMANCE_TEST_INPUT_LABEL_TARGETURL}
              </InputLabel>
              <FilledInput
                sx={{ borderRadius: 0, fontFamily: 'Hack, Roboto' }}
                id="targetUrlInput"
                disableUnderline={true}
                hiddenLabel={true}
                value={targetUrl}
                onChange={inputChangeListener}
              />
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
                disabled={status === 'connecting' || status === 'streaming'}
              >
                {locales().ADMIN_AREA_CDP_PERFORMANCE_TEST_START_CDP_SESSION_BTN}
              </Button>
            </FormControl>
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
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
