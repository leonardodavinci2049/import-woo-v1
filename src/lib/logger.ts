/**
 * Sistema de logging com suporte a níveis e filtragem por ambiente
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerOptions {
  context?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private context: string;
  private isDevelopment: boolean;

  constructor(context: string) {
    this.context = context;
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  /**
   * Log de debug - apenas em desenvolvimento
   */
  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      this.log("debug", message, data);
    }
  }

  /**
   * Log de informação - sempre exibido
   */
  info(message: string, data?: unknown): void {
    this.log("info", message, data);
  }

  /**
   * Log de aviso - sempre exibido
   */
  warn(message: string, data?: unknown): void {
    this.log("warn", message, data);
  }

  /**
   * Log de erro - sempre exibido
   */
  error(message: string, error?: unknown): void {
    this.log("error", message, error);
  }

  /**
   * Método interno de logging
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;

    switch (level) {
      case "debug":
        console.debug(prefix, message, data !== undefined ? data : "");
        break;
      case "info":
        console.info(prefix, message, data !== undefined ? data : "");
        break;
      case "warn":
        console.warn(prefix, message, data !== undefined ? data : "");
        break;
      case "error":
        console.error(prefix, message, data !== undefined ? data : "");
        break;
    }
  }

  /**
   * Log estruturado para dados sensíveis em produção
   */
  logSafe(level: LogLevel, message: string, options: LoggerOptions = {}): void {
    const { metadata = {} } = options;

    // Em produção, não logar dados sensíveis completos
    const safeMetadata = this.isDevelopment
      ? metadata
      : this.sanitizeMetadata(metadata);

    this.log(level, message, safeMetadata);
  }

  /**
   * Remove informações sensíveis dos metadados
   */
  private sanitizeMetadata(
    metadata: Record<string, unknown>,
  ): Record<string, unknown> {
    const sensitiveKeys = [
      "password",
      "token",
      "apiKey",
      "secret",
      "authorization",
    ];

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (
        sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))
      ) {
        sanitized[key] = "***REDACTED***";
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeMetadata(
          value as Record<string, unknown>,
        );
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

/**
 * Factory function para criar instâncias de logger
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}
