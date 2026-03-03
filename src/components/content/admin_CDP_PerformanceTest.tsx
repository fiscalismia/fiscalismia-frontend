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

const CUSTOM_URL_VALUE = '__custom__';

const PRESET_URLS: { label: string; value: string }[] = [
  { label: 'WebGL Blob', value: 'https://webglsamples.org/blob/blob.html' },
  { label: 'TestUFO', value: 'https://testufo.com/' },
  { label: 'Three.js — Unreal Bloom', value: 'https://threejs.org/examples/#webgl_postprocessing_unreal_bloom' },
  { label: 'Three.js — WebGPU Camera', value: 'https://threejs.org/examples/#webgpu_camera' },
  { label: 'Custom URL…', value: CUSTOM_URL_VALUE }
];

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
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
