"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { exportAllProductsImagesAction } from "@/app/actions/action-export-all-products-images";
import type { ExportBatchProgress } from "@/types/product-export";

interface Product {
  product_id: number;
  [key: string]: unknown;
}

export function useExportAllProducts(products: Product[]) {
  const [progress, setProgress] = useState<ExportBatchProgress>({
    processed: 0,
    total: products.length,
    status: "preparing",
    currentProductId: 0,
    message: "",
  });

  const [isPending, startTransition] = useTransition();

  const exportAll = () => {
    if (products.length === 0) {
      toast.warning("Nenhum produto para exportar");
      return;
    }

    startTransition(async () => {
      const productIds = products.map((p) => p.product_id);

      setProgress({
        processed: 0,
        total: products.length,
        status: "preparing",
        currentProductId: 0,
        message: "Preparando exportação...",
      });

      try {
        const result = await exportAllProductsImagesAction(
          productIds,
          (progressUpdate: ExportBatchProgress) => {
            setProgress(progressUpdate);
          },
        );

        if (result.success) {
          const message =
            result.totalUploaded > 0
              ? `Exportação concluída! ${result.totalUploaded} imagens enviadas, ${result.totalSkipped} já existiam.`
              : `Exportação concluída! Todos as ${result.totalSkipped} imagens já foram exportadas anteriormente.`;

          toast.success(message, {
            description: `${result.processedProducts} de ${result.totalProducts} produtos processados em ${(result.duration / 1000).toFixed(1)}s`,
          });
        } else {
          toast.error(`Exportação finalizada com ${result.totalErrors} erros`, {
            description: `${result.totalUploaded} enviadas, ${result.totalSkipped} já existiam`,
          });
        }

        setProgress({
          processed: result.totalProducts,
          total: result.totalProducts,
          status: "completed",
          currentProductId: 0,
          message: "Exportação concluída!",
        });

        // Hide progress bar after 2 seconds
        setTimeout(() => {
          setProgress((prev) => ({
            ...prev,
            processed: 0,
            total: 0,
          }));
        }, 2000);
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Erro desconhecido";
        toast.error(`Erro ao exportar produtos: ${errorMsg}`);

        setProgress({
          processed: 0,
          total: products.length,
          status: "error",
          currentProductId: 0,
          message: errorMsg,
        });
      }
    });
  };

  return {
    progress,
    exportAll,
    isExporting: isPending,
  };
}
