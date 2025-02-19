declare module 'axios-rate-limit' {
  import { AxiosInstance } from 'axios';

  interface RateLimitConfig {
    maxRequests: number;
    perMilliseconds: number;
  }

  function rateLimit(
    axios: AxiosInstance,
    options: RateLimitConfig
  ): AxiosInstance;

  export default rateLimit;
} 