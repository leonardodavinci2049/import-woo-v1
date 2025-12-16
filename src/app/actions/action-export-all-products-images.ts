"use server";

import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/logger";
import type {
  ExportAllProductsResult,
  ExportBatchProgress,
  ExportProductImagesResult,
} from "@/types/product-export";
import { exportProductImagesAction } from "./action-export-product-images";

const logger = createLogger("action-export-all-products-images");

// Batch size for parallel processing (3-5 products at once)
const BATCH_SIZE = 3;

/**
 * Server Action to export images for multiple products in batches
 *
 * Flow:
 * 1. Split products into batches
 * 2. Process each batch in parallel
 * 3. Update progress after each batch
 * 4. Consolidate results
 * 5. Return comprehensive statistics
 *
 * @param productIds - Array of product IDs to export
 * @param onProgress - Optional callback for progress updates
 * @returns Consolidated export result with statistics
 */
export async function exportAllProductsImagesAction(
  productIds: number[],
  onProgress?: (progress: ExportBatchProgress) => void,
): Promise<ExportAllProductsResult> {
  const startTime = Date.now();
  const detailedResults: ExportProductImagesResult[] = [];
  const errors: string[] = [];

  try {
    // Validate input
    if (!Array.isArray(productIds) || productIds.length === 0) {
      logger.warn("No product IDs provided");
      return {
        success: false,
        totalProducts: 0,
        processedProducts: 0,
        totalUploaded: 0,
        totalSkipped: 0,
        totalNotFound: 0,
        totalErrors: 1,
        detailedResults: [],
        errors: ["Nenhum produto fornecido para exportação"],
        duration: 0,
      };
    }

    // Notify preparation
    onProgress?.({
      processed: 0,
      total: productIds.length,
      status: "preparing",
      currentProductId: productIds[0] || 0,
      message: "Preparando exportação em massa...",
    });

    // Process products in batches
    for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
      const batch = productIds.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(productIds.length / BATCH_SIZE);

      logger.info(
        `Processing batch ${batchNumber}/${totalBatches} (${batch.length} products)`,
      );

      // Notify batch start
      onProgress?.({
        processed: i,
        total: productIds.length,
        status: "uploading",
        currentProductId: batch[0] || 0,
        message: `Processando produtos ${i + 1}-${Math.min(i + BATCH_SIZE, productIds.length)} de ${productIds.length}`,
      });

      // Process batch in parallel
      try {
        const batchResults = await Promise.all(
          batch.map((productId) =>
            exportProductImagesAction(productId).catch((error) => {
              logger.error(`Failed to export product ${productId}:`, error);
              return {
                success: false,
                productId,
                totalProcessed: 0,
                totalUploaded: 0,
                totalSkipped: 0,
                totalNotFound: 0,
                totalErrors: 1,
                results: [],
                errors: [
                  error instanceof Error ? error.message : "Erro desconhecido",
                ],
              } as ExportProductImagesResult;
            }),
          ),
        );

        // Collect results
        detailedResults.push(...batchResults);

        // Collect errors from batch
        for (const result of batchResults) {
          if (!result.success && result.errors.length > 0) {
            errors.push(
              `Produto ${result.productId}: ${result.errors.join(", ")}`,
            );
          }
        }

        // Update progress
        const processed = Math.min(i + BATCH_SIZE, productIds.length);
        onProgress?.({
          processed,
          total: productIds.length,
          status: "uploading",
          currentProductId: batch[batch.length - 1] || 0,
          message: `Processados ${processed} de ${productIds.length} produtos`,
        });
      } catch (batchError) {
        logger.error(`Batch ${batchNumber} failed:`, batchError);
        const errorMsg =
          batchError instanceof Error
            ? batchError.message
            : "Erro ao processar lote";
        errors.push(`Lote ${batchNumber}: ${errorMsg}`);
      }
    }

    // Calculate consolidated statistics
    const totalUploaded = detailedResults.reduce(
      (sum, r) => sum + r.totalUploaded,
      0,
    );
    const totalSkipped = detailedResults.reduce(
      (sum, r) => sum + r.totalSkipped,
      0,
    );
    const totalNotFound = detailedResults.reduce(
      (sum, r) => sum + r.totalNotFound,
      0,
    );
    const totalErrors = detailedResults.reduce(
      (sum, r) => sum + r.totalErrors,
      0,
    );

    const processedProducts = detailedResults.length;
    const duration = Date.now() - startTime;

    // Notify completion
    onProgress?.({
      processed: productIds.length,
      total: productIds.length,
      status: "completed",
      currentProductId: 0,
      message: "Exportação concluída!",
    });

    // Revalidate the home page to refresh product list
    revalidatePath("/");

    const result: ExportAllProductsResult = {
      success: totalErrors === 0 && errors.length === 0,
      totalProducts: productIds.length,
      processedProducts,
      totalUploaded,
      totalSkipped,
      totalNotFound,
      totalErrors,
      detailedResults,
      errors,
      duration,
    };

    logger.info(
      `Export completed: ${processedProducts}/${productIds.length} products processed, ${totalUploaded} uploaded, ${totalSkipped} skipped, ${totalErrors} errors in ${duration}ms`,
    );

    return result;
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Erro interno ao exportar produtos";
    logger.error("Export all failed:", error);

    // Notify error
    onProgress?.({
      processed: 0,
      total: productIds.length,
      status: "error",
      currentProductId: 0,
      message: errorMsg,
    });

    return {
      success: false,
      totalProducts: productIds.length,
      processedProducts: detailedResults.length,
      totalUploaded: detailedResults.reduce(
        (sum, r) => sum + r.totalUploaded,
        0,
      ),
      totalSkipped: detailedResults.reduce((sum, r) => sum + r.totalSkipped, 0),
      totalNotFound: detailedResults.reduce(
        (sum, r) => sum + r.totalNotFound,
        0,
      ),
      totalErrors:
        detailedResults.reduce((sum, r) => sum + r.totalErrors, 0) + 1,
      detailedResults,
      errors: [...errors, errorMsg],
      duration: Date.now() - startTime,
    };
  }
}
