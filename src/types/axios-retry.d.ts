declare module 'axios-retry' {
  import { AxiosError, AxiosInstance } from 'axios';

  interface IAxiosRetry {
    (
      axios: AxiosInstance,
      options?: {
        retries?: number;
        retryDelay?: (retryCount: number) => number;
        retryCondition?: (error: AxiosError) => boolean;
      }
    ): void;
    isNetworkOrIdempotentRequestError(error: AxiosError): boolean;
    exponentialDelay(retryNumber: number): number;
  }

  const axiosRetry: IAxiosRetry;
  export default axiosRetry;
} 