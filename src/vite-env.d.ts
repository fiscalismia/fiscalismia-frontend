/// <reference types="vite/client" />

// defined in vite.config.ts and dynamically loaded based on ENV VAR passed in pipeline for builds
declare const __APP_VERSION__: string;
declare const __ENVIRONMENT__: string;
declare const __BACKEND_PORT__: number;
declare const __BACKEND_PROTOCOL__: string;
declare const __BACKEND_DOMAIN__: string;
