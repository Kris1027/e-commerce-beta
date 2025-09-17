'use server';

import { auth } from '@/auth';
import { UserRole } from '@prisma/client';
import { UTApi } from 'uploadthing/server';
import { extractFileKeys } from '@/lib/utils/uploadthing';

const utapi = new UTApi();

/**
 * Delete files from UploadThing storage
 * Admin only action to clean up unused uploads
 */
export async function deleteUploadThingFiles(fileKeys: string[]) {
  try {
    // Check if user is admin
    const session = await auth();

    if (!session?.user?.role || session.user.role !== UserRole.admin) {
      return {
        success: false,
        message: 'Unauthorized. Admin access required.'
      };
    }

    if (!fileKeys || fileKeys.length === 0) {
      return {
        success: true,
        message: 'No files to delete'
      };
    }

    // Delete files from UploadThing
    const result = await utapi.deleteFiles(fileKeys);

    console.log(`Deleted ${fileKeys.length} files from UploadThing:`, fileKeys);

    return {
      success: result.success,
      message: result.success
        ? `Successfully deleted ${fileKeys.length} file(s)`
        : 'Failed to delete some files',
      deletedCount: fileKeys.length
    };
  } catch (error) {
    console.error('Error deleting UploadThing files:', error);
    return {
      success: false,
      message: 'Failed to delete files',
    };
  }
}

/**
 * Delete files by URLs
 * Convenience function that extracts keys from URLs
 */
export async function deleteUploadThingFilesByUrls(urls: string[]) {
  const fileKeys = extractFileKeys(urls);

  if (fileKeys.length === 0) {
    return {
      success: false,
      message: 'No valid file URLs provided',
    };
  }

  return deleteUploadThingFiles(fileKeys);
}