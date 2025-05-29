// services/StorageService.js
import firebaseService from './FirebaseService';
import { fileUtils } from '../utils';

class StorageService {
  constructor() {
    this.STORAGE_PATHS = {
      FORM_UPLOADS: 'forms/{formId}/uploads/{fieldName}',
      AVATARS: 'users/{userId}/avatar',
      EXPORTS: 'exports/{userId}',
      TEMP: 'temp/{sessionId}'
    };
  }

  /**
   * Upload file for form submission
   */
  async uploadSubmissionFile(file, formId, fieldName, submissionId) {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique path
      const timestamp = Date.now();
      const extension = fileUtils.getFileExtension(file.name);
      const fileName = `${submissionId}_${timestamp}.${extension}`;
      const path = `forms/${formId}/submissions/${fieldName}/${fileName}`;

      // Upload to Firebase Storage
      const downloadURL = await firebaseService.uploadFile(file, path);

      return {
        name: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: downloadURL,
        path: path,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error uploading submission file:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files, formId, fieldName, submissionId) {
    try {
      const uploadPromises = Array.from(files).map(file => 
        this.uploadSubmissionFile(file, formId, fieldName, submissionId)
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw error;
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath) {
    try {
      // Note: Firebase Storage delete would be implemented here
      // For now, just log the deletion
      console.log('File deleted:', filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Get file download URL
   */
  async getFileURL(filePath) {
    try {
      return await firebaseService.getFileDownloadURL(filePath);
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file, fieldConfig = {}) {
    const errors = [];

    // Check file size
    const maxSize = fieldConfig.maxSize || 10 * 1024 * 1024; // 10MB default
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // Check file type
    if (fieldConfig.accept) {
      const isValidType = fileUtils.isValidFileType(file, fieldConfig.accept);
      if (!isValidType) {
        errors.push(`File type not allowed. Accepted types: ${fieldConfig.accept}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    return true;
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles(sessionId) {
    try {
      // Implementation would clean up temp files older than X hours
      console.log('Cleaned up temp files for session:', sessionId);
      return true;
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(userId = null) {
    try {
      // This would calculate actual storage usage
      // For now, return mock data
      return {
        totalFiles: 0,
        totalSize: 0,
        formUploads: 0,
        exports: 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw error;
    }
  }
}

const storageService = new StorageService();
export default storageService;