import "server-only";

import type { AxiosResponse } from "axios";
import { AxiosError } from "axios";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
} from "@/lib/constants/api-constants";
import serverAxiosClient from "./server-axios-client";

/**
 * Custom API Error classes for better error handling
 */
export class ApiConnectionError extends Error {
  constructor(message = "Não foi possível conectar à API") {
    super(message);
    this.name = "ApiConnectionError";
    Object.setPrototypeOf(this, ApiConnectionError.prototype);
  }
}

export class ApiValidationError extends Error {
  constructor(
    message = "Parâmetros inválidos",
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiValidationError";
    Object.setPrototypeOf(this, ApiValidationError.prototype);
  }
}

export class ApiAuthenticationError extends Error {
  constructor(message = "Não autorizado") {
    super(message);
    this.name = "ApiAuthenticationError";
    Object.setPrototypeOf(this, ApiAuthenticationError.prototype);
  }
}

export class ApiNotFoundError extends Error {
  constructor(message = "Recurso não encontrado") {
    super(message);
    this.name = "ApiNotFoundError";
    Object.setPrototypeOf(this, ApiNotFoundError.prototype);
  }
}

export class ApiServerError extends Error {
  constructor(
    message = "Erro interno do servidor",
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "ApiServerError";
    Object.setPrototypeOf(this, ApiServerError.prototype);
  }
}

/**
 * Interface para resposta padrão da API
 */
export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data?: T;
  recordId?: number;
  quantity?: number;
  info1?: string;
}

/**
 * Classe base para todos os serviços de API
 */
export abstract class BaseApiService {
  /**
   * Executa requisição GET
   */
  protected async get<T>(
    endpoint: string,
    config?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await serverAxiosClient.get(
        endpoint,
        config,
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Executa requisição POST
   */
  protected async post<T>(
    endpoint: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await serverAxiosClient.post(
        endpoint,
        data,
        config,
      );

      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Executa requisição PUT
   */
  protected async put<T>(
    endpoint: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await serverAxiosClient.put(
        endpoint,
        data,
        config,
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Executa requisição PATCH
   */
  protected async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await serverAxiosClient.patch(
        endpoint,
        data,
        config,
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Executa requisição DELETE
   */
  protected async delete<T>(
    endpoint: string,
    config?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await serverAxiosClient.delete(
        endpoint,
        config,
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verifica se a resposta tem a estrutura esperada da API
   */
  private isApiResponse<T>(data: unknown): data is ApiResponse<T> {
    return (
      data !== null &&
      typeof data === "object" &&
      "statusCode" in data &&
      "message" in data &&
      typeof (data as Record<string, unknown>).statusCode === "number" &&
      typeof (data as Record<string, unknown>).message === "string"
    );
  }

  /**
   * Trata resposta da API
   */
  private handleResponse<T>(response: AxiosResponse<T>): T {
    // Verifica se a resposta tem a estrutura esperada da API
    if (this.isApiResponse<T>(response.data)) {
      const apiResponse = response.data;

      // Para casos especiais como "not found" mas com dados válidos
      if (
        apiResponse.message &&
        (apiResponse.message.includes("not found") ||
          apiResponse.message.includes("não encontrado")) &&
        apiResponse.data &&
        Array.isArray(apiResponse.data) &&
        apiResponse.data.length > 0
      ) {
        // Retorna a resposta mesmo com mensagem "not found" se há dados
        return response.data;
      }

      // Para código 100422 (Product not found), permite que o serviço específico trate
      if (apiResponse.statusCode === API_STATUS_CODES.NOT_FOUND) {
        // Retorna a resposta para que o serviço específico possa tratar
        return response.data;
      }

      // Verifica se o statusCode indica sucesso usando função utilitária
      if (isApiError(apiResponse.statusCode)) {
        throw new Error(apiResponse.message || "Erro na resposta da API");
      }
    }

    return response.data;
  }

  /**
   * Trata erros das requisições
   */
  private handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      // Erro de resposta HTTP
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        // Se a resposta tem estrutura da API
        if (data && typeof data === "object" && "message" in data) {
          // Retorna erro específico baseado no status
          switch (status) {
            case 400:
              return new ApiValidationError(
                data.message || "Requisição inválida",
              );
            case 401:
            case 403:
              return new ApiAuthenticationError(
                data.message || "Não autorizado",
              );
            case 404:
              return new ApiNotFoundError(
                data.message || "Recurso não encontrado",
              );
            case 500:
            case 502:
            case 503:
            case 504:
              return new ApiServerError(
                data.message || "Erro interno do servidor",
                status,
              );
            default:
              return new Error(data.message || "Erro na API");
          }
        }

        // Mensagens padrão por código de status (sem estrutura da API)
        switch (status) {
          case 400:
            return new ApiValidationError("Requisição inválida");
          case 401:
          case 403:
            return new ApiAuthenticationError("Não autorizado");
          case 404:
            return new ApiNotFoundError("Recurso não encontrado");
          case 500:
          case 502:
          case 503:
          case 504:
            return new ApiServerError("Erro interno do servidor", status);
          default:
            return new Error(`Erro HTTP ${status}`);
        }
      }

      // Erro de requisição (sem resposta)
      if (error.request) {
        return new ApiConnectionError("Erro de conexão com a API");
      }

      // Erro de configuração
      return new Error("Erro na configuração da requisição");
    }

    // Erro genérico
    if (error instanceof Error) {
      return error;
    }

    return new Error("Erro desconhecido");
  }

  /**
   * Monta payload padrão para requisições
   */
  protected buildPayload(
    data: Record<string, unknown>,
    additionalFields?: Record<string, unknown>,
  ): Record<string, unknown> {
    return {
      ...data,
      ...additionalFields,
    };
  }

  /**
   * Valida se uma resposta da API é válida
   */
  protected isValidApiResponse<T>(response: ApiResponse<T>): boolean {
    return isApiSuccess(response.statusCode);
  }

  /**
   * Extrai dados da resposta da API
   */
  protected extractData<T>(response: ApiResponse<T>): T | null {
    return response.data || null;
  }

  /**
   * Extrai mensagem da resposta da API
   */
  protected extractMessage<T>(response: ApiResponse<T>): string {
    return response.message || "";
  }
}
