import { FILE_UPLOAD } from './constants.js';

/**
 * File utility functions for the Form Builder module
 */

/**
 * Validate file against constraints
 * @param {File} file - File to validate
 * @param {object} constraints - File constraints
 * @returns {object} Validation result
 */
export const validateFile = (file, constraints = {}) => {
  const errors = [];
  const warnings = [];
  
  if (!file || !(file instanceof File)) {
    errors.push('Invalid file object');
    return { isValid: false, errors, warnings };
  }
  
  const {
    maxSize = FILE_UPLOAD.MAX_SIZE.DEFAULT,
    allowedTypes = [],
    minSize = 0,
    allowedExtensions = [],
    forbiddenExtensions = []
  } = constraints;
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`);
  }
  
  if (file.size < minSize) {
    errors.push(`File size (${formatFileSize(file.size)}) is below minimum required size (${formatFileSize(minSize)})`);
  }
  
  // Check file type
  if (allowedTypes.length > 0) {
    const isAllowedType = allowedTypes.some(type => {
      if (type === '*') return true;
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return file.type.startsWith(category + '/');
      }
      return file.type === type;
    });
    
    if (!isAllowedType) {
      errors.push(`File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }
  
  // Check file extension
  const fileExtension = getFileExtension(file.name).toLowerCase();
  
  if (allowedExtensions.length > 0) {
    const isAllowedExtension = allowedExtensions.some(ext => 
      fileExtension === ext.toLowerCase().replace('.', '')
    );
    
    if (!isAllowedExtension) {
      errors.push(`File extension "${fileExtension}" is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
    }
  }
  
  if (forbiddenExtensions.length > 0) {
    const isForbiddenExtension = forbiddenExtensions.some(ext => 
      fileExtension === ext.toLowerCase().replace('.', '')
    );
    
    if (isForbiddenExtension) {
      errors.push(`File extension "${fileExtension}" is not allowed`);
    }
  }
  
  // Add warnings for large files
  if (file.size > 5 * 1024 * 1024) { // 5MB
    warnings.push('Large file detected. Upload may take longer.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileInfo: getFileInfo(file)
  };
};

/**
 * Get file information
 * @param {File} file - File object
 * @returns {object} File information
 */
export const getFileInfo = (file) => {
  if (!file || !(file instanceof File)) {
    return null;
  }
  
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    lastModifiedDate: new Date(file.lastModified),
    extension: getFileExtension(file.name),
    category: getFileCategory(file.type),
    isImage: isImageFile(file),
    isVideo: isVideoFile(file),
    isAudio: isAudioFile(file),
    isDocument: isDocumentFile(file),
    formattedSize: formatFileSize(file.size)
  };
};

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} File extension (without dot)
 */
export const getFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

/**
 * Get file category based on MIME type
 * @param {string} mimeType - MIME type
 * @returns {string} File category
 */
export const getFileCategory = (mimeType) => {
  if (!mimeType) return 'unknown';
  
  const [category] = mimeType.split('/');
  
  switch (category) {
    case 'image':
      return 'image';
    case 'video':
      return 'video';
    case 'audio':
      return 'audio';
    case 'text':
      return 'document';
    case 'application':
      if (mimeType.includes('pdf')) return 'document';
      if (mimeType.includes('word')) return 'document';
      if (mimeType.includes('excel')) return 'spreadsheet';
      if (mimeType.includes('powerpoint')) return 'presentation';
      if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive';
      return 'application';
    default:
      return 'unknown';
  }
};

/**
 * Check if file is an image
 * @param {File} file - File object
 * @returns {boolean} True if image file
 */
export const isImageFile = (file) => {
  return file && file.type.startsWith('image/');
};

/**
 * Check if file is a video
 * @param {File} file - File object
 * @returns {boolean} True if video file
 */
export const isVideoFile = (file) => {
  return file && file.type.startsWith('video/');
};

/**
 * Check if file is an audio file
 * @param {File} file - File object
 * @returns {boolean} True if audio file
 */
export const isAudioFile = (file) => {
  return file && file.type.startsWith('audio/');
};

/**
 * Check if file is a document
 * @param {File} file - File object
 * @returns {boolean} True if document file
 */
export const isDocumentFile = (file) => {
  if (!file) return false;
  
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ];
  
  return documentTypes.includes(file.type) || file.type.startsWith('text/');
};

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return 'Unknown';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Read file as text
 * @param {File} file - File to read
 * @param {string} encoding - Text encoding
 * @returns {Promise<string>} File content as text
 */
export const readFileAsText = (file, encoding = 'UTF-8') => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error('Invalid file object'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = (event) => {
      reject(new Error('Failed to read file: ' + event.target.error));
    };
    
    reader.readAsText(file, encoding);
  });
};

/**
 * Read file as data URL
 * @param {File} file - File to read
 * @returns {Promise<string>} File content as data URL
 */
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error('Invalid file object'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = (event) => {
      reject(new Error('Failed to read file: ' + event.target.error));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Create file preview URL
 * @param {File} file - File to create preview for
 * @returns {Promise<string>} Preview URL
 */
export const createFilePreview = async (file) => {
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file object');
  }
  
  if (isImageFile(file)) {
    return await readFileAsDataURL(file);
  }
  
  if (isVideoFile(file)) {
    return URL.createObjectURL(file);
  }
  
  // For other file types, return a placeholder or icon
  return null;
};

/**
 * Generate file hash (simple checksum)
 * @param {File} file - File to hash
 * @returns {string} File hash
 */
export const generateFileHash = (file) => {
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file object');
  }
  
  // Simple hash based on file size, name, and last modified
  const data = `${file.name}-${file.size}-${file.lastModified}`;
  let hash = 0;
  
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
};

/**
 * Get file icon based on file type
 * @param {File|string} file - File object or MIME type
 * @returns {string} Icon identifier or emoji
 */
export const getFileIcon = (file) => {
  const mimeType = typeof file === 'string' ? file : file?.type || '';
  const extension = typeof file === 'string' ? '' : getFileExtension(file?.name || '');
  
  // Image files
  if (mimeType.startsWith('image/')) {
    return '🖼️';
  }
  
  // Video files
  if (mimeType.startsWith('video/')) {
    return '🎥';
  }
  
  // Audio files
  if (mimeType.startsWith('audio/')) {
    return '🎵';
  }
  
  // Document files
  if (mimeType === 'application/pdf') {
    return '📄';
  }
  
  if (mimeType.includes('word') || extension === 'doc' || extension === 'docx') {
    return '📝';
  }
  
  if (mimeType.includes('excel') || extension === 'xls' || extension === 'xlsx') {
    return '📊';
  }
  
  if (mimeType.includes('powerpoint') || extension === 'ppt' || extension === 'pptx') {
    return '📽️';
  }
  
  // Archive files
  if (mimeType.includes('zip') || mimeType.includes('rar') || ['zip', 'rar', '7z'].includes(extension)) {
    return '📦';
  }
  
  // Text files
  if (mimeType.startsWith('text/') || extension === 'txt') {
    return '📄';
  }
  
  // Default
  return '📁';
};

/**
 * Create file metadata object
 * @param {File} file - File object
 * @param {object} additionalData - Additional metadata
 * @returns {object} File metadata
 */
export const createFileMetadata = (file, additionalData = {}) => {
  if (!file || !(file instanceof File)) {
    return null;
  }
  
  return {
    // Basic file info
    id: generateFileId(),
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    
    // Processed info
    extension: getFileExtension(file.name),
    category: getFileCategory(file.type),
    formattedSize: formatFileSize(file.size),
    icon: getFileIcon(file),
    hash: generateFileHash(file),
    
    // Upload tracking
    uploadProgress: 0,
    uploadStatus: 'pending', // pending, uploading, completed, failed
    uploadedAt: null,
    
    // Additional metadata
    ...additionalData,
    
    // Timestamps
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Generate unique file ID
 * @returns {string} Unique file ID
 */
export const generateFileId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  return `file_${timestamp}_${randomPart}`;
};

/**
 * Batch validate multiple files
 * @param {FileList|Array<File>} files - Files to validate
 * @param {object} constraints - Validation constraints
 * @returns {object} Batch validation result
 */
export const batchValidateFiles = (files, constraints = {}) => {
  const results = [];
  const validFiles = [];
  const invalidFiles = [];
  let totalErrors = 0;
  let totalWarnings = 0;
  
  const fileArray = Array.from(files);
  
  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    const result = validateFile(file, constraints);
    
    result.index = i;
    results.push(result);
    
    if (result.isValid) {
      validFiles.push(file);
    } else {
      invalidFiles.push(file);
    }
    
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
  }
  
  return {
    isValid: invalidFiles.length === 0,
    results,
    validFiles,
    invalidFiles,
    summary: {
      totalFiles: fileArray.length,
      validFiles: validFiles.length,
      invalidFiles: invalidFiles.length,
      totalErrors,
      totalWarnings,
      totalSize: fileArray.reduce((sum, file) => sum + file.size, 0),
      formattedTotalSize: formatFileSize(fileArray.reduce((sum, file) => sum + file.size, 0))
    }
  };
};

export default {
  validateFile,
  getFileInfo,
  getFileExtension,
  getFileCategory,
  isImageFile,
  isVideoFile,
  isAudioFile,
  isDocumentFile,
  formatFileSize,
  readFileAsText,
  readFileAsDataURL,
  createFilePreview,
  generateFileHash,
  getFileIcon,
  createFileMetadata,
  generateFileId,
  batchValidateFiles
};