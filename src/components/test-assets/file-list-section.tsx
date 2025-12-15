"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Filter,
  Image,
  Loader2,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { listFilesAction } from "@/app/actions/action-test-assets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  FileAsset,
  FileStatus,
  ListFilesResponse,
} from "@/types/api-assets";
import {
  ENTITY_TYPE_LABELS,
  FILE_STATUS_LABELS,
  FILE_TYPE_LABELS,
} from "@/types/api-assets";

// Validation schema for list filters
const listFiltersSchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  fileType: z.string().optional(),
  status: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

type ListFiltersValues = z.infer<typeof listFiltersSchema>;

/**
 * Client component for listing files with filters
 * Isolated interactive component for browsing files from the external API
 */
export function FileListSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [listResult, setListResult] = useState<ListFilesResponse | null>(null);

  const form = useForm<ListFiltersValues>({
    resolver: zodResolver(listFiltersSchema),
    defaultValues: {
      entityType: undefined,
      entityId: "",
      fileType: undefined,
      status: undefined,
      page: 1,
      limit: 20,
    },
  });

  const onSubmit = async (data: ListFiltersValues) => {
    setIsLoading(true);
    setListResult(null);

    try {
      // Remove empty values
      const filters = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== "" && value !== undefined,
        ),
      );

      const result = await listFilesAction(filters);

      if (result.success && result.data) {
        setListResult(result.data);
        toast.success(`${result.data.data.length} arquivo(s) encontrado(s)`);
      } else {
        toast.error(result.error || "Erro ao listar arquivos");
      }
    } catch (error) {
      toast.error("Erro ao listar arquivos");
      console.error("List files error:", error);
    } finally {
      setIsLoading(false);
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

  const getStatusBadgeVariant = (status: FileStatus) => {
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
      {/* Filters Form */}
      <Card className="p-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4" />
            <h4 className="font-medium">Filtros de Busca</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Entity Type */}
            <div className="space-y-2">
              <Label htmlFor="entityType">Tipo de Entidade</Label>
              <Select
                value={form.watch("entityType") || undefined}
                onValueChange={(value) =>
                  form.setValue(
                    "entityType",
                    value === "all" ? undefined : value,
                  )
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(ENTITY_TYPE_LABELS).map(([key, _label]) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity ID */}
            <div className="space-y-2">
              <Label htmlFor="entityId">ID da Entidade</Label>
              <Input
                id="entityId"
                {...form.register("entityId")}
                placeholder="ID da entidade (qualquer string)"
                disabled={isLoading}
              />
            </div>

            {/* File Type */}
            <div className="space-y-2">
              <Label htmlFor="fileType">Tipo de Arquivo</Label>
              <Select
                value={form.watch("fileType") || undefined}
                onValueChange={(value) =>
                  form.setValue(
                    "entityType",
                    value === "all" ? undefined : value,
                  )
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(FILE_TYPE_LABELS).map(([key, _label]) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status") || undefined}
                onValueChange={(value) =>
                  form.setValue("status", value === "all" ? undefined : value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(FILE_STATUS_LABELS).map(([key, _label]) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Page */}
            <div className="space-y-2">
              <Label htmlFor="page">Página</Label>
              <Input
                id="page"
                type="number"
                min="1"
                {...form.register("page")}
                disabled={isLoading}
              />
            </div>

            {/* Limit */}
            <div className="space-y-2">
              <Label htmlFor="limit">Itens por página</Label>
              <Input
                id="limit"
                type="number"
                min="1"
                max="100"
                {...form.register("limit")}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar Arquivos
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Results */}
      {listResult && (
        <Card className="p-4">
          <div className="space-y-4">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Resultados da Busca</h4>
              <div className="text-sm text-muted-foreground">
                {listResult.data.length} de {listResult.total} arquivos (página{" "}
                {listResult.page})
              </div>
            </div>

            {/* Results Table */}
            {listResult.data.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Arquivo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Upload</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listResult.data.map((file: FileAsset) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.fileType)}
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {file.originalName}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {file.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{file.fileType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{file.entityType}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {file.entityId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatFileSize(file.fileSize)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(file.status)}>
                            {file.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(file.uploadedAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </TableCell>
                        <TableCell>
                          {file.urls.original && (
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={file.urls.original}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum arquivo encontrado com os filtros aplicados
              </div>
            )}

            {/* Pagination Info */}
            {listResult.total > listResult.limit && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  Mostrando {(listResult.page - 1) * listResult.limit + 1} a{" "}
                  {Math.min(
                    listResult.page * listResult.limit,
                    listResult.total,
                  )}{" "}
                  de {listResult.total} resultados
                </div>
                <div>
                  Página {listResult.page} de{" "}
                  {Math.ceil(listResult.total / listResult.limit)}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
