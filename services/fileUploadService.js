import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata 
} from 'firebase/storage';
import { storage } from '../firebase/config.js';
import { 
  validateFile, 
  createFileMetadata, 
  generateFileId,
  createFilePreview,
  batchValidateFiles 
} from '../utils/fileUtils.js';
import { FILE_UPLOAD } from '../utils/constants.js';

/**
 * File Upload Service
 * Handles file uploads, validation, and management with Firebase Storage
 */
class FileUploadService {
  constructor() {
    this.storage = storage;
    this.activeUploads = new Map();
    this.uploadHistory = [];
    this.defaultConstraints = {
      maxSize: FILE_UPLOAD.MAX_SIZE.DEFAULT,
      allowedTypes: FILE_UPLOAD.ALLOWED_TYPES.IMAGES
    };
  }

  // ============================================================================
  // SINGLE FILE UPLOAD
  // ============================================================================

  /**
   * Upload a single file
   * @param {File} file - File to upload
   * @param {object} options - Upload options
   * @returns {Promise<object>} Upload result
   */
  async uploadFile(file, options = {}) {
    const {
      path = null,
      constraints = this.defaultConstraints,
      metadata = {},
      onProgress = null,
      onStateChange = null
    } = options;

    // Generate upload ID
    const uploadId = generateFileId();

    try {
      // Validate file
      const validation = validateFile(file, constraints);
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate storage path
      const storagePath = path || this._generateStoragePath(file);
      const storageRef = ref(this.storage, storagePath);

      // Create file metadata
      const fileMetadata = createFileMetadata(file, {
        uploadId,
        storagePath,
        constraints,
        ...metadata
      });

      // Start upload tracking
      this._trackUploadStart(uploadId, fileMetadata);

      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file, {
        customMetadata: {
          uploadId,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          ...metadata
        }
      });

      // Track upload progress
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            // Progress callback
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            const state = snapshot.state;

            this._updateUploadProgress(uploadId, progress, state);

            onProgress?.({
              uploadId,
              progress,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              state
            });

            onStateChange?.(snapshot);
          },
          (error) => {
            // Error callback
            this._trackUploadError(uploadId, error);
            reject(new Error(`Upload failed: ${error.message}`));
          },
          async () => {
            // Success callback
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const finalMetadata = await getMetadata(uploadTask.snapshot.ref);

              const result = {
                uploadId,
                success: true,
                file: {
                  id: uploadId,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  url: downloadURL,
                  path: storagePath,
                  metadata: finalMetadata,
                  uploadedAt: new Date().toISOString()
                }
              };

              this._trackUploadComplete(uploadId, result);
              resolve(result);

            } catch (error) {
              this._trackUploadError(uploadId, error);
              reject(error);
            }
          }
        );

        // Store upload task for potential cancellation
        this.activeUploads.set(uploadId, {
          task: uploadTask,
          metadata: fileMetadata,
          startedAt: new Date().toISOString()
        });
      });

    } catch (error) {
      this._trackUploadError(uploadId, error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   * @param {FileList|Array} files - Files to upload
   * @param {object} options - Upload options
   * @returns {Promise<object>} Batch upload result
   */
  async uploadFiles(files, options = {}) {
    const {
      constraints = this.defaultConstraints,
      maxConcurrent = 3,
      onFileProgress = null,
      onBatchProgress = null,
      stopOnError = false
    } = options;

    const fileArray = Array.from(files);
    
    // Batch validate files
    const validation = batchValidateFiles(fileArray, constraints);
    
    if (!validation.isValid && stopOnError) {
      throw new Error(`Batch validation failed: ${validation.summary.totalErrors} errors found`);
    }

    const results = {
      uploadId: generateFileId(),
      total: fileArray.length,
      successful: [],
      failed: [],
      summary: validation.summary
    };

    // Process files in batches
    const batches = this._createBatches(validation.validFiles, maxConcurrent);
    let completedCount = 0;

    for (const batch of batches) {
      const batchPromises = batch.map(async (file) => {
        try {
          const result = await this.uploadFile(file, {
            ...options,
            onProgress: (progress) => {
              onFileProgress?.(file, progress);
            }
          });

          results.successful.push(result);
          completedCount++;

          onBatchProgress?.({
            completed: completedCount,
            total: fileArray.length,
            percentage: (completedCount / fileArray.length) * 100
          });

          return result;

        } catch (error) {
          const failedResult = {
            file: file.name,
            error: error.message,
            failedAt: new Date().toISOString()
          };

          results.failed.push(failedResult);
          completedCount++;

          onBatchProgress?.({
            completed: completedCount,
            total: fileArray.length,
            percentage: (completedCount / fileArray.length) * 100
          });

          if (stopOnError) {
            throw error;
          }

          return failedResult;
        }
      });

      await Promise.all(batchPromises);
    }

    return results;
  }

  // ============================================================================
  // UPLOAD MANAGEMENT
  // ============================================================================

  /**
   * Cancel active upload
   * @param {string} uploadId - Upload ID to cancel
   * @returns {boolean} True if cancelled successfully
   */
  cancelUpload(uploadId) {
    const upload = this.activeUploads.get(uploadId);
    
    if (upload && upload.task) {
      upload.task.cancel();
      this.activeUploads.delete(uploadId);
      this._trackUploadCancellation(uploadId);
      return true;
    }
    
    return false;
  }

  /**
   * Pause active upload
   * @param {string} uploadId - Upload ID to pause
   * @returns {boolean} True if paused successfully
   */
  pauseUpload(uploadId) {
    const upload = this.activeUploads.get(uploadId);
    
    if (upload && upload.task) {
      upload.task.pause();
      return true;
    }
    
    return false;
  }

  /**
   * Resume paused upload
   * @param {string} uploadId - Upload ID to resume
   * @returns {boolean} True if resumed successfully
   */
  resumeUpload(uploadId) {
    const upload = this.activeUploads.get(uploadId);
    
    if (upload && upload.task) {
      upload.task.resume();
      return true;
    }
    
    return false;
  }

  /**
   * Get active uploads
   * @returns {array} Active uploads
   */
  getActiveUploads() {
    return Array.from(this.activeUploads.entries()).map(([id, upload]) => ({
      uploadId: id,
      metadata: upload.metadata,
      startedAt: upload.startedAt,
      state: upload.task?.snapshot?.state || 'unknown'
    }));
  }

  /**
   * Get upload progress
   * @param {string} uploadId - Upload ID
   * @returns {object|null} Upload progress
   */
  getUploadProgress(uploadId) {
    const upload = this.activeUploads.get(uploadId);
    
    if (upload && upload.task) {
      const snapshot = upload.task.snapshot;
      return {
        uploadId,
        progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        bytesTransferred: snapshot.bytesTransferred,
        totalBytes: snapshot.totalBytes,
        state: snapshot.state
      };
    }
    
    return null;
  }

  // ============================================================================
  // FILE MANAGEMENT
  // ============================================================================

  /**
   * Delete file from storage
   * @param {string} path - File path in storage
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteFile(path) {
    try {
      const fileRef = ref(this.storage, path);
      await deleteObject(fileRef);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Delete multiple files
   * @param {array} paths - Array of file paths
   * @returns {Promise<object>} Deletion result
   */
  async deleteFiles(paths) {
    const results = {
      successful: [],
      failed: []
    };

    for (const path of paths) {
      try {
        await this.deleteFile(path);
        results.successful.push(path);
      } catch (error) {
        results.failed.push({
          path,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get file metadata
   * @param {string} path - File path in storage
   * @returns {Promise<object>} File metadata
   */
  async getFileMetadata(path) {
    try {
      const fileRef = ref(this.storage, path);
      const metadata = await getMetadata(fileRef);
      const downloadURL = await getDownloadURL(fileRef);

      return {
        ...metadata,
        downloadURL,
        path
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * List files in a directory
   * @param {string} directoryPath - Directory path
   * @returns {Promise<array>} Array of file references
   */
  async listFiles(directoryPath) {
    try {
      const dirRef = ref(this.storage, directoryPath);
      const result = await listAll(dirRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const metadata = await getMetadata(itemRef);
          const downloadURL = await getDownloadURL(itemRef);
          
          return {
            name: itemRef.name,
            path: itemRef.fullPath,
            downloadURL,
            metadata
          };
        })
      );

      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  // ============================================================================
  // FILE PROCESSING
  // ============================================================================

  /**
   * Create file preview
   * @param {File} file - File to create preview for
   * @returns {Promise<string|null>} Preview URL or null
   */
  async createPreview(file) {
    try {
      return await createFilePreview(file);
    } catch (error) {
      console.error('Error creating file preview:', error);
      return null;
    }
  }

  /**
   * Resize image file
   * @param {File} file - Image file to resize
   * @param {object} options - Resize options
   * @returns {Promise<File>} Resized file
   */
  async resizeImage(file, options = {}) {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'image/jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and resize image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: format,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to resize image'));
          }
        }, format, quality);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for resizing'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Compress file
   * @param {File} file - File to compress
   * @param {object} options - Compression options
   * @returns {Promise<File>} Compressed file
   */
  async compressFile(file, options = {}) {
    // For images, use resizing with lower quality
    if (file.type.startsWith('image/')) {
      return this.resizeImage(file, {
        quality: options.quality || 0.6,
        ...options
      });
    }

    // For other files, return original (compression would require additional libraries)
    return file;
  }

  // ============================================================================
  // ANALYTICS AND MONITORING
  // ============================================================================

  /**
   * Get upload statistics
   * @param {object} filters - Filter options
   * @returns {object} Upload statistics
   */
  getUploadStats(filters = {}) {
    let history = [...this.uploadHistory];

    // Apply filters
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      history = history.filter(upload => {
        const uploadDate = new Date(upload.uploadedAt || upload.startedAt);
        return uploadDate >= start && uploadDate <= end;
      });
    }

    if (filters.fileType) {
      history = history.filter(upload => 
        upload.metadata?.type?.startsWith(filters.fileType)
      );
    }

    // Calculate statistics
    const stats = {
      totalUploads: history.length,
      successfulUploads: history.filter(u => u.status === 'completed').length,
      failedUploads: history.filter(u => u.status === 'failed').length,
      totalSize: history.reduce((sum, u) => sum + (u.metadata?.size || 0), 0),
      averageSize: 0,
      fileTypeBreakdown: {},
      uploadsByDate: {}
    };

    // Calculate averages
    if (history.length > 0) {
      stats.averageSize = stats.totalSize / history.length;
    }

    // File type breakdown
    history.forEach(upload => {
      const type = upload.metadata?.type?.split('/')[0] || 'unknown';
      stats.fileTypeBreakdown[type] = (stats.fileTypeBreakdown[type] || 0) + 1;
    });

    // Uploads by date
    history.forEach(upload => {
      const date = new Date(upload.uploadedAt || upload.startedAt).toISOString().split('T')[0];
      stats.uploadsByDate[date] = (stats.uploadsByDate[date] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear upload history
   * @param {object} options - Clear options
   */
  clearUploadHistory(options = {}) {
    const { olderThan = null } = options;

    if (olderThan) {
      const cutoffDate = new Date(olderThan);
      this.uploadHistory = this.uploadHistory.filter(upload => 
        new Date(upload.uploadedAt || upload.startedAt) >= cutoffDate
      );
    } else {
      this.uploadHistory = [];
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Generate storage path for file
   * @param {File} file - File object
   * @returns {string} Storage path
   */
  _generateStoragePath(file) {
    const timestamp = new Date().toISOString().split('T')[0];
    const randomId = Math.random().toString(36).substr(2, 9);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    return `uploads/${timestamp}/${randomId}_${sanitizedName}`;
  }

  /**
   * Create batches for concurrent uploads
   * @param {array} files - Files array
   * @param {number} batchSize - Batch size
   * @returns {array} Array of batches
   */
  _createBatches(files, batchSize) {
    const batches = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * Track upload start
   * @param {string} uploadId - Upload ID
   * @param {object} metadata - File metadata
   */
  _trackUploadStart(uploadId, metadata) {
    const uploadRecord = {
      uploadId,
      metadata,
      status: 'started',
      startedAt: new Date().toISOString(),
      progress: 0
    };

    this.uploadHistory.push(uploadRecord);
  }

  /**
   * Update upload progress
   * @param {string} uploadId - Upload ID
   * @param {number} progress - Progress percentage
   * @param {string} state - Upload state
   */
  _updateUploadProgress(uploadId, progress, state) {
    const uploadRecord = this.uploadHistory.find(u => u.uploadId === uploadId);
    
    if (uploadRecord) {
      uploadRecord.progress = progress;
      uploadRecord.state = state;
      uploadRecord.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Track upload completion
   * @param {string} uploadId - Upload ID
   * @param {object} result - Upload result
   */
  _trackUploadComplete(uploadId, result) {
    const uploadRecord = this.uploadHistory.find(u => u.uploadId === uploadId);
    
    if (uploadRecord) {
      uploadRecord.status = 'completed';
      uploadRecord.completedAt = new Date().toISOString();
      uploadRecord.result = result;
      uploadRecord.progress = 100;
    }

    // Remove from active uploads
    this.activeUploads.delete(uploadId);
  }

  /**
   * Track upload error
   * @param {string} uploadId - Upload ID
   * @param {Error} error - Error object
   */
  _trackUploadError(uploadId, error) {
    const uploadRecord = this.uploadHistory.find(u => u.uploadId === uploadId);
    
    if (uploadRecord) {
      uploadRecord.status = 'failed';
      uploadRecord.failedAt = new Date().toISOString();
      uploadRecord.error = error.message;
    }

    // Remove from active uploads
    this.activeUploads.delete(uploadId);
  }

  /**
   * Track upload cancellation
   * @param {string} uploadId - Upload ID
   */
  _trackUploadCancellation(uploadId) {
    const uploadRecord = this.uploadHistory.find(u => u.uploadId === uploadId);
    
    if (uploadRecord) {
      uploadRecord.status = 'cancelled';
      uploadRecord.cancelledAt = new Date().toISOString();
    }
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();
export default fileUploadService;