import React from 'react';
import { RouteInfo } from '../../types/custom/customTypes';
import Websocket_CDP_Canvas from '../minor/Websocket_CDP_Canvas';

interface Admin_CDP_PerformanceTestProps {
  routeInfo: RouteInfo;
}

const CUSTOM_URL_VALUE = '__custom__';

const PRESET_URLS: { label: string; value: string }[] = [
  { label: 'WebGL Blob', value: 'https://webglsamples.org/blob/blob.html' },
  { label: 'Test Mouse Inputs', value: 'https://testmouse.com/' },
  { label: 'Test Mouse Movements', value: 'https://www.xbitlabs.com/mouse-speed-acceleration-test/' },
  { label: 'TestUFO', value: 'https://testufo.com/' },
  { label: 'JPEG payload size stress', value: 'https://www.shadertoy.com/view/Xds3zN' },
  { label: 'Interactive Game', value: 'https://hexgl.bkcore.com/play/' },
  { label: 'Custom URL…', value: CUSTOM_URL_VALUE }
];

/**
 *
 * @param _props
 * @returns
 */
export default function Admin_CDP_PerformanceTest(_props: Admin_CDP_PerformanceTestProps): JSX.Element {
  return (
    <React.Fragment>
      <Websocket_CDP_Canvas
        PRESET_URLS={PRESET_URLS}
        CUSTOM_URL_VALUE={CUSTOM_URL_VALUE}
        userInputToggle={false}
        cdpEndpoint={'TEST'}
      ></Websocket_CDP_Canvas>
    </React.Fragment>
  );
}
