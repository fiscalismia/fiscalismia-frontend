const BACKEND_PORT: number = __ENVIRONMENT__ === 'production' || __ENVIRONMENT__ === 'demo' ? 443 : 3002;
const FASTAPI_PORT: number = __ENVIRONMENT__ === 'production' || __ENVIRONMENT__ === 'demo' ? 443 : 3003;
const BACKEND_DOMAIN: string =
  __ENVIRONMENT__ === 'production'
    ? 'backend.fiscalismia.com'
    : __ENVIRONMENT__ === 'demo'
      ? 'backend.demo.fiscalismia.com'
      : '127.0.0.1';
const FASTAPI_DOMAIN: string =
  __ENVIRONMENT__ === 'production'
    ? 'fastapi.fiscalismia.com'
    : __ENVIRONMENT__ === 'demo'
      ? 'fastapi.demo.fiscalismia.com'
      : '127.0.0.1';
const BACKEND_PROTOCOL: string = __ENVIRONMENT__ === 'production' || __ENVIRONMENT__ === 'demo' ? 'https' : 'http';

export const serverConfig = {
  API_BASE_URL: `${BACKEND_PROTOCOL}://${BACKEND_DOMAIN}:${BACKEND_PORT}/api/fiscalismia`,
  FASTAPI_BASE_URL: `${BACKEND_PROTOCOL}://${FASTAPI_DOMAIN}:${FASTAPI_PORT}/fastapi/fiscalismia`
};
