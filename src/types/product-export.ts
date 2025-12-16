/**
 * Types for product image export functionality
 */

// Product image field names (source - local paths)
export type ProductImageField =
  | "image_main"
  | "image1"
  | "image2"
  | "image3"
  | "image4"
  | "image5";

// Server image field names (destination - URLs)
export type ServerImageField =
  | "srv_image_main"
  | "srv_image1"
  | "srv_image2"
  | "srv_image3"
  | "srv_image4"
  | "srv_image5";

// Mapping from local field to server field
export const IMAGE_FIELD_MAPPING: Record<ProductImageField, ServerImageField> =
  {
    image_main: "srv_image_main",
    image1: "srv_image1",
    image2: "srv_image2",
    image3: "srv_image3",
    image4: "srv_image4",
    image5: "srv_image5",
  };

// Image item for processing
export interface ImageExportItem {
  field: ProductImageField;
  localPath: string;
  absolutePath: string;
  serverField: ServerImageField;
  existingServerUrl: string | null;
}

// Status of individual image processing
export type ImageProcessStatus =
  | "uploaded" // Successfully uploaded
  | "skipped" // Already exists on server
  | "not_found" // File not found on disk
  | "error"; // Upload error

// Individual image upload result
export interface ImageUploadResult {
  field: ProductImageField;
  serverField: ServerImageField;
  localPath: string;
  serverUrl: string | null;
  status: ImageProcessStatus;
  error?: string;
}

// Final export result
export interface ExportProductImagesResult {
  success: boolean;
  productId: number;
  totalProcessed: number;
  totalUploaded: number;
  totalSkipped: number;
  totalNotFound: number;
  totalErrors: number;
  results: ImageUploadResult[];
  errors: string[];
}

// UI progress state
export interface ExportProgress {
  status: "idle" | "loading" | "uploading" | "saving" | "completed" | "error";
  currentImage: number;
  totalImages: number;
  message: string;
}
