"use server";

import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/logger";
import {
  buildImageListForUpload,
  extractFileName,
  fileExists,
  findFieldsWithSamePath,
  readFileAsBlob,
} from "@/lib/utils/image-export-helpers";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import {
  NotFoundError,
  productWooService,
  ServiceValidationError,
} from "@/services/databse/product-woo";
import { isApiError } from "@/types/api-assets";
import {
  type ExportProductImagesResult,
  IMAGE_FIELD_MAPPING,
  type ImageUploadResult,
  type ServerImageField,
} from "@/types/product-export";

const logger = createLogger("action-export-product-images");

/**
 * Server Action to export product images to external server
 *
 * Flow:
 * 1. Fetch product details
 * 2. Build list of images to upload (excluding already exported)
 * 3. Upload each image to API
 * 4. Save URLs to database
 * 5. Return result with statistics
 *
 * @param productId - Product ID to export images for
 * @returns Export result with statistics and any errors
 */
export async function exportProductImagesAction(
  productId: number,
): Promise<ExportProductImagesResult> {
  const errors: string[] = [];
  const results: ImageUploadResult[] = [];

  try {
    // Validate productId
    if (!productId || !Number.isInteger(productId) || productId <= 0) {
      return {
        success: false,
        productId: productId || 0,
        totalProcessed: 0,
        totalUploaded: 0,
        totalSkipped: 0,
        totalNotFound: 0,
        totalErrors: 1,
        results: [],
        errors: ["ID do produto inválido"],
      };
    }

    // Fetch product details
    const product = await productWooService.getDetailsByProductId(productId);

    // Build image lists
    const { toUpload, skipped } = buildImageListForUpload(product);

    // Add skipped images to results
    for (const item of skipped) {
      results.push({
        field: item.field,
        serverField: item.serverField,
        localPath: item.localPath,
        serverUrl: item.existingServerUrl,
        status: "skipped",
      });
    }

    // If no images to upload, return early
    if (toUpload.length === 0) {
      return {
        success: true,
        productId,
        totalProcessed: skipped.length,
        totalUploaded: 0,
        totalSkipped: skipped.length,
        totalNotFound: 0,
        totalErrors: 0,
        results,
        errors: [],
      };
    }

    // Track uploaded paths and their URLs for deduplication
    const uploadedUrls = new Map<string, string>();

    // Process images to upload
    let uploadedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    for (const item of toUpload) {
      try {
        // Check if file exists on disk
        const exists = await fileExists(item.absolutePath);
        if (!exists) {
          logger.warn(`File not found: ${item.absolutePath}`);
          results.push({
            field: item.field,
            serverField: item.serverField,
            localPath: item.localPath,
            serverUrl: null,
            status: "not_found",
            error: "Arquivo não encontrado no disco",
          });
          notFoundCount++;
          continue;
        }

        // Read file from disk
        const fileName = extractFileName(item.localPath);
        const file = await readFileAsBlob(item.absolutePath, fileName);

        // Upload to API
        const response = await assetsApiService.uploadFile({
          file,
          entityType: "PRODUCT",
          entityId: String(productId),
          tags: [item.field, `product-${productId}`],
          description: `Product ${productId} - ${item.field}`,
          altText: product.product_name || `Product ${productId} image`,
        });

        // Check for API errors
        if (isApiError(response)) {
          const errorMsg = Array.isArray(response.message)
            ? response.message.join(", ")
            : response.message;
          logger.error(`Upload failed for ${item.field}: ${errorMsg}`);
          results.push({
            field: item.field,
            serverField: item.serverField,
            localPath: item.localPath,
            serverUrl: null,
            status: "error",
            error: errorMsg,
          });
          errors.push(`${item.field}: ${errorMsg}`);
          errorCount++;
          continue;
        }

        // Success - get the URL
        const serverUrl = response.urls?.original || response.urls?.preview;

        if (!serverUrl) {
          logger.error(`No URL returned for ${item.field}`);
          results.push({
            field: item.field,
            serverField: item.serverField,
            localPath: item.localPath,
            serverUrl: null,
            status: "error",
            error: "URL não retornada pela API",
          });
          errors.push(`${item.field}: URL não retornada pela API`);
          errorCount++;
          continue;
        }

        // Store URL for this path (for deduplication)
        uploadedUrls.set(item.localPath, serverUrl);

        results.push({
          field: item.field,
          serverField: item.serverField,
          localPath: item.localPath,
          serverUrl,
          status: "uploaded",
        });

        uploadedCount++;
      } catch (uploadError) {
        const errorMsg =
          uploadError instanceof Error
            ? uploadError.message
            : "Erro desconhecido no upload";
        logger.error(`Upload error for ${item.field}:`, uploadError);
        results.push({
          field: item.field,
          serverField: item.serverField,
          localPath: item.localPath,
          serverUrl: null,
          status: "error",
          error: errorMsg,
        });
        errors.push(`${item.field}: ${errorMsg}`);
        errorCount++;
      }
    }

    // Build server images object for database update
    const serverImages: Partial<Record<ServerImageField, string>> = {};

    // For each uploaded image, find all fields with same path and set URL
    for (const [uploadedPath, url] of uploadedUrls) {
      const fieldsWithSamePath = findFieldsWithSamePath(product, uploadedPath);
      for (const field of fieldsWithSamePath) {
        const serverField = IMAGE_FIELD_MAPPING[field];
        // Only set if not already exported (from skipped list)
        const existingServerUrl = product[
          serverField as keyof typeof product
        ] as string | null;
        if (!existingServerUrl || existingServerUrl.trim().length === 0) {
          serverImages[serverField] = url;
        }
      }
    }

    // Update database if we have images to save
    if (Object.keys(serverImages).length > 0) {
      try {
        await productWooService.updateServerImagesAndMarkExported(
          productId,
          serverImages,
        );
      } catch (dbError) {
        const errorMsg =
          dbError instanceof Error
            ? dbError.message
            : "Erro ao atualizar banco de dados";
        logger.error(`Database update failed:`, dbError);
        errors.push(`Banco de dados: ${errorMsg}`);
        // Don't fail the whole operation, images were uploaded successfully
      }
    }

    // Revalidate the home page to refresh product list
    revalidatePath("/");

    return {
      success: errorCount === 0 && errors.length === 0,
      productId,
      totalProcessed: toUpload.length + skipped.length,
      totalUploaded: uploadedCount,
      totalSkipped: skipped.length,
      totalNotFound: notFoundCount,
      totalErrors: errorCount,
      results,
      errors,
    };
  } catch (error) {
    // Handle known errors
    if (error instanceof NotFoundError) {
      logger.warn(`Product not found: ${productId}`);
      return {
        success: false,
        productId,
        totalProcessed: 0,
        totalUploaded: 0,
        totalSkipped: 0,
        totalNotFound: 0,
        totalErrors: 1,
        results: [],
        errors: ["Produto não encontrado"],
      };
    }

    if (error instanceof ServiceValidationError) {
      logger.warn(`Validation error: ${error.message}`);
      return {
        success: false,
        productId,
        totalProcessed: 0,
        totalUploaded: 0,
        totalSkipped: 0,
        totalNotFound: 0,
        totalErrors: 1,
        results: [],
        errors: [error.message],
      };
    }

    // Generic error
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Erro interno ao exportar imagens";
    logger.error(`Export failed for product ${productId}:`, error);

    return {
      success: false,
      productId,
      totalProcessed: 0,
      totalUploaded: 0,
      totalSkipped: 0,
      totalNotFound: 0,
      totalErrors: 1,
      results,
      errors: [errorMsg],
    };
  }
}
