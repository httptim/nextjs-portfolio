// lib/blob-storage.ts
import { PutBlobResult } from '@vercel/blob';
import { prisma } from './prisma';

export interface UploadResult {
  success: boolean;
  fileId?: string;
  url?: string;
  error?: string;
}

/**
 * Uploads a file to Vercel Blob storage and creates a database record
 * 
 * @param file The file to upload
 * @param projectId Optional project ID to associate the file with
 * @param taskId Optional task ID to associate the file with
 */
export async function uploadFile(
  file: File, 
  projectId?: string, 
  taskId?: string
): Promise<UploadResult> {
  try {
    // Generate a unique filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    
    // Upload the file to Vercel Blob
    const response = await fetch(`/api/upload?filename=${fileName}`, {
      method: 'POST',
      body: file,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
    
    const blob: PutBlobResult = await response.json();
    
    // Create a database record for the file
    const fileRecord = await prisma.file.create({
      data: {
        name: file.name,
        type: file.type,
        size: file.size,
        url: blob.url,
        key: blob.url,
        projectId,
        taskId,
      },
    });
    
    return {
      success: true,
      fileId: fileRecord.id,
      url: blob.url,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during file upload',
    };
  }
}

/**
 * Delete a file from Vercel Blob storage and remove the database record
 * 
 * @param fileId The database ID of the file to delete
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    // Get the file from the database
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });
    
    if (!file) {
      return false;
    }
    
    // Delete from Vercel Blob
    const response = await fetch('/api/delete-blob', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: file.key }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
    
    // Delete the database record
    await prisma.file.delete({
      where: { id: fileId },
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}