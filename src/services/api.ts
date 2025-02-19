import axios, { 
  AxiosError, 
  AxiosInstance, 
  AxiosResponse, 
  InternalAxiosRequestConfig 
} from 'axios';

// Types
export interface Character {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  url: string;
}

export interface CharacterResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Character[];
}

export interface ApiError {
  message: string;
  code: string;
  status?: number;
  timestamp: string;
}

// Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://swapi.dev/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
};

// Logger
const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    if (import.meta.env.DEV) {
      console.log(`[API] ${message}`, meta);
    }
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(`[API] ${message}`, meta);
  },
};

// Create and configure API instance
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor with basic retry logic
  let retryCount = 0;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      logger.info('Request', {
        method: config.method,
        url: config.url,
        timestamp: new Date().toISOString(),
      });
      return config;
    },
    (error: AxiosError) => {
      logger.error('Request Error', {
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      });
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      logger.info('Response', {
        status: response.status,
        url: response.config.url,
        timestamp: new Date().toISOString(),
      });
      retryCount = 0; // Reset retry count on successful response
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig;
      
      if (!config || !error.response || retryCount >= MAX_RETRIES) {
        const apiError: ApiError = {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR',
          status: error.response?.status,
          timestamp: new Date().toISOString(),
        };

        logger.error('Response Error', {
          ...apiError,
          url: error.config?.url,
          response: error.response?.data,
        });

        return Promise.reject(apiError);
      }

      retryCount++;
      logger.info(`Retrying request (${retryCount}/${MAX_RETRIES})`, {
        url: config.url,
        timestamp: new Date().toISOString(),
      });

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return instance(config);
    }
  );

  return instance;
};

// API instance
const api = createApiInstance();

// API methods
const characters = {
  getCharacters: async (page = 1, search = ''): Promise<CharacterResponse> => {
    try {
      logger.info('getCharacters called', { page, search });
      const response: AxiosResponse<CharacterResponse> = await api.get('/people/', {
        params: { page, search },
      });
      return response.data;
    } catch (error) {
      logger.error('Error in getCharacters', { error });
      throw error;
    }
  },

  getCharacter: async (id: string): Promise<Character> => {
    try {
      logger.info('getCharacter called', { id });
      const response: AxiosResponse<Character> = await api.get(`/people/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Error in getCharacter', { error });
      throw error;
    }
  },

  updateCharacter: async (id: string, character: Character): Promise<Character> => {
    try {
      logger.info('updateCharacter called', { id, character });
      const response: AxiosResponse<Character> = await api.put(`/people/${id}`, character);
      return response.data;
    } catch (error) {
      logger.error('Error in updateCharacter', { error });
      throw error;
    }
  }
};

export default { characters };

// Local storage service
export const LocalStorageService = {
  STORAGE_KEY: 'characterEdits',

  saveCharacter(id: string, character: Character): void {
    try {
      const storedEdits = this.getStoredEdits();
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          ...storedEdits,
          [id]: character,
        })
      );
    } catch (error) {
      logger.error('Error saving character to localStorage', { error, id });
      throw new Error('Failed to save character data locally');
    }
  },

  getCharacter(id: string): Character | null {
    try {
      const storedEdits = this.getStoredEdits();
      return storedEdits[id] || null;
    } catch (error) {
      logger.error('Error getting character from localStorage', { error, id });
      return null;
    }
  },

  getStoredEdits(): Record<string, Character> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error('Error parsing stored edits', { error });
      return {};
    }
  },
}; 