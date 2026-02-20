import React, { useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { getRawDataEtlInvocation } from '../../services/pgConnections';
import { Button, Paper, Typography, useTheme } from '@mui/material';
import { RouteInfo } from '../../types/custom/customTypes';
import { locales } from '../../utils/localeConfiguration';
const levelColors: Record<string, string> = {
  info: '#cac3c3',
  success: '#97eb63',
  magenta: '#f585fc'
};
const timestampColor = '#258d98';

interface Income_SalesProps {
  routeInfo: RouteInfo;
}

/**
 * Queries variable expenses with category='Sale' where the amount is expected to be negative,
 * which is inverted logic since the file containing sales is supposed to contain purchases.
 * @param _props
 * @returns Several Content Cards with sales ordered by amount desc. Also contains all sales in a very basic data table.
 */
export default function Income_Sales(_props: Income_SalesProps): JSX.Element {
  const { palette } = useTheme();
  const [logMessages, setLogMessages] = useState<{ message: string; level: string }[]>([]);

  const handleEtlInvocation = async () => {
    setLogMessages([]);
    await getRawDataEtlInvocation((data: { message: string; level: string }) => {
      setLogMessages((prev) => [...prev, data]);
    });
  };
  return (
    <React.Fragment>
      <Grid container spacing={2} sx={{ marginTop: 2 }} justifyContent="center"></Grid>
      <Button
        sx={{
          width: 1,
          borderRadius: 0,
          border: `2px solid ${palette.border.dark}`,
          fontFamily: 'Hack',
          fontSize: '16px',
          letterSpacing: 3,
          textTransform: 'uppercase',
          fontWeight: 'bold'
        }}
        variant="contained"
        size="large"
        color="primary"
        onClick={handleEtlInvocation}
      >
        {locales().ADMIN_AREA_AUTOMATED_DB_INVOKE_API_GW_LAMBDA_BTN}
      </Button>
      <Grid xs={12} lg={7} xl={6}>
        <Paper
          elevation={6}
          sx={{
            borderRadius: 0,
            border: `3px solid ${palette.border.dark}`,
            padding: 1,
            backgroundColor: palette.common.black,
            height: 500
          }}
        >
          {logMessages.map((data, i) => (
            <Typography
              key={i}
              sx={{
                fontFamily: 'Hack',
                fontSize: '15px',
                color: palette.success.light,
                whiteSpace: 'pre-wrap'
              }}
            >
              <span style={{ letterSpacing: 1, color: timestampColor }}>{data.message.substring(0, 20)}</span>
              <span
                style={{
                  letterSpacing: 3,
                  fontWeight: data.level === 'success' ? '600' : '200',
                  color: levelColors[data.level]
                }}
              >
                {data.message.substring(20)}
              </span>
            </Typography>
          ))}
        </Paper>
      </Grid>
    </React.Fragment>
  );
}
