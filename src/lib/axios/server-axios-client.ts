import "server-only";

import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import axios from "axios";
import { envs } from "@/core/config";
import {
  API_TIMEOUTS,
  DEFAULT_HEADERS,
  EXTERNAL_API_BASE_URL,
  RETRY_CONFIG,
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
 * Cliente Axios configurado para uso no servidor (Server Components e API Routes)
 * Usa API_KEY do projeto para autenticação
 */
class ServerAxiosClient {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = EXTERNAL_API_BASE_URL;
    this.apiKey = envs.API_KEY || "";

    // Only warn in server environment, not during client bundle
    if (!this.apiKey && typeof window === "undefined") {
      console.warn("⚠️  Atenção: API_KEY não configurada no servidor");
    }
  }

  /**
   * Cria uma instância axios com configuração da API_KEY
   */
  private createInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: this.baseURL,
      timeout: API_TIMEOUTS.SERVER_DEFAULT,
      headers: {
        ...DEFAULT_HEADERS,
        Accept: "application/json",
        "Cache-Control": "no-cache",
        "User-Agent": "NextJS-Server/1.0",
      },
    });

    this.setupInterceptors(instance);
    return instance;
  }

  /**
   * Configura interceptors para a instância
   */
  private setupInterceptors(instance: AxiosInstance): void {
    // Interceptor para requisições
    instance.interceptors.request.use(
      (config) => {
        // Adicionar timestamp de início e contagem de retry
        config.metadata = {
          startTime: Date.now(),
          retryCount: config.metadata?.retryCount || 0,
        };

        // Adicionar API_KEY ao header Authorization
        if (this.apiKey) {
          config.headers.Authorization = `Bearer ${this.apiKey}`;
        }

        return config;
      },
      (error) => {
        console.error(
          `[${new Date().toISOString()}] [Server Request Error]`,
          error,
        );
        return Promise.reject(error);
      },
    );

    // Interceptor para respostas
    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        // Calcular duração da requisição com erro
        const duration = error.config?.metadata?.startTime
          ? Date.now() - error.config.metadata.startTime
          : null;

        // Log estruturado de erros do servidor
        console.error(`[${new Date().toISOString()}] [Server API Error]`, {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          duration: duration ? `${duration}ms` : "unknown",
          data: error.response?.data,
          retryCount: error.config?.metadata?.retryCount || 0,
        });

        // Implementar retry logic
        const retryCount = error.config?.metadata?.retryCount || 0;
        const shouldRetry =
          error.config &&
          retryCount < RETRY_CONFIG.MAX_RETRIES &&
          this.shouldRetryRequest(error);

        if (shouldRetry && error.config) {
          // Incrementar contagem de retry
          error.config.metadata = {
            ...error.config.metadata,
            startTime: Date.now(),
            retryCount: retryCount + 1,
          };

          // Calcular delay exponencial: 1s, 2s, 4s, etc.
          const delay = RETRY_CONFIG.RETRY_DELAY * 2 ** retryCount;

          console.warn(
            `[${new Date().toISOString()}] 🔄 Retry ${retryCount + 1}/${RETRY_CONFIG.MAX_RETRIES} em ${delay}ms para ${error.config.url}`,
          );

          // Aguardar antes de fazer retry
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Fazer retry da requisição
          return instance.request(error.config);
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * Métodos de requisição
   */
  public get<T = unknown>(
    url: string,
    config?: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    const instance = this.createInstance();
    return instance.get<T>(url, config);
  }

  public post<T = unknown>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    const instance = this.createInstance();
    return instance.post<T>(url, data, config);
  }

  public put<T = unknown>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    const instance = this.createInstance();
    return instance.put<T>(url, data, config);
  }

  public patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    const instance = this.createInstance();
    return instance.patch<T>(url, data, config);
  }

  public delete<T = unknown>(
    url: string,
    config?: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    const instance = this.createInstance();
    return instance.delete<T>(url, config);
  }

  /**
   * Métodos utilitários
   */
  public getApiKey(): string {
    return this.apiKey;
  }

  public isApiKeyConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  /**
   * Determina se deve fazer retry da requisição
   */
  private shouldRetryRequest(error: AxiosError): boolean {
    // Retry apenas para métodos idempotentes
    const idempotentMethods = ["GET", "HEAD", "OPTIONS", "PUT", "DELETE"];
    const method = error.config?.method?.toUpperCase();

    if (!method || !idempotentMethods.includes(method)) {
      return false;
    }

    // Retry para erros de rede (sem resposta)
    if (!error.response) {
      return true;
    }

    // Retry para códigos de status específicos
    const status = error.response.status;
    return (RETRY_CONFIG.RETRY_CODES as readonly number[]).includes(status);
  }
}

// Instância única do cliente servidor
const serverAxiosClient = new ServerAxiosClient();

export default serverAxiosClient;
export { ServerAxiosClient };
