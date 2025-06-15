import { supabase } from '../client';
import type { FileObject, StorageError } from '@supabase/storage-js';

// Storage result types
export interface StorageResult<T = any> {
  data: T | null;
  error: StorageError | Error | null;
}

export interface UploadResult {
  path: string;
  fullPath: string;
  url?: string;
}

export interface DownloadResult {
  data: Blob;
  contentType?: string;
  size?: number;
}

// Upload options
export interface UploadOptions {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
  metadata?: Record<string, any>;
}

// File metadata
export interface FileMetadata {
  name: string;
  size: number;
  contentType?: string;
  lastModified?: Date;
  path: string;
  bucket: string;
  url?: string;
}

// Common bucket names (you can customize these based on your setup)
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  POSTS: 'posts',
  ATTACHMENTS: 'attachments',
  PUBLIC: 'public',
} as const;

type BucketName = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

/**
 * File Upload Functions
 */

// Upload a file to a bucket
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob | ArrayBuffer | FormData,
  options?: UploadOptions
): Promise<StorageResult<UploadResult>> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options);

    if (error) {
      return { data: null, error };
    }

    const fullPath = data.path;
    const publicUrl = getPublicUrl(bucket, fullPath);

    return {
      data: {
        path: data.path,
        fullPath: `${bucket}/${data.path}`,
        url: publicUrl,
      },
      error: null,
    };
  } catch (error) {
    console.error(`Error uploading file to ${bucket}/${path}:`, error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Upload multiple files
export async function uploadFiles(
  bucket: string,
  files: Array<{ path: string; file: File | Blob | ArrayBuffer | FormData; options?: UploadOptions }>
): Promise<StorageResult<UploadResult[]>> {
  try {
    const uploadPromises = files.map(({ path, file, options }) =>
      uploadFile(bucket, path, file, options)
    );

    const results = await Promise.all(uploadPromises);
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
      return {
        data: null,
        error: new Error(`Failed to upload ${errors.length} files`),
      };
    }

    const successfulUploads = results
      .map(result => result.data)
      .filter(data => data !== null) as UploadResult[];

    return {
      data: successfulUploads,
      error: null,
    };
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Replace/update an existing file
export async function replaceFile(
  bucket: string,
  path: string,
  file: File | Blob | ArrayBuffer | FormData,
  options?: Omit<UploadOptions, 'upsert'>
): Promise<StorageResult<UploadResult>> {
  return uploadFile(bucket, path, file, { ...options, upsert: true });
}

/**
 * File Download Functions
 */

// Download a file
export async function downloadFile(
  bucket: string,
  path: string
): Promise<StorageResult<DownloadResult>> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        data,
        contentType: data.type,
        size: data.size,
      },
      error: null,
    };
  } catch (error) {
    console.error(`Error downloading file from ${bucket}/${path}:`, error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Get a signed URL for temporary access
export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600 // 1 hour in seconds
): Promise<StorageResult<string>> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      return { data: null, error };
    }

    return {
      data: data.signedUrl,
      error: null,
    };
  } catch (error) {
    console.error(`Error creating signed URL for ${bucket}/${path}:`, error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Get multiple signed URLs
export async function createSignedUrls(
  bucket: string,
  paths: string[],
  expiresIn: number = 3600
): Promise<StorageResult<Array<{ path: string; signedUrl: string }>>> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrls(paths, expiresIn);

    if (error) {
      return { data: null, error };
    }

    return {
      data: data.map(item => ({
        path: item.path || '',
        signedUrl: item.signedUrl,
      })),
      error: null,
    };
  } catch (error) {
    console.error(`Error creating signed URLs for ${bucket}:`, error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Get public URL (for public buckets)
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * File Management Functions
 */

// List files in a bucket
export async function listFiles(
  bucket: string,
  path?: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: 'asc' | 'desc' };
  }
): Promise<StorageResult<FileObject[]>> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, options);

    if (error) {
      return { data: null, error };
    }

    return {
      data: data || [],
      error: null,
    };
  } catch (error) {
    console.error(`Error listing files in ${bucket}/${path || ''}:`, error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Get file metadata
export async function getFileMetadata(
  bucket: string,
  path: string
): Promise<StorageResult<FileMetadata>> {
  try {
    const files = await listFiles(bucket, path);
    
    if (files.error || !files.data) {
      return { data: null, error: files.error };
    }

    const file = files.data.find(f => f.name === path.split('/').pop());
    
    if (!file) {
      return {
        data: null,
        error: new Error('File not found'),
      };
    }

    const publicUrl = getPublicUrl(bucket, path);

    return {
      data: {
        name: file.name,
        size: file.metadata?.size || 0,
        contentType: file.metadata?.mimetype,
        lastModified: file.updated_at ? new Date(file.updated_at) : undefined,
        path,
        bucket,
        url: publicUrl,
      },
      error: null,
    };
  } catch (error) {
    console.error(`Error getting file metadata for ${bucket}/${path}:`, error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Delete a file
export async function deleteFile(
  bucket: string,
  path: string
): Promise<StorageResult<void>> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      return { data: null, error };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error(`Error deleting file ${bucket}/${path}:`, error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Delete multiple files
export async function deleteFiles(
  bucket: string,
  paths: string[]
): Promise<StorageResult<void>> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      return { data: null, error };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error(`Error deleting files from ${bucket}:`, error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Move/rename a file
export async function moveFile(
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<StorageResult<{ path: string }>> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath);

    if (error) {
      return { data: null, error };
    }

    return {
      data: { path: (data as any)?.path || toPath },
      error: null,
    };
  } catch (error) {
    console.error(`Error moving file from ${fromPath} to ${toPath}:`, error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Copy a file
export async function copyFile(
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<StorageResult<{ path: string }>> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .copy(fromPath, toPath);

    if (error) {
      return { data: null, error };
    }

    return {
      data: { path: (data as any)?.path || toPath },
      error: null,
    };
  } catch (error) {
    console.error(`Error copying file from ${fromPath} to ${toPath}:`, error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

/**
 * Specialized Upload Functions
 */

// Upload user avatar
export async function uploadAvatar(
  userId: string,
  file: File,
  options?: UploadOptions
): Promise<StorageResult<UploadResult>> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;
  
  return uploadFile(STORAGE_BUCKETS.AVATARS, fileName, file, {
    contentType: file.type,
    upsert: true,
    ...options,
  });
}

// Upload post image
export async function uploadPostImage(
  postId: string,
  file: File,
  options?: UploadOptions
): Promise<StorageResult<UploadResult>> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${postId}/${Date.now()}.${fileExt}`;
  
  return uploadFile(STORAGE_BUCKETS.POSTS, fileName, file, {
    contentType: file.type,
    ...options,
  });
}

// Upload attachment
export async function uploadAttachment(
  userId: string,
  file: File,
  options?: UploadOptions
): Promise<StorageResult<UploadResult>> {
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${timestamp}_${file.name}`;
  
  return uploadFile(STORAGE_BUCKETS.ATTACHMENTS, fileName, file, {
    contentType: file.type,
    ...options,
  });
}

/**
 * Image Processing Utilities
 */

// Generate different image sizes (requires Supabase Image Transformation)
export function getImageUrl(
  bucket: string,
  path: string,
  options?: {
    width?: number;
    height?: number;
    resize?: 'cover' | 'contain' | 'fill';
    quality?: number;
  }
): string {
  const baseUrl = getPublicUrl(bucket, path);
  
  if (!options) {
    return baseUrl;
  }

  const params = new URLSearchParams();
  
  if (options.width) params.append('width', options.width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (options.resize) params.append('resize', options.resize);
  if (options.quality) params.append('quality', options.quality.toString());

  return `${baseUrl}?${params.toString()}`;
}

// Create thumbnail URL
export function getThumbnailUrl(
  bucket: string,
  path: string,
  size: number = 150
): string {
  return getImageUrl(bucket, path, {
    width: size,
    height: size,
    resize: 'cover',
    quality: 80,
  });
}

/**
 * Utility Functions
 */

// Check if file exists
export async function fileExists(
  bucket: string,
  path: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/') || undefined);

    if (error) {
      return false;
    }

    const fileName = path.split('/').pop();
    return data?.some(file => file.name === fileName) || false;
  } catch (error) {
    console.error(`Error checking if file exists ${bucket}/${path}:`, error);
    return false;
  }
}

// Get file size
export async function getFileSize(
  bucket: string,
  path: string
): Promise<number | null> {
  try {
    const metadata = await getFileMetadata(bucket, path);
    return metadata.data?.size || null;
  } catch (error) {
    console.error(`Error getting file size for ${bucket}/${path}:`, error);
    return null;
  }
}

// Validate file type
export function validateFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(file.type);
}

// Validate file size
export function validateFileSize(
  file: File,
  maxSize: number // in bytes
): boolean {
  return file.size <= maxSize;
}

// Generate unique filename
export function generateUniqueFileName(
  originalName: string,
  prefix?: string
): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileExt = originalName.split('.').pop();
  
  const baseName = prefix ? `${prefix}_${timestamp}_${randomString}` : `${timestamp}_${randomString}`;
  
  return `${baseName}.${fileExt}`;
}

// Convert file to base64 (browser only)
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if we're in a browser environment
    const isNode = typeof window === 'undefined';
    if (isNode) {
      reject(new Error('FileReader is not available in Node.js environment'));
      return;
    }
    
    // TypeScript workaround for window.FileReader
    const FileReaderClass = (globalThis as any).FileReader || (window as any).FileReader;
    if (!FileReaderClass) {
      reject(new Error('FileReader is not available in this environment'));
      return;
    }
    
    const reader = new FileReaderClass();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error: any) => reject(error);
  });
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}