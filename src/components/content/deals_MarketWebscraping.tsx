import React, { useRef, useState, useEffect, useCallback } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { startChromiumDeveloperProtocolSession } from '../../services/pgConnections';
import { Button, Paper, useTheme } from '@mui/material';
import { RouteInfo } from '../../types/custom/customTypes';
import { locales } from '../../utils/localeConfiguration';
import { localStorageKeys, serverConfig } from '../../resources/resource_properties';

interface Deals_MarketWebscraping {
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
export default function Deals_MarketWebscraping(_props: Deals_MarketWebscraping): JSX.Element {
  const { palette } = useTheme();
  // useRef for canvas: direct DOM access — drawImage() writes pixels without triggering re-renders
  // useRef for WebSocket: the WS instance must persist across renders and be accessible without a state dependency
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<StreamStatus>('idle');

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

  const handleWebsocketSessionInitialization = useCallback(async () => {
    if (status === 'connecting' || status === 'streaming') return;
    const token = window.localStorage.getItem(localStorageKeys.token);
    if (!token) return;

    setStatus('connecting');
    // https://threejs.org/examples/#webgl_postprocessing_pixel
    // https://threejs.org/examples/#webgl_postprocessing_unreal_bloom
    // https://threejs.org/examples/#webgpu_camera
    const targetUrl = 'https://webglsamples.org/blob/blob.html';
    const result = await startChromiumDeveloperProtocolSession(targetUrl);
    if (!result?.session_id) {
      setStatus('error');
      return;
    }

    const wsUrl = `${WS_BASE}/stream/${result.session_id}/ws?token=${token}`;
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
  }, [status, handleFrame]);

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
          <Button
            sx={{
              width: 1,
              borderRadius: 0,
              border: `3px solid ${palette.border.dark}`,
              fontFamily: 'Hack',
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
            onClick={handleWebsocketSessionInitialization}
          >
            {locales().DEALS_MARKET_WEBSCRAPING_START_CDP_SESSION_BTN}
          </Button>
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
