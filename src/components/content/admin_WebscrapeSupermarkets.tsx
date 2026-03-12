import React from 'react';
import { RouteInfo } from '../../types/custom/customTypes';
import Websocket_CDP_Canvas from '../minor/Websocket_CDP_Canvas';

interface Admin_CDP_PerformanceTestProps {
  routeInfo: RouteInfo;
}

const CUSTOM_URL_VALUE = '__custom__';

const PRESET_URLS: { label: string; value: string }[] = [{ label: 'Aldi Süd', value: 'https://aldi-sued.de/angebote' }];

/**
 *
 * @param _props
 * @returns
 */
export default function Admin_CDP_PerformanceTest(_props: Admin_CDP_PerformanceTestProps): JSX.Element {
  return (
    <React.Fragment>
      <Websocket_CDP_Canvas PRESET_URLS={PRESET_URLS} CUSTOM_URL_VALUE={CUSTOM_URL_VALUE}></Websocket_CDP_Canvas>
    </React.Fragment>
  );
}
