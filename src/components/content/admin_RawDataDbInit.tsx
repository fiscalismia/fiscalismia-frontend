import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { postRawDataEtlInvocation } from '../../services/pgConnections';
import { Button } from '@mui/material';
import { RouteInfo } from '../../types/custom/customTypes';
import { locales } from '../../utils/localeConfiguration';

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
  return (
    <React.Fragment>
      <Grid container spacing={2} sx={{ marginTop: 2 }} justifyContent="center"></Grid>
      <Button sx={{ width: 1 }} variant="contained" size="large" color="primary" onClick={postRawDataEtlInvocation}>
        {locales().ADMIN_AREA_AUTOMATED_DB_INVOKE_API_GW_LAMBDA_BTN}
      </Button>
      <Grid xs={12} lg={7} xl={6}></Grid>
    </React.Fragment>
  );
}
