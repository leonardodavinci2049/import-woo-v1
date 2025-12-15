import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import axios from "axios";
import {
  API_TIMEOUTS,
  DEFAULT_HEADERS,
  EXTERNAL_API_BASE_URL,
} from "@/lib/constants/api-constants";

/**
 * Extensão do tipo InternalAxiosRequestConfig para incluir metadata
 */
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
      retryCount?: number;
    };
  }
}

/**
 * Cliente Axios configurado para todas as requisições da API
 * Usa API_KEY do projeto em vez de JWT tokens
 */
class AxiosClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: EXTERNAL_API_BASE_URL,
      timeout: API_TIMEOUTS.CLIENT_DEFAULT,
      headers: {
        ...DEFAULT_HEADERS,
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    });

    this.setupInterceptors();
  }

  /**
   * Configura interceptors para requisições e respostas
   */
  private setupInterceptors(): void {
    // Interceptor para requisições
    this.instance.interceptors.request.use(
      (config) => {
        // Adicionar timestamp de início da requisição
        config.metadata = { startTime: Date.now() };

        // Log apenas em desenvolvimento com timestamp
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[${new Date().toISOString()}] 🚀 ${config.method?.toUpperCase()} ${config.url}`,
            {
              params: config.params,
              headers: config.headers,
            },
          );
        }

        return config;
      },
      (error) => {
        console.error(
          `[${new Date().toISOString()}] ❌ [Request Error]`,
          error,
        );
        return Promise.reject(error);
      },
    );

    // Interceptor para respostas
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calcular duração da requisição
        const duration = response.config.metadata?.startTime
          ? Date.now() - response.config.metadata.startTime
          : null;

        // Log apenas em desenvolvimento com timestamp e duração
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[${new Date().toISOString()}] ✅ ${response.status} ${response.config.url}`,
            {
              duration: duration ? `${duration}ms` : "unknown",
              dataSize: JSON.stringify(response.data).length,
            },
          );
        }
        return response;
      },
      (error: AxiosError) => {
        // Calcular duração da requisição com erro
        const duration = error.config?.metadata?.startTime
          ? Date.now() - error.config.metadata.startTime
          : null;

        // Log estruturado de erros
        if (process.env.NODE_ENV === "development") {
          console.error(
            `[${new Date().toISOString()}] ❌ ${error.response?.status || "NO_STATUS"} ${error.config?.url}`,
            {
              duration: duration ? `${duration}ms` : "unknown",
              message: error.message,
              data: error.response?.data,
            },
          );
        }

        // Tratamento global de erros
        this.handleResponseError(error);
        return Promise.reject(error);
      },
    );
  }

  /**
   * Trata erros de resposta de forma global
   */
  private handleResponseError(error: AxiosError): void {
    const status = error.response?.status;

    // Tratamento específico por código de status
    switch (status) {
      case 400:
        console.warn("Requisição inválida - verifique os dados enviados");
        break;
      case 401:
        console.warn("Não autorizado - autenticação necessária");
        this.handleUnauthorized();
        break;
      case 403:
        console.warn("Acesso negado - permissões insuficientes");
        break;
      case 404:
        console.warn("Endpoint não encontrado");
        break;
      case 429:
        console.warn("Muitas requisições - limite de rate excedido");
        break;
      case 500:
        console.error("Erro interno do servidor");
        break;
      case 502:
      case 503:
      case 504:
        console.error("Serviço indisponível temporariamente");
        break;
      default:
        if (process.env.NODE_ENV === "development") {
          console.error("Erro não categorizado na API:", error.message);
        }
    }
  }

  /**
   * Trata erro de não autorizado
   */
  private handleUnauthorized(): void {
    console.warn(
      "Acesso não autorizado. Faça login novamente ou verifique suas permissões.",
    );

    // Em desenvolvimento, mostrar dica útil
    if (process.env.NODE_ENV === "development") {
      console.info(
        "💡 Dica: Requisições do cliente devem passar por API Routes ou Server Actions que gerenciam autenticação",
      );
    }
  }

  /**
   * Retorna a instância do axios
   */
  public getInstance(): AxiosInstance {
    return this.instance;
  }

  /**
   * Métodos de conveniência para requisições
   */
  public get<T = unknown>(
    url: string,
    config?: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  public post<T = unknown>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  public put<T = unknown>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  public patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }

  public delete<T = unknown>(
    url: string,
    config?: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }
}

// Instância única do cliente
const axiosClient = new AxiosClient();

export default axiosClient;
export { AxiosClient };
