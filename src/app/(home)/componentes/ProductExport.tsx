"use client";

import { Loader2, Upload } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { exportProductImagesAction } from "@/app/actions/action-export-product-images";
import { Button } from "@/components/ui/button";

interface ProductExportProps {
  productId: number;
}

export function ProductExport({ productId }: ProductExportProps) {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      const response = await exportProductImagesAction(productId);

      if (response.success) {
        // Feedback based on results
        if (response.totalUploaded === 0 && response.totalSkipped > 0) {
          toast.info(
            `Todas as ${response.totalSkipped} imagens já foram exportadas anteriormente.`,
          );
        } else if (response.totalSkipped > 0) {
          toast.success(
            `Exportação concluída! ${response.totalUploaded} enviadas, ${response.totalSkipped} já existiam.`,
          );
        } else if (response.totalUploaded > 0) {
          toast.success(
            `Exportação concluída! ${response.totalUploaded} ${response.totalUploaded === 1 ? "imagem enviada" : "imagens enviadas"}.`,
          );
        } else if (response.totalNotFound > 0) {
          toast.warning(
            `Nenhuma imagem encontrada no disco (${response.totalNotFound} arquivos ausentes).`,
          );
        } else {
          toast.info("Nenhuma imagem para exportar.");
        }
      } else {
        toast.error(response.errors[0] || "Erro ao exportar imagens");
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Upload className="mr-2 h-4 w-4" />
          Exportar
        </>
      )}
    </Button>
  );
}
