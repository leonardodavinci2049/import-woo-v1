"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Image,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  deleteFileAction,
  findFileAction,
} from "@/app/actions/action-test-assets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { FileAsset } from "@/types/api-assets";

// Validation schemas
const findFileSchema = z.object({
  id: z.string().min(1, "ID do arquivo é obrigatório"),
});

const deleteFileSchema = z.object({
  id: z.string().min(1, "ID do arquivo é obrigatório"),
});

type FindFileValues = z.infer<typeof findFileSchema>;
type DeleteFileValues = z.infer<typeof deleteFileSchema>;

/**
 * Client component for file actions (find and delete)
 * Isolated interactive component for performing individual file operations
 */
export function FileActionsSection() {
  const [isLoadingFind, setIsLoadingFind] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [fileResult, setFileResult] = useState<FileAsset | null>(null);
  const [deleteResult, setDeleteResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const findForm = useForm<FindFileValues>({
    resolver: zodResolver(findFileSchema),
    defaultValues: {
      id: "",
    },
  });

  const deleteForm = useForm<DeleteFileValues>({
    resolver: zodResolver(deleteFileSchema),
    defaultValues: {
      id: "",
    },
  });

  const onFind = async (data: FindFileValues) => {
    setIsLoadingFind(true);
    setFileResult(null);
    setDeleteResult(null);

    try {
      const result = await findFileAction(data);

      if (result.success && result.data) {
        setFileResult(result.data);
        toast.success("Arquivo encontrado!");
        // Auto-fill delete form with found file ID
        deleteForm.setValue("id", result.data.id);
      } else {
        toast.error(result.error || "Arquivo não encontrado");
      }
    } catch (error) {
      toast.error("Erro ao buscar arquivo");
      console.error("Find file error:", error);
    } finally {
      setIsLoadingFind(false);
    }
  };

  const onDelete = async (data: DeleteFileValues) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este arquivo? Esta ação não pode ser desfeita.",
      )
    ) {
      return;
    }

    setIsLoadingDelete(true);
    setDeleteResult(null);

    try {
      const result = await deleteFileAction(data);

      if (result.success && result.data) {
        setDeleteResult({ success: true, message: result.data.message });
        toast.success("Arquivo excluído com sucesso!");
        // Clear forms and results after successful delete
        findForm.reset();
        deleteForm.reset();
        setFileResult(null);
      } else {
        setDeleteResult({
          success: false,
          message: result.error || "Erro ao excluir arquivo",
        });
        toast.error(result.error || "Erro ao excluir arquivo");
      }
    } catch (error) {
      const errorMessage = "Erro ao excluir arquivo";
      setDeleteResult({ success: false, message: errorMessage });
      toast.error(errorMessage);
      console.error("Delete file error:", error);
    } finally {
      setIsLoadingDelete(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type === "IMAGE") return <Image className="h-4 w-4" />;
    if (type === "SPREADSHEET") return <FileSpreadsheet className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "PROCESSING":
        return "secondary";
      case "ARCHIVED":
        return "outline";
      case "DELETED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Find File Section */}
      <Card className="p-4">
        <form onSubmit={findForm.handleSubmit(onFind)} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4" />
            <h4 className="font-medium">Buscar Arquivo por ID</h4>
          </div>

          <div className="space-y-2">
            <Label htmlFor="findId">ID do Arquivo (UUID)</Label>
            <Input
              id="findId"
              {...findForm.register("id")}
              placeholder="123e4567-e89b-12d3-a456-426614174000"
              disabled={isLoadingFind}
            />
            <p className="text-xs text-muted-foreground">
              Digite o UUID do arquivo para obter informações detalhadas
            </p>
          </div>

          <Button type="submit" disabled={isLoadingFind} className="w-full">
            {isLoadingFind ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar Arquivo
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* File Details Result */}
      {fileResult && (
        <Card className="p-4 bg-green-50 border-green-200">
          <h4 className="font-medium text-green-900 mb-4">
            ✅ Arquivo Encontrado
          </h4>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getFileIcon(fileResult.fileType)}
                  <h5 className="font-medium">{fileResult.originalName}</h5>
                  <Badge variant={getStatusBadgeVariant(fileResult.status)}>
                    {fileResult.status}
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>ID:</strong>{" "}
                    <code className="text-blue-600">{fileResult.id}</code>
                  </p>
                  <p>
                    <strong>Tipo:</strong> {fileResult.fileType}
                  </p>
                  <p>
                    <strong>MIME:</strong> {fileResult.mimeType}
                  </p>
                  <p>
                    <strong>Tamanho:</strong>{" "}
                    {formatFileSize(fileResult.fileSize)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h6 className="font-medium">Entidade Associada</h6>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Tipo:</strong> {fileResult.entityType}
                  </p>
                  <p>
                    <strong>ID:</strong>{" "}
                    <code className="text-blue-600">{fileResult.entityId}</code>
                  </p>
                  <p>
                    <strong>Upload:</strong>{" "}
                    {new Date(fileResult.uploadedAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {fileResult.tags && fileResult.tags.length > 0 && (
              <div className="space-y-2">
                <h6 className="font-medium">Tags</h6>
                <div className="flex flex-wrap gap-1">
                  {fileResult.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description and Alt Text */}
            {(fileResult.description || fileResult.altText) && (
              <div className="space-y-2">
                {fileResult.description && (
                  <div>
                    <h6 className="font-medium">Descrição</h6>
                    <p className="text-sm text-muted-foreground">
                      {fileResult.description}
                    </p>
                  </div>
                )}
                {fileResult.altText && (
                  <div>
                    <h6 className="font-medium">Texto Alternativo</h6>
                    <p className="text-sm text-muted-foreground">
                      {fileResult.altText}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Versions */}
            <div className="space-y-2">
              <h6 className="font-medium">
                Versões Disponíveis ({fileResult.versions.length})
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {fileResult.versions.map((version, _index) => (
                  <div
                    key={version.versionType}
                    className="text-sm bg-white p-2 rounded border"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{version.versionType}</span>
                      <Badge variant="outline">
                        {formatFileSize(version.fileSize)}
                      </Badge>
                    </div>
                    {version.width && version.height && (
                      <p className="text-xs text-muted-foreground">
                        {version.width} x {version.height}px
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* URLs */}
            <div className="space-y-2">
              <h6 className="font-medium">URLs de Acesso</h6>
              <div className="space-y-1">
                {Object.entries(fileResult.urls).map(([version, url]) => (
                  <div
                    key={version}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium capitalize">{version}:</span>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Abrir
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* JSON Response Section */}
            <div className="space-y-2">
              <h6 className="font-medium text-blue-900">
                JSON de Retorno da API
              </h6>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs leading-relaxed">
                  <code>{JSON.stringify(fileResult, null, 2)}</code>
                </pre>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(fileResult, null, 2),
                    );
                    toast.success("JSON copiado para a área de transferência!");
                  }}
                >
                  Copiar JSON
                </Button>
                <p className="text-xs text-muted-foreground">
                  Resposta completa do endpoint POST /file/v1/find-file
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
      <Separator />
      {/* Delete File Section */}
      <Card className="p-4 border-red-200">
        <form
          onSubmit={deleteForm.handleSubmit(onDelete)}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="h-4 w-4 text-red-600" />
            <h4 className="font-medium text-red-900">Excluir Arquivo</h4>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deleteId">ID do Arquivo (UUID)</Label>
            <Input
              id="deleteId"
              {...deleteForm.register("id")}
              placeholder="123e4567-e89b-12d3-a456-426614174000"
              disabled={isLoadingDelete}
            />
            <p className="text-xs text-red-600">
              ⚠️ Atenção: Esta operação é irreversível!
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoadingDelete}
            variant="destructive"
            className="w-full"
          >
            {isLoadingDelete ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Arquivo
              </>
            )}
          </Button>
        </form>
      </Card>
      {/* Delete Result */}
      {deleteResult && (
        <Card
          className={`p-4 ${deleteResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
        >
          <h4
            className={`font-medium mb-2 ${deleteResult.success ? "text-green-900" : "text-red-900"}`}
          >
            {deleteResult.success
              ? "✅ Arquivo Excluído"
              : "❌ Erro na Exclusão"}
          </h4>
          <p
            className={`text-sm ${deleteResult.success ? "text-green-800" : "text-red-800"}`}
          >
            {deleteResult.message}
          </p>
        </Card>
      )}
      {/* Usage Tips */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>💡 Dicas de Uso:</strong>
        </p>
        <p>
          • Use o botão "Buscar Arquivo" primeiro para verificar os detalhes
        </p>
        <p>• O ID será preenchido automaticamente no formulário de exclusão</p>
        <p>• A exclusão requer confirmação adicional por segurança</p>
        <p>• Copie o ID dos arquivos da aba "Listar Arquivos" se necessário</p>
      </div>
    </div>
  );
}
