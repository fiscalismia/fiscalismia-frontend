import React from 'react';
import { RouteInfo } from '../../types/custom/customTypes';
import Websocket_CDP_Canvas from '../minor/Websocket_CDP_Canvas';

interface admin_WebscrapeSupermarketsProps {
  routeInfo: RouteInfo;
}

const PRESET_URLS: { label: string; value: string }[] = [
  { label: 'Aldi Süd Prospekte', value: 'https://www.aldi-sued.de/prospekte' }
];

/**
 *
 * @param _props
 * @returns
 */
export default function admin_WebscrapeSupermarkets(_props: admin_WebscrapeSupermarketsProps): JSX.Element {
  return (
    <React.Fragment>
      <Websocket_CDP_Canvas
        PRESET_URLS={PRESET_URLS}
        CUSTOM_URL_VALUE={null}
        userInputToggle={true}
      ></Websocket_CDP_Canvas>
    </React.Fragment>
  );
}
