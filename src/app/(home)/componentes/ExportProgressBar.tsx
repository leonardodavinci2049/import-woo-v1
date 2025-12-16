"use client";

import { cn } from "@/lib/utils";
import type { ExportBatchProgress } from "@/types/product-export";

export interface ExportProgressBarProps {
  progress: ExportBatchProgress;
  isVisible: boolean;
}

export function ExportProgressBar({
  progress,
  isVisible,
}: ExportProgressBarProps) {
  const percentage =
    progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;

  const statusMessages = {
    preparing: "Preparando exportação...",
    uploading: "Enviando imagens...",
    saving: "Salvando dados no banco...",
    completed: "Exportação concluída!",
    error: "Erro na exportação",
  };

  const statusColors = {
    preparing: "bg-blue-500",
    uploading: "bg-blue-600",
    saving: "bg-green-500",
    completed: "bg-green-600",
    error: "bg-red-600",
  };

  return (
    <div
      className={cn(
        "transition-all duration-300 w-full",
        isVisible
          ? "opacity-100 visible max-h-24"
          : "opacity-0 invisible max-h-0 overflow-hidden",
      )}
    >
      <div className="space-y-2 p-4 bg-card rounded-lg border">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-muted-foreground">
            Processando {progress.processed} de {progress.total} produtos
          </span>
          <span className="text-foreground">{Math.round(percentage)}%</span>
        </div>

        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              statusColors[progress.status],
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {progress.message || statusMessages[progress.status]}
        </p>
      </div>
    </div>
  );
}
