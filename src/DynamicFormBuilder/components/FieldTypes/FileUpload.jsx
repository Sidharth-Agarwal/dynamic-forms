// components/FieldTypes/FileUpload.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, File, Image, AlertCircle, Check } from 'lucide-react';
import { FieldTooltip, Button, LoadingSpinner } from '../UI';
import { validateField } from '../../utils/validators';
import { formatBytes, fileUtils } from '../../utils';

const FileUpload = ({
  field,
  value = null,
  onChange,
  onBlur,
  error = null,
  disabled = false,
  mode = 'renderer',
  className = ''
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    setInternalValue(value);
    
    // Generate preview URLs for image files
    if (value) {
      const files = Array.isArray(value) ? value : [value];
      const newPreviewUrls = {};
      
      files.forEach((file, index) => {
        if (file && file.type?.startsWith('image/')) {
          if (file instanceof File) {
            newPreviewUrls[index] = URL.createObjectURL(file);
          } else if (file.url) {
            newPreviewUrls[index] = file.url;
          }
        }
      });
      
      setPreviewUrls(newPreviewUrls);
    }
  }, [value]);

  const handleFileSelect = (files) => {
    const selectedFiles = Array.from(files);
    
    // Validate files
    const validFiles = selectedFiles.filter(file => {
      // Check file type
      if (field.accept && !fileUtils.isValidFileType(file, field.accept)) {
        return false;
      }
      
      // Check file size
      if (field.maxSize && !fileUtils.isValidFileSize(file, field.maxSize)) {
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    let newValue;
    if (field.multiple) {
      const currentFiles = Array.isArray(internalValue) ? internalValue : [];
      newValue = [...currentFiles, ...validFiles];
      
      // Check max files limit
      if (field.maxFiles && newValue.length > field.maxFiles) {
        newValue = newValue.slice(0, field.maxFiles);
      }
    } else {
      newValue = validFiles[0];
    }

    setInternalValue(newValue);
    onChange?.(newValue);

    // Simulate upload progress (in real app, this would be actual upload)
    if (mode === 'renderer') {
      validFiles.forEach((file, index) => {
        simulateUpload(file, index);
      });
    }
  };

  const simulateUpload = (file, fileIndex) => {
    const uploadId = `${file.name}-${fileIndex}`;
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[uploadId];
            return updated;
          });
        }, 1000);
      }
      
      setUploadProgress(prev => ({
        ...prev,
        [uploadId]: progress
      }));
    }, 200);
  };

  const handleFileRemove = (fileIndex) => {
    let newValue;
    
    if (field.multiple) {
      const currentFiles = Array.isArray(internalValue) ? internalValue : [];
      newValue = currentFiles.filter((_, index) => index !== fileIndex);
    } else {
      newValue = null;
    }
    
    setInternalValue(newValue);
    onChange?.(newValue);
    
    // Clean up preview URL
    if (previewUrls[fileIndex]) {
      URL.revokeObjectURL(previewUrls[fileIndex]);
      setPreviewUrls(prev => {
        const updated = { ...prev };
        delete updated[fileIndex];
        return updated;
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleBlur = () => {
    onBlur?.(internalValue);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (file) => {
    if (!file || !file.type) return File;
    
    if (file.type.startsWith('image/')) return Image;
    // Add more file type icons as needed
    return File;
  };

  const getAcceptedFormats = () => {
    if (!field.accept) return 'All file types';
    
    const formats = field.accept.split(',').map(format => format.trim());
    return formats.join(', ');
  };

  const inputId = `field-${field.id || field.name}`;
  const hasError = error && error.length > 0;
  const isRequired = field.required;
  const files = internalValue ? (Array.isArray(internalValue) ? internalValue : [internalValue]) : [];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium ${
            hasError ? 'text-red-700' : 'text-gray-700'
          }`}
        >
          {field.label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
          {field.helpText && (
            <FieldTooltip content={field.helpText}>
              <span className="ml-1 text-gray-400 cursor-help">?</span>
            </FieldTooltip>
          )}
        </label>

        {/* File Limits */}
        {mode === 'renderer' && (field.maxFiles || field.maxSize) && (
          <span className="text-xs text-gray-500">
            {field.maxFiles && `Max ${field.maxFiles} file${field.maxFiles > 1 ? 's' : ''}`}
            {field.maxFiles && field.maxSize && ' • '}
            {field.maxSize && `Max ${formatBytes(field.maxSize)}`}
          </span>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        id={inputId}
        name={field.name}
        type="file"
        onChange={handleInputChange}
        onBlur={handleBlur}
        accept={field.accept}
        multiple={field.multiple}
        disabled={disabled}
        className="hidden"
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
      />

      {/* Drop Zone */}
      <div
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : hasError 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <Upload className={`mx-auto h-12 w-12 ${
          isDragOver ? 'text-blue-500' : hasError ? 'text-red-400' : 'text-gray-400'
        }`} />
        
        <div className="mt-4">
          <p className={`text-sm ${
            isDragOver ? 'text-blue-600' : hasError ? 'text-red-600' : 'text-gray-600'
          }`}>
            {isDragOver 
              ? 'Drop files here' 
              : field.multiple 
              ? 'Click to upload files or drag and drop'
              : 'Click to upload a file or drag and drop'
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getAcceptedFormats()}
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {field.multiple ? `Selected Files (${files.length})` : 'Selected File'}
          </h4>
          
          <div className="space-y-2">
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file);
              const uploadId = `${file.name}-${index}`;
              const progress = uploadProgress[uploadId];
              const isUploading = progress !== undefined && progress < 100;
              
              return (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-md border"
                >
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0 mr-3">
                    {previewUrls[index] ? (
                      <img
                        src={previewUrls[index]}
                        alt={file.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                        <FileIcon className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{formatBytes(file.size)}</span>
                      {file.type && (
                        <>
                          <span>•</span>
                          <span>{file.type}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Upload Progress */}
                    {isUploading && (
                      <div className="mt-1">
                        <div className="bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status/Actions */}
                  <div className="flex items-center space-x-2">
                    {isUploading ? (
                      <LoadingSpinner size="sm" />
                    ) : progress === 100 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : null}
                    
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleFileRemove(index)}
                        className="text-gray-400 hover:text-red-500 focus:outline-none"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <p id={`${inputId}-error`} className="text-sm text-red-600 flex items-center" role="alert">
          <AlertCircle className="h-4 w-4 mr-1" />
          {Array.isArray(error) ? error[0] : error}
        </p>
      )}

      {/* Help Text */}
      {!hasError && field.helpText && mode === 'renderer' && (
        <p className="text-sm text-gray-500">
          {field.helpText}
        </p>
      )}

      {/* Field Info for Builder Mode */}
      {mode === 'builder' && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>Field Name: {field.name}</div>
          <div>Type: File Upload</div>
          <div>Multiple: {field.multiple ? 'Yes' : 'No'}</div>
          {field.accept && <div>Accepted: {field.accept}</div>}
          {field.maxSize && <div>Max Size: {formatBytes(field.maxSize)}</div>}
          {field.maxFiles && <div>Max Files: {field.maxFiles}</div>}
        </div>
      )}
    </div>
  );
};

// Builder configuration component
export const FileUploadConfig = ({
  field,
  onUpdate,
  className = ''
}) => {
  const handleFieldUpdate = (updates) => {
    onUpdate({ ...field, ...updates });
  };

  const commonFileTypes = [
    { label: 'Images', value: 'image/*' },
    { label: 'Documents', value: '.pdf,.doc,.docx,.txt' },
    { label: 'Spreadsheets', value: '.xls,.xlsx,.csv' },
    { label: 'Archives', value: '.zip,.rar,.7z' },
    { label: 'Audio', value: 'audio/*' },
    { label: 'Video', value: 'video/*' }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Basic Properties */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label
        </label>
        <input
          type="text"
          value={field.label || ''}
          onChange={(e) => handleFieldUpdate({ label: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Enter field label"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Help Text
        </label>
        <input
          type="text"
          value={field.helpText || ''}
          onChange={(e) => handleFieldUpdate({ helpText: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Additional help text"
        />
      </div>

      {/* File Type Restrictions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Accepted File Types
        </label>
        <select
          value={field.accept || ''}
          onChange={(e) => handleFieldUpdate({ accept: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
        >
          <option value="">All file types</option>
          {commonFileTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label} ({type.value})
            </option>
          ))}
        </select>
        
        <input
          type="text"
          value={field.accept || ''}
          onChange={(e) => handleFieldUpdate({ accept: e.target.value })}
          className="block w-full px-2 py-1 text-sm border border-gray-300 rounded"
          placeholder="Or enter custom MIME types/extensions"
        />
      </div>

      {/* File Size and Count Limits */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max File Size (MB)
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={field.maxSize ? (field.maxSize / 1024 / 1024).toFixed(1) : ''}
            onChange={(e) => handleFieldUpdate({ 
              maxSize: e.target.value ? parseFloat(e.target.value) * 1024 * 1024 : undefined 
            })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="10"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Files
          </label>
          <input
            type="number"
            min="1"
            value={field.maxFiles || ''}
            onChange={(e) => handleFieldUpdate({ 
              maxFiles: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="5"
          />
        </div>
      </div>

      {/* Validation Rules */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Validation Rules</h4>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.required || false}
              onChange={(e) => handleFieldUpdate({ required: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Required</span>
          </label>
        </div>
      </div>

      {/* File Upload Features */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Upload Features</h4>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.multiple || false}
              onChange={(e) => handleFieldUpdate({ multiple: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Allow multiple files</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.showPreview !== false}
              onChange={(e) => handleFieldUpdate({ showPreview: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show file previews</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.dragAndDrop !== false}
              onChange={(e) => handleFieldUpdate({ dragAndDrop: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable drag and drop</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;