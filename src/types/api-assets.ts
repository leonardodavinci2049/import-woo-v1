/**
 * Types for External Assets API (srv-assets-v1)
 * Based on API Reference documentation
 */

// Entity Types supported by the API
export type EntityType =
  | "PRODUCT"
  | "PROFILE"
  | "ORDER"
  | "INVOICE"
  | "BANNER"
  | "LOGO"
  | "GALLERY"
  | "CATEGORY"
  | "BRAND"
  | "ARTICLE"
  | "EVENT"
  | "DOCUMENT"
  | "OTHER";

// File Types
export type FileType = "IMAGE" | "DOCUMENT" | "SPREADSHEET";

// File Status
export type FileStatus = "ACTIVE" | "PROCESSING" | "ARCHIVED" | "DELETED";

// File Version Type
export type FileVersionType = "original" | "preview" | "medium" | "thumbnail";

// File Version
export interface FileVersion {
  versionType: FileVersionType;
  fileName: string;
  url: string;
  fileSize: number;
  width?: number;
  height?: number;
}

// File URLs
export interface FileUrls {
  original: string;
  preview?: string;
  medium?: string;
  thumbnail?: string;
}

// File Asset (main interface)
export interface FileAsset {
  id: string;
  entityType: EntityType;
  entityId: string;
  originalName: string;
  fileType: FileType;
  mimeType: string;
  fileSize: number;
  status: FileStatus;
  uploadedAt: string;
  tags?: string[];
  description?: string;
  altText?: string;
  versions: FileVersion[];
  urls: FileUrls;
}

// API Status Response
export interface ApiStatusResponse {
  name: string;
  status: string;
  version: string;
  documentation: string;
  timestamp: string;
  endpoints: {
    base: string;
    upload: string;
    list: string;
    getOne: string;
    delete: string;
    gallery: string;
    note: string;
  };
}

// Upload File Request
export interface UploadFileRequest {
  file: File;
  entityType: EntityType;
  entityId: string;
  tags?: string[];
  description?: string;
  altText?: string;
}

// List Files Request
export interface ListFilesRequest {
  entityType?: EntityType;
  entityId?: string;
  fileType?: FileType;
  status?: FileStatus;
  page?: number;
  limit?: number;
}

// List Files Response
export interface ListFilesResponse {
  data: FileAsset[];
  total: number;
  page: number;
  limit: number;
}

// Find File Request
export interface FindFileRequest {
  id: string;
}

// Delete File Request
export interface DeleteFileRequest {
  id: string;
}

// Delete File Response
export interface DeleteFileResponse {
  success: boolean;
  message: string;
}

// Entity Gallery Request
export interface EntityGalleryRequest {
  entityType: EntityType;
  entityId: string;
}

// Gallery Image (simplified FileAsset for gallery)
export interface GalleryImage {
  id: string;
  originalName: string;
  uploadedAt: string;
  tags?: string[];
  isPrimary: boolean;
  displayOrder: number;
  urls: FileUrls;
}

// Entity Gallery Response
export interface EntityGalleryResponse {
  entityType: EntityType;
  entityId: string;
  totalImages: number;
  images: GalleryImage[];
}

// API Error Response
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

// Generic API Response wrapper
export type ApiResponse<T> = T | ApiErrorResponse;

// Helper type guard to check if response is an error
export function isApiError(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "statusCode" in response &&
    "message" in response &&
    "error" in response
  );
}

// Form data for upload (for use with FormData)
export interface UploadFormData {
  file: File;
  entityType: string;
  entityId: string;
  tags?: string;
  description?: string;
  altText?: string;
}

// Supported MIME types (from API documentation)
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const SUPPORTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const SUPPORTED_SPREADSHEET_TYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
] as const;

export const ALL_SUPPORTED_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_DOCUMENT_TYPES,
  ...SUPPORTED_SPREADSHEET_TYPES,
] as const;

// Entity Type Labels for UI (with i18n keys)
export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  PRODUCT: "assets.entityType.product",
  PROFILE: "assets.entityType.profile",
  ORDER: "assets.entityType.order",
  INVOICE: "assets.entityType.invoice",
  BANNER: "assets.entityType.banner",
  LOGO: "assets.entityType.logo",
  GALLERY: "assets.entityType.gallery",
  CATEGORY: "assets.entityType.category",
  BRAND: "assets.entityType.brand",
  ARTICLE: "assets.entityType.article",
  EVENT: "assets.entityType.event",
  DOCUMENT: "assets.entityType.document",
  OTHER: "assets.entityType.other",
};

// File Type Labels for UI (with i18n keys)
export const FILE_TYPE_LABELS: Record<FileType, string> = {
  IMAGE: "assets.fileType.image",
  DOCUMENT: "assets.fileType.document",
  SPREADSHEET: "assets.fileType.spreadsheet",
};

// File Status Labels for UI (with i18n keys)
export const FILE_STATUS_LABELS: Record<FileStatus, string> = {
  ACTIVE: "assets.fileStatus.active",
  PROCESSING: "assets.fileStatus.processing",
  ARCHIVED: "assets.fileStatus.archived",
  DELETED: "assets.fileStatus.deleted",
};
