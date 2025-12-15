"use client";

import { Badge } from "@/components/ui/badge";
import type { ApiStatusResponse } from "@/types/api-assets";

interface ApiStatusDisplayProps {
  status: ApiStatusResponse;
}

/**
 * Client component to display API status information
 * Isolated from Server Component for static display of API data
 */
export function ApiStatusDisplay({ status }: ApiStatusDisplayProps) {
  const isOnline = status.status === "online";

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{status.name}</h3>
            <Badge
              variant={isOnline ? "default" : "destructive"}
              className={isOnline ? "bg-green-500" : ""}
            >
              {status.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Versão: {status.version} •{" "}
            {new Date(status.timestamp).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Endpoints Information */}
      <div className="space-y-2">
        <h4 className="font-medium">Endpoints Disponíveis:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span>Status:</span>
            <code className="text-blue-600">{status.endpoints.base}/file</code>
          </div>
          <div className="flex justify-between">
            <span>Upload:</span>
            <code className="text-blue-600">{status.endpoints.upload}</code>
          </div>
          <div className="flex justify-between">
            <span>Listar:</span>
            <code className="text-blue-600">{status.endpoints.list}</code>
          </div>
          <div className="flex justify-between">
            <span>Buscar:</span>
            <code className="text-blue-600">{status.endpoints.getOne}</code>
          </div>
          <div className="flex justify-between">
            <span>Deletar:</span>
            <code className="text-blue-600">{status.endpoints.delete}</code>
          </div>
          <div className="flex justify-between">
            <span>Galeria:</span>
            <code className="text-blue-600">{status.endpoints.gallery}</code>
          </div>
        </div>
      </div>

      {/* Authentication Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Autenticação:</strong> {status.endpoints.note}
        </p>
      </div>
    </div>
  );
}
