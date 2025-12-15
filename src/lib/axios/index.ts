/**
 * Configuração principal do Axios para o projeto
 * Centraliza todas as configurações e exporta os clientes apropriados
 */

// Clientes Axios
export { default as axiosClient } from "./axios-client";
// Classes de erro personalizadas
export {
  ApiAuthenticationError,
  ApiConnectionError,
  ApiNotFoundError,
  ApiServerError,
  ApiValidationError,
  BaseApiService,
} from "./base-api-service";

export { default as serverAxiosClient } from "./server-axios-client";

/**
 * Configurações globais do Axios para o projeto
 */
export const AXIOS_CONFIG = {
  // Timeouts
  CLIENT_TIMEOUT: 15000,
  SERVER_TIMEOUT: 30000,
  UPLOAD_TIMEOUT: 60000,

  // Retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,

  // Headers padrão
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },

  // Status codes para retry automático
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504],
} as const;

/**
 * Tipos para responses da API
 */
export interface StandardApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data?: T;
  recordId?: number;
  quantity?: number;
  info1?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  details?: unknown;
}

/**
 * Guia de uso rápido:
 *
 * 1. Para Client Components:
 *    import { axiosClient } from '@/lib/axios';
 *    const response = await axiosClient.get('/endpoint');
 *
 * 2. Para Server Components/API Routes:
 *    import { serverAxiosClient } from '@/lib/axios';
 *    const response = await serverAxiosClient.get('/endpoint');
 *
 * 3. Para criar serviços:
 *    import { BaseApiService } from '@/lib/axios';
 *    class MyService extends BaseApiService {
 *      async getData() {
 *        return this.get('/my-endpoint');
 *      }
 *    }
 *
 * 4. Para usar hooks no React:
 *    import { useApiCall } from '@/hooks/use-api';
 *    const { data, loading, error, execute } = useApiCall();
 */
