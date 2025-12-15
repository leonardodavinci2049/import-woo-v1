"use server";

import { assetsApiService } from "@/services/api-assets";
import type {
  DeleteFileRequest,
  DeleteFileResponse,
  EntityGalleryRequest,
  EntityGalleryResponse,
  EntityType,
  FileAsset,
  FindFileRequest,
  ListFilesRequest,
  ListFilesResponse,
} from "@/types/api-assets";
import { isApiError } from "@/types/api-assets"; /**
 * Server Actions for Test Assets API integration
 * These actions provide server-side interface between Client Components and the External Assets API
 */

// Generic response type for Server Actions
interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Upload file action
 * Called from FileUploadSection client component
 */
export async function uploadFileAction(
  formData: FormData,
): Promise<ActionResponse<FileAsset>> {
  try {
    const file = formData.get("file") as File;
    const entityType = formData.get("entityType") as string;
    const entityId = formData.get("entityId") as string;
    const tagsString = formData.get("tags") as string;
    const description = formData.get("description") as string;
    const altText = formData.get("altText") as string;

    // Validate required fields
    if (!file || !entityType || !entityId) {
      return {
        success: false,
        error: "Arquivo, tipo de entidade e ID da entidade são obrigatórios",
      };
    }

    // Parse tags
    const tags = tagsString
      ? tagsString
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : undefined;

    const result = await assetsApiService.uploadFile({
      file,
      entityType: entityType as EntityType,
      entityId,
      tags,
      description: description || undefined,
      altText: altText || undefined,
    });
    if (isApiError(result)) {
      return {
        success: false,
        error: Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message,
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Upload action error:", error);
    return {
      success: false,
      error: "Erro interno ao fazer upload do arquivo",
    };
  }
}

/**
 * List files action
 * Called from FileListSection client component
 */
export async function listFilesAction(
  filters: ListFilesRequest,
): Promise<ActionResponse<ListFilesResponse>> {
  try {
    const result = await assetsApiService.listFiles(filters);

    if (isApiError(result)) {
      return {
        success: false,
        error: Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message,
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("List files action error:", error);
    return {
      success: false,
      error: "Erro interno ao listar arquivos",
    };
  }
}

/**
 * Get entity gallery action
 * Called from FileGallerySection client component
 */
export async function getEntityGalleryAction(
  request: EntityGalleryRequest,
): Promise<ActionResponse<EntityGalleryResponse>> {
  try {
    const result = await assetsApiService.getEntityGallery(request);

    if (isApiError(result)) {
      return {
        success: false,
        error: Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message,
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Gallery action error:", error);
    return {
      success: false,
      error: "Erro interno ao carregar galeria",
    };
  }
}

/**
 * Find file action
 * Called from FileActionsSection client component
 */
export async function findFileAction(
  request: FindFileRequest,
): Promise<ActionResponse<FileAsset>> {
  try {
    const result = await assetsApiService.findFile(request);

    if (isApiError(result)) {
      return {
        success: false,
        error: Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message,
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Find file action error:", error);
    return {
      success: false,
      error: "Erro interno ao buscar arquivo",
    };
  }
}

/**
 * Delete file action
 * Called from FileActionsSection client component
 */
export async function deleteFileAction(
  request: DeleteFileRequest,
): Promise<ActionResponse<DeleteFileResponse>> {
  try {
    const result = await assetsApiService.deleteFile(request);

    if (isApiError(result)) {
      return {
        success: false,
        error: Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message,
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Delete file action error:", error);
    return {
      success: false,
      error: "Erro interno ao excluir arquivo",
    };
  }
}
