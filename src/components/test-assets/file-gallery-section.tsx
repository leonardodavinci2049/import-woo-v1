"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ExternalLink,
  Image as ImageIcon,
  Images,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { getEntityGalleryAction } from "@/app/actions/action-test-assets";
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
import type {
  EntityGalleryResponse,
  EntityType,
  GalleryImage,
} from "@/types/api-assets";
import { ENTITY_TYPE_LABELS } from "@/types/api-assets";

// Validation schema for gallery request
const galleryRequestSchema = z.object({
  entityType: z.string().min(1, "Tipo de entidade é obrigatório"),
  entityId: z.string().min(1, "ID da entidade é obrigatório"),
});

type GalleryRequestValues = z.infer<typeof galleryRequestSchema>;

/**
 * Client component for entity gallery functionality
 * Isolated interactive component for viewing entity galleries (max 7 images)
 */
export function FileGallerySection() {
  const [isLoading, setIsLoading] = useState(false);
  const [galleryResult, setGalleryResult] =
    useState<EntityGalleryResponse | null>(null);

  const form = useForm<GalleryRequestValues>({
    resolver: zodResolver(galleryRequestSchema),
    defaultValues: {
      entityType: "PRODUCT",
      entityId: "produto-exemplo-123", // Default test ID
    },
  });

  const onSubmit = async (data: GalleryRequestValues) => {
    setIsLoading(true);
    setGalleryResult(null);

    try {
      const result = await getEntityGalleryAction({
        entityType: data.entityType as EntityType,
        entityId: data.entityId,
      });

      if (result.success && result.data) {
        setGalleryResult(result.data);
        toast.success(
          `Galeria carregada: ${result.data.images.length} imagem(ns) de ${result.data.totalImages} total`,
        );
      } else {
        toast.error(result.error || "Erro ao carregar galeria");
      }
    } catch (error) {
      toast.error("Erro ao carregar galeria");
      console.error("Gallery error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Gallery Request Form */}
      <Card className="p-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Images className="h-4 w-4" />
            <h4 className="font-medium">Buscar Galeria de Entidade</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Entity Type */}
            <div className="space-y-2">
              <Label htmlFor="entityType">Tipo de Entidade</Label>
              <Select
                value={form.watch("entityType")}
                onValueChange={(value) => form.setValue("entityType", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de entidade" />
                </SelectTrigger>
                <SelectContent>
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
                placeholder="produto-123 ou categoria-abc"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando galeria...
              </>
            ) : (
              <>
                <Images className="mr-2 h-4 w-4" />
                Carregar Galeria
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Gallery Results */}
      {galleryResult && (
        <Card className="p-4">
          <div className="space-y-4">
            {/* Gallery Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Galeria da Entidade</h4>
                <p className="text-sm text-muted-foreground">
                  {galleryResult.entityType}: {galleryResult.entityId}
                </p>
              </div>
              <Badge variant="outline">
                {galleryResult.images.length} de {galleryResult.totalImages}{" "}
                imagens
              </Badge>
            </div>

            {/* Gallery Images */}
            {galleryResult.images.length > 0 ? (
              <div className="space-y-4">
                {/* Main Image (first in array) */}
                {galleryResult.images[0] && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Imagem Principal</h5>
                    <GalleryImageCard
                      image={galleryResult.images[0]}
                      isPrimary={true}
                    />
                  </div>
                )}

                {/* Additional Images (rest of array) */}
                {galleryResult.images.length > 1 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">
                      Imagens Adicionais ({galleryResult.images.length - 1})
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {galleryResult.images.slice(1).map((image, _index) => (
                        <GalleryImageCard
                          key={image.id}
                          image={image}
                          isPrimary={false}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Gallery Info */}
                <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded">
                  <p>
                    <strong>📸 Informações da Galeria:</strong>
                  </p>
                  <p>
                    • Máximo de 7 imagens por galeria (otimizado para
                    e-commerce)
                  </p>
                  <p>• Primeira imagem é considerada a principal</p>
                  <p>• Ordenação por data de upload</p>
                  <p>
                    • Múltiplas versões disponíveis: original, preview, medium,
                    thumbnail
                  </p>
                  {galleryResult.totalImages > 7 && (
                    <p>
                      • Esta entidade possui {galleryResult.totalImages} imagens
                      no total
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma imagem encontrada para esta entidade</p>
                <p className="text-sm">
                  Total de imagens: {galleryResult.totalImages}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Usage Examples */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>💡 Exemplos de Uso:</strong>
        </p>
        <p>
          • <strong>E-commerce:</strong> Galeria de produtos com imagem
          principal + detalhes
        </p>
        <p>
          • <strong>Perfis:</strong> Avatar + fotos adicionais do usuário
        </p>
        <p>
          • <strong>Categorias:</strong> Banner principal + imagens
          representativas
        </p>
        <p>
          • <strong>Artigos:</strong> Imagem destacada + galeria do conteúdo
        </p>
      </div>
    </div>
  );
}

/**
 * Component for individual gallery image display
 */
interface GalleryImageCardProps {
  image: GalleryImage;
  isPrimary: boolean;
}

function GalleryImageCard({ image, isPrimary }: GalleryImageCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className={`p-3 ${isPrimary ? "border-blue-200 bg-blue-50" : ""}`}>
      <div className="space-y-3">
        {/* Image Preview */}
        <div className="relative aspect-video bg-gray-100 rounded overflow-hidden">
          {!imageError ? (
            <Image
              src={
                image.urls.thumbnail ||
                image.urls.preview ||
                image.urls.original
              }
              alt={image.originalName}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <ImageIcon className="h-8 w-8" />
            </div>
          )}
          {isPrimary && (
            <Badge className="absolute top-2 left-2 bg-blue-600">
              Principal
            </Badge>
          )}
        </div>

        {/* Image Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h6 className="font-medium text-sm truncate">
              {image.originalName}
            </h6>
            <Badge variant="outline" className="text-xs">
              {new Date(image.uploadedAt).toLocaleDateString("pt-BR")}
            </Badge>
          </div>

          {/* Tags */}
          {image.tags && image.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {image.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Available Versions */}
          <div className="flex flex-wrap gap-1">
            {Object.entries(image.urls).map(([version, url]) => (
              <Button
                key={version}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                asChild
              >
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {version}
                  <ExternalLink className="h-2 w-2 ml-1" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
