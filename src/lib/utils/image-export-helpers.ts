/**
 * Helper functions for image export functionality
 */

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import {
  IMAGE_FIELD_MAPPING,
  type ImageExportItem,
  type ProductImageField,
} from "@/types/product-export";

// Product details type from Prisma
type ProductDetails = {
  image_main: string | null;
  image1: string | null;
  image2: string | null;
  image3: string | null;
  image4: string | null;
  image5: string | null;
  srv_image_main: string | null;
  srv_image1: string | null;
  srv_image2: string | null;
  srv_image3: string | null;
  srv_image4: string | null;
  srv_image5: string | null;
};

/**
 * Get the base path for uploads folder at runtime
 * Uses dynamic string construction to prevent Turbopack from statically analyzing file patterns
 * @returns Absolute path to the uploads folder
 */
function getUploadsBasePath(): string {
  // Build folder name dynamically to prevent static analysis
  const folderName = ["up", "loads"].join("");
  return `${process.cwd()}${path.sep}${folderName}`;
}

/**
 * Normalize image path by removing common prefixes
 * @param imagePath - Raw image path from database
 * @returns Normalized path or null
 */
export function normalizeImagePath(imagePath: string | null): string | null {
  if (!imagePath || imagePath.trim().length === 0) {
    return null;
  }

  let normalized = imagePath.trim();

  // Remove common URL prefixes if present
  const prefixesToRemove = [
    "http://",
    "https://",
    "/uploads/",
    "uploads/",
    "./uploads/",
  ];

  for (const prefix of prefixesToRemove) {
    if (normalized.toLowerCase().startsWith(prefix)) {
      normalized = normalized.substring(prefix.length);
    }
  }

  // Remove leading slashes
  while (normalized.startsWith("/")) {
    normalized = normalized.substring(1);
  }

  return normalized.length > 0 ? normalized : null;
}

/**
 * Build absolute path from relative image path
 * @param relativePath - Relative path (e.g., "2024/01/image.jpg")
 * @returns Absolute path to the file
 */
export function buildAbsolutePath(relativePath: string): string {
  const normalized = normalizeImagePath(relativePath);
  if (!normalized) {
    return "";
  }
  // Use string concatenation to avoid Turbopack static analysis of file patterns
  return `${getUploadsBasePath()}${path.sep}${normalized}`;
}

/**
 * Check if file exists on disk
 * @param absolutePath - Full path to the file
 * @returns True if file exists
 */
export async function fileExists(absolutePath: string): Promise<boolean> {
  if (!absolutePath) {
    return false;
  }

  try {
    await access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if an image should be uploaded
 * - Returns false if no local path
 * - Returns false if already has server URL
 * @param localPath - Local image path
 * @param serverUrl - Existing server URL
 * @returns True if image should be uploaded
 */
export function shouldUploadImage(
  localPath: string | null,
  serverUrl: string | null,
): boolean {
  // No local path means nothing to upload
  if (!localPath || localPath.trim().length === 0) {
    return false;
  }

  // Already has server URL, skip
  if (serverUrl && serverUrl.trim().length > 0) {
    return false;
  }

  return true;
}

/**
 * Build list of images for upload, separating those to upload from those to skip
 * @param product - Product details from database
 * @returns Object with images to upload and images to skip
 */
export function buildImageListForUpload(product: ProductDetails): {
  toUpload: ImageExportItem[];
  skipped: ImageExportItem[];
} {
  const toUpload: ImageExportItem[] = [];
  const skipped: ImageExportItem[] = [];

  // Define field mappings
  const fieldConfigs: Array<{
    field: ProductImageField;
    localKey: keyof ProductDetails;
    serverKey: keyof ProductDetails;
  }> = [
    {
      field: "image_main",
      localKey: "image_main",
      serverKey: "srv_image_main",
    },
    { field: "image1", localKey: "image1", serverKey: "srv_image1" },
    { field: "image2", localKey: "image2", serverKey: "srv_image2" },
    { field: "image3", localKey: "image3", serverKey: "srv_image3" },
    { field: "image4", localKey: "image4", serverKey: "srv_image4" },
    { field: "image5", localKey: "image5", serverKey: "srv_image5" },
  ];

  // Track paths already processed to avoid duplicates
  const processedPaths = new Set<string>();

  for (const config of fieldConfigs) {
    const localPath = product[config.localKey];
    const serverUrl = product[config.serverKey];

    // Skip if no local path
    if (!localPath || localPath.trim().length === 0) {
      continue;
    }

    const normalizedPath = normalizeImagePath(localPath);
    if (!normalizedPath) {
      continue;
    }

    const absolutePath = buildAbsolutePath(localPath);
    const serverField = IMAGE_FIELD_MAPPING[config.field];

    const item: ImageExportItem = {
      field: config.field,
      localPath: normalizedPath,
      absolutePath,
      serverField,
      existingServerUrl: serverUrl,
    };

    // Check if should upload
    if (!shouldUploadImage(localPath, serverUrl)) {
      // Already has server URL
      skipped.push(item);
      continue;
    }

    // Check for duplicates (same path)
    if (processedPaths.has(normalizedPath)) {
      // Already processing this path, will use URL from first upload
      continue;
    }

    processedPaths.add(normalizedPath);
    toUpload.push(item);
  }

  return { toUpload, skipped };
}

/**
 * Sanitize product name to create SEO-friendly filename
 * @param productName - Product name from database
 * @returns Sanitized slug (lowercase, no special chars, hyphens instead of spaces)
 */
export function sanitizeProductName(productName: string | null): string {
  if (!productName || productName.trim().length === 0) {
    return "produto";
  }

  return (
    productName
      .trim()
      .toLowerCase()
      // Remove accents and special characters
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Replace spaces and underscores with hyphens
      .replace(/[\s_]+/g, "-")
      // Remove all non-alphanumeric characters except hyphens
      .replace(/[^a-z0-9-]/g, "")
      // Remove multiple consecutive hyphens
      .replace(/-+/g, "-")
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, "") ||
    // Fallback if result is empty
    "produto"
  );
}

/**
 * Generate SEO-friendly filename from product name and original filename
 * @param productName - Product name from database
 * @param originalFileName - Original filename (to preserve extension)
 * @param fieldSuffix - Optional suffix to differentiate images (e.g., "main", "1", "2")
 * @returns SEO-optimized filename (e.g., "notebook-gamer-alienware-main.jpg")
 */
export function generateSeoFileName(
  productName: string | null,
  originalFileName: string,
  fieldSuffix?: string,
): string {
  const sanitizedName = sanitizeProductName(productName);
  const ext = path.extname(originalFileName).toLowerCase();

  // Build filename: product-name[-suffix].ext
  const suffix = fieldSuffix ? `-${fieldSuffix}` : "";
  return `${sanitizedName}${suffix}${ext}`;
}

/**
 * Read file from disk and create a File object with SEO-friendly name
 * @param absolutePath - Full path to the file
 * @param fileName - Original name for the File object
 * @param productName - Product name for SEO optimization (optional)
 * @param fieldSuffix - Optional suffix to differentiate images (e.g., "main", "1")
 * @returns File object with renamed file
 */
export async function readFileAsBlob(
  absolutePath: string,
  fileName: string,
  productName?: string | null,
  fieldSuffix?: string,
): Promise<File> {
  const buffer = await readFile(absolutePath);
  const mimeType = getMimeTypeFromExtension(absolutePath);

  // Use SEO-friendly name if product name is provided
  const finalFileName = productName
    ? generateSeoFileName(productName, fileName, fieldSuffix)
    : fileName;

  return new File([buffer], finalFileName, { type: mimeType });
}

/**
 * Get MIME type from file extension
 * @param filePath - File path with extension
 * @returns MIME type string
 */
export function getMimeTypeFromExtension(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
  };

  return mimeTypes[ext] || "application/octet-stream";
}

/**
 * Check if file extension is a valid image type
 * @param filePath - File path with extension
 * @returns True if valid image extension
 */
export function isValidImageExtension(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  return validExtensions.includes(ext);
}

/**
 * Extract filename from path
 * @param filePath - Full or relative file path
 * @returns Filename with extension
 */
export function extractFileName(filePath: string): string {
  return path.basename(filePath);
}

/**
 * Find images with same path for URL reuse
 * This helps avoid uploading the same image twice when image1 = image_main
 * @param product - Product details
 * @param uploadedPath - Path that was uploaded
 * @returns Array of fields that share the same path
 */
export function findFieldsWithSamePath(
  product: ProductDetails,
  uploadedPath: string,
): ProductImageField[] {
  const normalizedUploadPath = normalizeImagePath(uploadedPath);
  if (!normalizedUploadPath) return [];

  const fields: ProductImageField[] = [];

  const fieldMappings: Array<{
    field: ProductImageField;
    localKey: keyof ProductDetails;
  }> = [
    { field: "image_main", localKey: "image_main" },
    { field: "image1", localKey: "image1" },
    { field: "image2", localKey: "image2" },
    { field: "image3", localKey: "image3" },
    { field: "image4", localKey: "image4" },
    { field: "image5", localKey: "image5" },
  ];

  for (const mapping of fieldMappings) {
    const localPath = product[mapping.localKey];
    if (localPath && normalizeImagePath(localPath) === normalizedUploadPath) {
      fields.push(mapping.field);
    }
  }

  return fields;
}
