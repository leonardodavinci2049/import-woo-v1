"use client";

import { useState, useTransition, useEffect, useRef } from "react";
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
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const exportAll = () => {
    if (products.length === 0) {
      toast.warning("Nenhum produto para exportar");
      return;
    }

    startTransition(async () => {
      const productIds = products.map((p) => p.product_id);
      const totalProducts = products.length;

      // Estimated time: ~110ms per product (based on logs: 11s for 100 products)
      const estimatedTotalTimeMs = totalProducts * 110;
      const updateIntervalMs = 500; // Update every 500ms
      const incrementPerUpdate =
        totalProducts / (estimatedTotalTimeMs / updateIntervalMs);

      setProgress({
        processed: 0,
        total: totalProducts,
        status: "uploading",
        currentProductId: 0,
        message: "Exportando imagens dos produtos...",
      });

      // Start optimistic progress simulation
      let simulatedProgress = 0;
      progressIntervalRef.current = setInterval(() => {
        simulatedProgress += incrementPerUpdate;

        // Cap at 95% to avoid showing 100% before completion
        if (simulatedProgress >= totalProducts * 0.95) {
          simulatedProgress = totalProducts * 0.95;
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        }

        setProgress((prev) => ({
          ...prev,
          processed: Math.floor(simulatedProgress),
          message: `Processando ${Math.floor(simulatedProgress)} de ${totalProducts} produtos...`,
        }));
      }, updateIntervalMs);

      try {
        const result = await exportAllProductsImagesAction(productIds);

        // Clear interval when done
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

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
          message: `Exportação concluída! ${result.totalUploaded} imagens enviadas em ${(result.duration / 1000).toFixed(1)}s`,
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
        // Clear interval on error
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

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
