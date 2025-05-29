// hooks/useFileUpload.js
import { useState, useCallback, useRef } from 'react';
import { fileUtils } from '../utils';
import { storageService } from '../services';

/**
 * Hook for handling file uploads
 * @param {Object} options - Upload configuration
 * @returns {Object} - Upload state and functions
 */
export const useFileUpload = (options = {}) => {
  const {
    maxFiles = 5,
    maxSize = 10 * 1024 * 1024, // 10MB
    acceptedTypes = null,
    autoUpload = true,
    onProgress = null,
    onSuccess = null,
    onError = null
  } = options;

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [uploadResults, setUploadResults] = useState({});

  const abortControllers = useRef(new Map());

  // Validate files before upload
  const validateFiles = useCallback((fileList) => {
    const validationErrors = {};
    const validFiles = [];

    Array.from(fileList).forEach((file, index) => {
      const fileKey = `${file.name}-${index}`;
      
      // Check file size
      if (!fileUtils.isValidFileSize(file, maxSize)) {
        validationErrors[fileKey] = `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`;
        return;
      }

      // Check file type
      if (acceptedTypes && !fileUtils.isValidFileType(file, acceptedTypes)) {
        validationErrors[fileKey] = `File type not allowed. Accepted: ${acceptedTypes}`;
        return;
      }

      validFiles.push(file);
    });

    return { validFiles, errors: validationErrors };
  }, [maxSize, acceptedTypes]);

  // Add files to upload queue
  const addFiles = useCallback((fileList) => {
    const { validFiles, errors: validationErrors } = validateFiles(fileList);
    
    setErrors(prev => ({ ...prev, ...validationErrors }));

    if (validFiles.length === 0) return;

    // Check max files limit
    let filesToAdd = validFiles;
    if (maxFiles && files.length + validFiles.length > maxFiles) {
      const remainingSlots = maxFiles - files.length;
      filesToAdd = validFiles.slice(0, remainingSlots);
      
      if (remainingSlots < validFiles.length) {
        setErrors(prev => ({
          ...prev,
          maxFiles: `Maximum ${maxFiles} files allowed`
        }));
      }
    }

    const newFiles = filesToAdd.map((file, index) => ({
      id: `${file.name}-${Date.now()}-${index}`,
      file,
      status: 'pending',
      progress: 0,
      url: null,
      error: null
    }));

    setFiles(prev => [...prev, ...newFiles]);

    if (autoUpload) {
      uploadFiles(newFiles);
    }
  }, [files.length, maxFiles, validateFiles, autoUpload]);

  // Upload files
  const uploadFiles = useCallback(async (filesToUpload = null) => {
    const targetFiles = filesToUpload || files.filter(f => f.status === 'pending');
    
    if (targetFiles.length === 0) return;

    setUploading(true);

    const uploadPromises = targetFiles.map(async (fileItem) => {
      const controller = new AbortController();
      abortControllers.current.set(fileItem.id, controller);

      try {
        // Update file status
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'uploading' } : f
        ));

        // Simulate upload progress (replace with actual upload service)
        const result = await simulateFileUpload(fileItem, {
          onProgress: (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [fileItem.id]: progress
            }));
            onProgress?.(fileItem.id, progress);
          },
          signal: controller.signal
        });

        // Update file with success result
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'completed', url: result.url, progress: 100 }
            : f
        ));

        setUploadResults(prev => ({
          ...prev,
          [fileItem.id]: result
        }));

        onSuccess?.(fileItem.id, result);

      } catch (error) {
        if (error.name === 'AbortError') {
          // Upload was cancelled
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, status: 'cancelled' } : f
          ));
        } else {
          // Upload failed
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'failed', error: error.message }
              : f
          ));

          setErrors(prev => ({
            ...prev,
            [fileItem.id]: error.message
          }));

          onError?.(fileItem.id, error);
        }
      } finally {
        abortControllers.current.delete(fileItem.id);
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[fileItem.id];
          return updated;
        });
      }
    });

    await Promise.all(uploadPromises);
    setUploading(false);
  }, [files, onProgress, onSuccess, onError]);

  // Cancel upload
  const cancelUpload = useCallback((fileId) => {
    const controller = abortControllers.current.get(fileId);
    if (controller) {
      controller.abort();
    }
  }, []);

  // Remove file
  const removeFile = useCallback((fileId) => {
    // Cancel upload if in progress
    cancelUpload(fileId);

    // Remove from state
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
    setUploadResults(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
  }, [cancelUpload]);

  // Clear all files
  const clearFiles = useCallback(() => {
    // Cancel all uploads
    abortControllers.current.forEach(controller => controller.abort());
    abortControllers.current.clear();

    setFiles([]);
    setErrors({});
    setUploadProgress({});
    setUploadResults({});
    setUploading(false);
  }, []);

  // Retry failed upload
  const retryUpload = useCallback((fileId) => {
    const fileToRetry = files.find(f => f.id === fileId);
    if (fileToRetry && fileToRetry.status === 'failed') {
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'pending', error: null } : f
      ));
      
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[fileId];
        return updated;
      });

      uploadFiles([{ ...fileToRetry, status: 'pending' }]);
    }
  }, [files, uploadFiles]);

  // Get files by status
  const getFilesByStatus = useCallback((status) => {
    return files.filter(f => f.status === status);
  }, [files]);

  // Get upload statistics
  const getUploadStats = useCallback(() => {
    const total = files.length;
    const completed = files.filter(f => f.status === 'completed').length;
    const failed = files.filter(f => f.status === 'failed').length;
    const uploading = files.filter(f => f.status === 'uploading').length;
    const pending = files.filter(f => f.status === 'pending').length;

    return {
      total,
      completed,
      failed,
      uploading,
      pending,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }, [files]);

  return {
    files,
    uploading,
    uploadProgress,
    errors,
    uploadResults,
    addFiles,
    uploadFiles,
    cancelUpload,
    removeFile,
    clearFiles,
    retryUpload,
    getFilesByStatus,
    getUploadStats
  };
};

/**
 * Hook for handling drag and drop file uploads
 * @param {Object} uploadHook - Result from useFileUpload hook
 * @param {Object} options - Drag and drop options
 * @returns {Object} - Drag and drop handlers
 */
export const useFileDropzone = (uploadHook, options = {}) => {
  const { disabled = false } = options;
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setIsDragActive(true);
    setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    // Check if we're leaving the dropzone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
      setIsDragActive(false);
    }
  }, [disabled]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setIsDragOver(true);
  }, [disabled]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragOver(false);
    setIsDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadHook.addFiles(files);
    }
  }, [disabled, uploadHook]);

  const dropzoneProps = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop
  };

  return {
    isDragOver,
    isDragActive,
    dropzoneProps
  };
};

/**
 * Hook for file preview functionality
 * @param {Array} files - Array of file objects
 * @returns {Object} - Preview functions and state
 */
export const useFilePreview = (files = []) => {
  const [previews, setPreviews] = useState({});
  const [loadingPreviews, setLoadingPreviews] = useState(new Set());

  // Generate preview for a file
  const generatePreview = useCallback(async (fileItem) => {
    const { id, file } = fileItem;
    
    if (!file || loadingPreviews.has(id)) return;

    setLoadingPreviews(prev => new Set([...prev, id]));

    try {
      let previewUrl = null;

      if (file.type.startsWith('image/')) {
        previewUrl = await fileUtils.readFileAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        // For PDFs, you might want to use a PDF preview library
        previewUrl = 'pdf-icon-url';
      }

      setPreviews(prev => ({
        ...prev,
        [id]: {
          url: previewUrl,
          type: file.type,
          name: file.name
        }
      }));
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setLoadingPreviews(prev => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
    }
  }, [loadingPreviews]);

  // Generate previews for multiple files
  const generatePreviews = useCallback((fileList) => {
    fileList.forEach(generatePreview);
  }, [generatePreview]);

  // Clean up preview URLs
  const cleanupPreview = useCallback((fileId) => {
    const preview = previews[fileId];
    if (preview?.url && preview.url.startsWith('blob:')) {
      URL.revokeObjectURL(preview.url);
    }

    setPreviews(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
  }, [previews]);

  // Clean up all previews
  const cleanupAllPreviews = useCallback(() => {
    Object.values(previews).forEach(preview => {
      if (preview.url && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
    });
    setPreviews({});
  }, [previews]);

  return {
    previews,
    loadingPreviews: Array.from(loadingPreviews),
    generatePreview,
    generatePreviews,
    cleanupPreview,
    cleanupAllPreviews
  };
};

// Simulate file upload (replace with actual upload service)
const simulateFileUpload = async (fileItem, options = {}) => {
  const { onProgress, signal } = options;
  
  return new Promise((resolve, reject) => {
    let progress = 0;
    
    const interval = setInterval(() => {
      if (signal?.aborted) {
        clearInterval(interval);
        reject(new Error('Upload cancelled'));
        return;
      }

      progress += Math.random() * 20;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Simulate successful upload result
        resolve({
          url: `https://example.com/uploads/${fileItem.file.name}`,
          size: fileItem.file.size,
          type: fileItem.file.type,
          uploadedAt: new Date().toISOString()
        });
      }
      
      onProgress?.(progress);
    }, 100 + Math.random() * 200);
  });
};

export default useFileUpload;