import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { startChromiumDeveloperProtocolSession } from '../../services/pgConnections';
import { Button, Paper, useTheme } from '@mui/material';
import { RouteInfo } from '../../types/custom/customTypes';
import { locales } from '../../utils/localeConfiguration';

interface Deals_MarketWebscraping {
  routeInfo: RouteInfo;
}

const handleWebsocketSessionInitialization = async () => {
  const targetUrl = 'https://example.com';
  const startSesionResult = await startChromiumDeveloperProtocolSession(targetUrl);
  console.log(startSesionResult);
};

/**
 * Starts a remote CDP session on the FastAPI Python Backend and then uses Websockets to receive jpegs as binary packets
 * that can be displayed in a Canvas, which records mouse and keyboard input and sends it back via a bi-directional websocket
 * @param _props
 * @returns
 */
export default function Deals_MarketWebscraping(_props: Deals_MarketWebscraping): JSX.Element {
  const { palette } = useTheme();

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
            onClick={handleWebsocketSessionInitialization}
          >
            {locales().DEALS_MARKET_WEBSCRAPING_START_CDP_SESSION_BTN}
          </Button>
          <Paper
            elevation={6}
            sx={{
              borderRadius: 0,
              border: `3px solid ${palette.border.dark}`,
              padding: 1,
              paddingLeft: 1.5,
              backgroundColor: palette.common.black,
              height: 500
            }}
          ></Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
