"use server";

import { createLogger } from "@/lib/logger";

import { assetsApiService } from "@/services/api-assets/assets-api-service";
import type { FileAsset } from "@/types/api-assets";
import { isApiError } from "@/types/api-assets";
import { uploadFileAction } from "./action-test-assets";

const logger = createLogger("action-product-images");

/**
 * Helper function to update product PATH_IMAGEM only if it's currently empty
 * This ensures we don't override existing main images
 *
 * @param productId - Product ID to update
 * @param imageUrl - New image URL to set as PATH_IMAGEM
 */

/**
 * Server Actions for Product Image Upload
 * These actions handle file uploads for products using the external Assets API
 */

interface UploadProductImageResponse {
  success: boolean;
  data?: FileAsset;
  error?: string;
}

interface DeleteProductImageResponse {
  success: boolean;
  error?: string;
}

interface SetPrimaryImageResponse {
  success: boolean;
  error?: string;
}

/**
 * Upload image for a product
 * Used by ProductImageGallery component to upload new product images
 *
 * @param formData FormData containing:
 *   - file: File object to upload
 *   - productId: Product ID (will be used as entityId)
 *   - tags: Optional comma-separated tags
 *   - description: Optional image description
 *   - altText: Optional alt text for accessibility
 */
export async function uploadProductImageAction(
  formData: FormData,
): Promise<UploadProductImageResponse> {
  try {
    const file = formData.get("file") as File;
    const productId = formData.get("productId") as string;
    const tagsString = formData.get("tags") as string;
    const description = formData.get("description") as string;
    const altText = formData.get("altText") as string;

    // Validate required fields
    if (!file || !productId) {
      return {
        success: false,
        error: "Arquivo e ID do produto são obrigatórios",
      };
    }

    // Validate file is actually a file
    if (!(file instanceof File)) {
      return {
        success: false,
        error: "Arquivo inválido",
      };
    }

    // Debug info removed for cleaner console output

    // Create FormData exactly like test page does
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("entityType", "PRODUCT");
    uploadFormData.append("entityId", productId);
    if (tagsString) uploadFormData.append("tags", tagsString);
    if (description) uploadFormData.append("description", description);
    if (altText) uploadFormData.append("altText", altText);

    // FormData logging removed for cleaner console output

    // Call the test assets action that we know works
    const result = await uploadFileAction(uploadFormData);

    /*     if (result.success && result.data?.urls?.preview) {
      try {
        await updateProductImagePathIfEmpty(
          Number(productId),
          result.data.urls.preview,
        );
      } catch (pathUpdateError) {
        // Log error but don't fail the upload - image was successfully uploaded
        logger.warn(
          `Failed to update PATH_IMAGEM for product ${productId}:`,
          pathUpdateError,
        );
        // Upload was successful, just PATH_IMAGEM update failed
        // This is not critical enough to fail the entire operation
      }
    }
 */
    // Return the result from the working uploadFileAction
    return result;
  } catch (error) {
    console.error("Upload product image action error:", error);
    return {
      success: false,
      error: "Erro interno ao fazer upload da imagem",
    };
  }
}

/**
 * Delete image from a product gallery
 * Used by ProductImageGallery component to delete product images
 *
 * @param imageId UUID of the image to delete
 */
export async function deleteProductImageAction(
  imageId: string,
): Promise<DeleteProductImageResponse> {
  try {
    // Validate required fields
    if (!imageId || typeof imageId !== "string") {
      return {
        success: false,
        error: "ID da imagem é obrigatório",
      };
    }

    // Debug info removed for cleaner console output

    // Call the assets API to delete the file
    const result = await assetsApiService.deleteFile({ id: imageId });

    // Check if response is an error
    if (isApiError(result)) {
      logger.warn(`Failed to delete image ${imageId}: ${result.message}`);
      return {
        success: false,
        error: Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || "Erro ao excluir imagem",
      };
    }

    // Success logged via return value
    return {
      success: true,
    };
  } catch (error) {
    logger.error("Delete product image action error:", error);
    return {
      success: false,
      error: "Erro interno ao excluir imagem",
    };
  }
}

/**
 * Set image as primary for a product
 * Used by ProductImageGallery component to promote images to primary
 *
 * @param productId Product ID
 * @param imageId UUID of the image to set as primary
 */
export async function setPrimaryImageAction(
  productId: string,
  imageId: string,
): Promise<SetPrimaryImageResponse> {
  try {
    // Validate required fields
    if (!productId || !imageId) {
      return {
        success: false,
        error: "ID do produto e da imagem são obrigatórios",
      };
    }

    // Debug info removed for cleaner console output

    // Call the assets API to set primary image
    const result = await assetsApiService.setPrimaryImage({
      entityType: "PRODUCT",
      entityId: productId,
      assetId: imageId,
      displayOrder: 1,
    });

    // Check if response is an error
    if (isApiError(result)) {
      logger.warn(`Failed to set primary image ${imageId}: ${result.message}`);
      return {
        success: false,
        error: Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || "Erro ao definir imagem principal",
      };
    }

    // Success logged via return value
    return {
      success: true,
    };
  } catch (error) {
    logger.error("Set primary image action error:", error);
    return {
      success: false,
      error: "Erro interno ao definir imagem principal",
    };
  }
}
