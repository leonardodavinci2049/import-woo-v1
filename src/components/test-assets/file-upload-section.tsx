"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileSpreadsheet,
  FileText,
  Image,
  Loader2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { uploadFileAction } from "@/app/actions/action-test-assets";
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
import { Textarea } from "@/components/ui/textarea";
import type { FileAsset } from "@/types/api-assets";
import { ALL_SUPPORTED_TYPES, ENTITY_TYPE_LABELS } from "@/types/api-assets";

// Validation schema for upload form
const uploadSchema = z.object({
  file: z.any().refine((file) => file instanceof File, "Arquivo é obrigatório"),
  entityType: z.string().min(1, "Tipo de entidade é obrigatório"),
  entityId: z.string().min(1, "ID da entidade é obrigatório"),
  tags: z.string().optional(),
  description: z.string().optional(),
  altText: z.string().optional(),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

/**
 * Client component for file upload functionality
 * Isolated interactive component for uploading files to the external API
 */
export function FileUploadSection() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<FileAsset | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      entityType: "PRODUCT",
      entityId: "produto-exemplo-123", // Default test ID
      tags: "",
      description: "",
      altText: "",
    },
  });

  const onSubmit = async (data: UploadFormValues) => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo para upload");
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("entityType", data.entityType);
      formData.append("entityId", data.entityId);
      if (data.tags) formData.append("tags", data.tags);
      if (data.description) formData.append("description", data.description);
      if (data.altText) formData.append("altText", data.altText);

      const result = await uploadFileAction(formData);

      if (result.success && result.data) {
        setUploadResult(result.data);
        toast.success("Arquivo enviado com sucesso!");
        form.reset();
        setSelectedFile(null);
      } else {
        toast.error(result.error || "Erro ao enviar arquivo");
      }
    } catch (error) {
      toast.error("Erro ao enviar arquivo");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (
        !ALL_SUPPORTED_TYPES.includes(
          file.type as (typeof ALL_SUPPORTED_TYPES)[number],
        )
      ) {
        toast.error("Tipo de arquivo não suportado");
        event.target.value = "";
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande (máximo 10MB)");
        event.target.value = "";
        return;
      }

      setSelectedFile(file);
      form.setValue("file", file);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (
      type.includes("spreadsheet") ||
      type.includes("excel") ||
      type.includes("csv")
    )
      return <FileSpreadsheet className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* File Input */}
        <div className="space-y-2">
          <Label htmlFor="file">Arquivo</Label>
          <Input
            id="file"
            type="file"
            accept={ALL_SUPPORTED_TYPES.join(",")}
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              {getFileIcon(selectedFile.type)}
              <span className="text-sm">{selectedFile.name}</span>
              <Badge variant="outline">
                {formatFileSize(selectedFile.size)}
              </Badge>
            </div>
          )}
        </div>

        {/* Entity Type */}
        <div className="space-y-2">
          <Label htmlFor="entityType">Tipo de Entidade</Label>
          <Select
            value={form.watch("entityType")}
            onValueChange={(value) => form.setValue("entityType", value)}
            disabled={isUploading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de entidade" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ENTITY_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {key} ({label})
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
            placeholder="produto-123 ou categoria-abc"
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground">
            ID da entidade à qual o arquivo será associado (aceita qualquer
            string válida)
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (opcional)</Label>
          <Input
            id="tags"
            {...form.register("tags")}
            placeholder="imagem, produto, principal"
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground">
            Tags separadas por vírgula para categorização
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            {...form.register("description")}
            placeholder="Descrição do arquivo..."
            disabled={isUploading}
          />
        </div>

        {/* Alt Text */}
        <div className="space-y-2">
          <Label htmlFor="altText">Texto Alternativo (opcional)</Label>
          <Input
            id="altText"
            {...form.register("altText")}
            placeholder="Texto alternativo para acessibilidade"
            disabled={isUploading}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isUploading || !selectedFile}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Enviar Arquivo
            </>
          )}
        </Button>
      </form>

      {/* Upload Result */}
      {uploadResult && (
        <Card className="p-4 bg-green-50 border-green-200">
          <h4 className="font-medium text-green-900 mb-2">
            ✅ Upload realizado com sucesso!
          </h4>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <strong>ID:</strong> {uploadResult.id}
              </div>
              <div>
                <strong>Nome:</strong> {uploadResult.originalName}
              </div>
              <div>
                <strong>Tipo:</strong> {uploadResult.fileType}
              </div>
              <div>
                <strong>Tamanho:</strong>{" "}
                {formatFileSize(uploadResult.fileSize)}
              </div>
              <div>
                <strong>Status:</strong> {uploadResult.status}
              </div>
              <div>
                <strong>Upload:</strong>{" "}
                {new Date(uploadResult.uploadedAt).toLocaleString("pt-BR")}
              </div>
            </div>
            {uploadResult.urls.original && (
              <div className="mt-3">
                <strong>URL:</strong>{" "}
                <a
                  href={uploadResult.urls.original}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {uploadResult.urls.original}
                </a>
              </div>
            )}
            {uploadResult.tags && uploadResult.tags.length > 0 && (
              <div className="flex gap-1 mt-2">
                {uploadResult.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Supported File Types */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Tipos suportados:</strong>
        </p>
        <p>
          • <strong>Imagens:</strong> JPG, PNG, GIF, WebP
        </p>
        <p>
          • <strong>Documentos:</strong> PDF, DOC, DOCX
        </p>
        <p>
          • <strong>Planilhas:</strong> XLS, XLSX, CSV
        </p>
        <p>
          • <strong>Tamanho máximo:</strong> 10MB
        </p>
      </div>
    </div>
  );
}
