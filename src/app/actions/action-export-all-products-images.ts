"use server";

import { revalidatePath } from "next/cache";
import type {
  ExportAllProductsResult,
  ExportProductImagesResult,
} from "@/types/product-export";
import { exportProductImagesAction } from "./action-export-product-images";

// Batch size for parallel processing (3-5 products at once)
const BATCH_SIZE = 3;

/**
 * Server Action to export images for multiple products in batches
 *
 * Flow:
 * 1. Split products into batches
 * 2. Process each batch in parallel
 * 3. Consolidate results
 * 4. Return comprehensive statistics
 *
 * @param productIds - Array of product IDs to export
 * @returns Consolidated export result with statistics
 */
export async function exportAllProductsImagesAction(
  productIds: number[],
): Promise<ExportAllProductsResult> {
  const startTime = Date.now();
  const detailedResults: ExportProductImagesResult[] = [];
  const errors: string[] = [];

  try {
    // Validate input
    if (!Array.isArray(productIds) || productIds.length === 0) {
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

    // Process products in batches
    for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
      const batch = productIds.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(productIds.length / BATCH_SIZE);

      // Process batch in parallel
      try {
        const batchResults = await Promise.all(
          batch.map((productId) =>
            exportProductImagesAction(productId).catch((error) => {
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
      } catch (batchError) {
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

    return result;
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Erro interno ao exportar produtos";

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
