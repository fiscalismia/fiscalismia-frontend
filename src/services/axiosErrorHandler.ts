import axios from 'axios';
import { serverConfig } from '../resources/serverConfig';
import { toast } from 'react-toastify';
import { axiosErrorToastOptions } from '../utils/sharedFunctions';

const baseUrl = serverConfig.API_BASE_URL;

export const axiosClient = axios.create({
  baseURL: baseUrl
});

axiosClient.interceptors.response.use(
  (response) => {
    // this could be used to centrally log all axios backend responses
    return response;
  },
  (error) => {
    if (error instanceof Error) {
      toast.error(`Axios Interceptor - ${error.name}: ${error.message}`, axiosErrorToastOptions);
    } else {
      toast.error(`Axios Interceptor received undefined Error: ${error}`, axiosErrorToastOptions);
    }
    // Preserves Error Type and propagates them to be processed in individual catch blocks.
    // Otherwise the Interceptor would simply swallow errors and abort any further processing.
    return Promise.reject(error);
  }
);
