/**
 * Main utilities entry point for Form Builder Module
 * Exports all utility functions and constants
 */

// Import all utility modules
import * as fieldTypes from './fieldTypes.js';
import * as validation from './validation.js';
import * as formatting from './formatting.js';
import * as helpers from './helpers.js';
import * as dateUtils from './dateUtils.js';
import * as fileUtils from './fileUtils.js';
import { 
  COLLECTIONS, 
  UI_CONSTANTS, 
  FORM_SETTINGS, 
  VALIDATION as VALIDATION_CONSTANTS, 
  FILE_UPLOAD, 
  EXPORT, 
  ANALYTICS, 
  THEME, 
  ERRORS, 
  STORAGE_KEYS, 
  API_ENDPOINTS, 
  FEATURES, 
  PERFORMANCE 
} from './constants.js';

// Re-export individual utility modules
export { 
  fieldTypes, 
  validation, 
  formatting, 
  helpers, 
  dateUtils, 
  fileUtils 
};

// Re-export constants
export {
  COLLECTIONS,
  UI_CONSTANTS,
  FORM_SETTINGS,
  VALIDATION_CONSTANTS,
  FILE_UPLOAD,
  EXPORT,
  ANALYTICS,
  THEME,
  ERRORS,
  STORAGE_KEYS,
  API_ENDPOINTS,
  FEATURES,
  PERFORMANCE
};

// Re-export commonly used functions for convenience

// Field Type utilities
export {
  getAllFieldTypes,
  getFieldTypeConfig,
  isValidFieldType,
  createFieldInstance,
  validateFieldConfig,
  getFieldRenderProps
} from './fieldTypes.js';

// Validation utilities
export {
  validateField,
  validateForm,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  sanitizeValue,
  isEmpty as isEmptyValue
} from './validation.js';

// Formatting utilities
export {
  formatFieldValue,
  formatDate,
  formatFileSize,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDuration,
  truncateText,
  capitalizeWords
} from './formatting.js';

// Helper utilities
export {
  generateId,
  generateFieldId,
  generateFormId,
  deepClone,
  deepMerge,
  debounce,
  throttle,
  isEmpty,
  isNotEmpty,
  getNestedProperty,
  setNestedProperty,
  groupBy,
  sortBy,
  filterBy,
  paginate,
  retry,
  delay
} from './helpers.js';

// Date utilities
export {
  formatDate as formatDateUtil,
  parseDate,
  getRelativeTime,
  isValidDate,
  isToday,
  addTime,
  subtractTime,
  getDifference as getDateDifference
} from './dateUtils.js';

// File utilities
export {
  validateFile,
  getFileInfo,
  isImageFile,
  readFileAsDataURL,
  createFilePreview,
  batchValidateFiles,
  getFileIcon
} from './fileUtils.js';

// Specialized utility collections

/**
 * Form-specific utilities
 */
export const formUtils = {
  // Form creation and management
  createForm: (title, description = '') => ({
    id: helpers.generateFormId(),
    title,
    description,
    fields: [],
    settings: {
      allowMultipleSubmissions: true,
      requireAuth: false,
      successMessage: FORM_SETTINGS.DEFAULT_SUCCESS_MESSAGE,
      isActive: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),

  // Field management
  addField: (form, fieldType, fieldData = {}) => {
    const field = fieldTypes.createFieldInstance(fieldType, {
      order: form.fields.length,
      ...fieldData
    });
    
    return {
      ...form,
      fields: [...form.fields, field],
      updatedAt: new Date().toISOString()
    };
  },

  updateField: (form, fieldId, updates) => {
    return {
      ...form,
      fields: form.fields.map(field => 
        field.id === fieldId 
          ? { ...field, ...updates, updatedAt: new Date().toISOString() }
          : field
      ),
      updatedAt: new Date().toISOString()
    };
  },

  removeField: (form, fieldId) => {
    return {
      ...form,
      fields: form.fields.filter(field => field.id !== fieldId),
      updatedAt: new Date().toISOString()
    };
  },

  reorderFields: (form, fromIndex, toIndex) => {
    const reorderedFields = fieldTypes.reorderFields(form.fields, fromIndex, toIndex);
    
    return {
      ...form,
      fields: reorderedFields,
      updatedAt: new Date().toISOString()
    };
  },

  // Form validation
  validateFormConfig: (form) => {
    const errors = [];
    const warnings = [];

    if (!form.title || form.title.trim() === '') {
      errors.push('Form title is required');
    }

    if (!form.fields || form.fields.length === 0) {
      errors.push('Form must have at least one field');
    }

    // Validate each field
    form.fields?.forEach((field, index) => {
      const fieldValidation = fieldTypes.validateFieldConfig(field);
      
      fieldValidation.errors.forEach(error => {
        errors.push(`Field ${index + 1} (${field.label || 'Unnamed'}): ${error}`);
      });

      fieldValidation.warnings.forEach(warning => {
        warnings.push(`Field ${index + 1} (${field.label || 'Unnamed'}): ${warning}`);
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  // Form data processing
  processSubmission: (formData, fields) => {
    const processed = {
      id: helpers.generateId('submission'),
      formId: null, // Will be set when saving
      data: {},
      metadata: {
        submittedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        completedFields: 0,
        totalFields: fields.length
      }
    };

    // Process each field
    fields.forEach(field => {
      const rawValue = formData[field.id];
      const sanitizedValue = validation.sanitizeValue(rawValue);
      
      processed.data[field.id] = sanitizedValue;
      
      if (!helpers.isEmpty(sanitizedValue)) {
        processed.metadata.completedFields++;
      }
    });

    // Calculate completion percentage
    processed.metadata.completionPercentage = 
      (processed.metadata.completedFields / processed.metadata.totalFields) * 100;

    return processed;
  }
};

/**
 * UI-specific utilities
 */
export const uiUtils = {
  // Class name generation
  generateClasses: (...classes) => {
    return classes.filter(Boolean).join(' ');
  },

  // Field styling
  getFieldClasses: (field, hasError = false, hasValue = false) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2';
    const stateClasses = hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200';
    const valueClasses = hasValue ? 'bg-white' : 'bg-gray-50';

    return `${baseClasses} ${stateClasses} ${valueClasses}`;
  },

  // Button styling
  getButtonClasses: (variant = 'primary', size = 'md', disabled = false) => {
    const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-200',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-200',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-200'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses}`.trim();
  },

  // Responsive breakpoints
  getBreakpoint: () => {
    const width = window.innerWidth;
    if (width < 640) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    if (width < 1536) return 'xl';
    return '2xl';
  },

  // Animation helpers
  createTransition: (property = 'all', duration = '300ms', easing = 'ease') => {
    return `transition-${property} duration-${duration} ${easing}`;
  }
};

/**
 * Data processing utilities
 */
export const dataUtils = {
  // Export data preparation
  prepareForExport: (submissions, fields, format = 'csv') => {
    return formatting.formatForExport(submissions, fields, {
      includeMetadata: true,
      flattenArrays: format === 'csv',
      dateFormat: 'YYYY-MM-DD HH:mm:ss'
    });
  },

  // Statistics calculation
  calculateFormStats: (submissions, fields) => {
    if (!submissions.length) {
      return {
        totalSubmissions: 0,
        completionRate: 0,
        fieldStats: {}
      };
    }

    const stats = {
      totalSubmissions: submissions.length,
      fieldStats: {}
    };

    // Calculate field completion rates
    fields.forEach(field => {
      const completedCount = submissions.filter(sub => 
        !helpers.isEmpty(sub.data[field.id])
      ).length;

      stats.fieldStats[field.id] = {
        label: field.label,
        type: field.type,
        completedCount,
        completionRate: (completedCount / submissions.length) * 100
      };
    });

    // Calculate overall completion rate
    const totalFieldResponses = Object.values(stats.fieldStats)
      .reduce((sum, fieldStat) => sum + fieldStat.completedCount, 0);
    
    stats.completionRate = (totalFieldResponses / (submissions.length * fields.length)) * 100;

    return stats;
  },

  // Data transformation
  transformSubmissions: (submissions, transformType = 'table') => {
    switch (transformType) {
      case 'chart':
        return helpers.groupBy(submissions, sub => 
          dateUtils.formatDate(sub.submittedAt, 'YYYY-MM-DD')
        );
      
      case 'list':
        return submissions.map(sub => ({
          id: sub.id,
          date: dateUtils.formatDate(sub.submittedAt, 'MM/DD/YYYY'),
          time: dateUtils.formatDate(sub.submittedAt, 'HH:mm'),
          user: sub.userEmail || 'Anonymous'
        }));
      
      default:
        return submissions;
    }
  }
};

/**
 * Performance utilities
 */
export const performanceUtils = {
  // Memoization
  memoize: (fn, getKey = (...args) => JSON.stringify(args)) => {
    const cache = new Map();
    
    return (...args) => {
      const key = getKey(...args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = fn(...args);
      cache.set(key, result);
      
      // Limit cache size to prevent memory leaks
      if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      
      return result;
    };
  },

  // Debounced functions
  createDebouncedValidator: (validationFn, delay = 300) => {
    return helpers.debounce(validationFn, delay);
  },

  // Lazy loading
  createLazyLoader: (loadFn, delay = 100) => {
    let loaded = false;
    let loading = false;
    let data = null;

    return {
      async load() {
        if (loaded) return data;
        if (loading) return null;

        loading = true;
        await helpers.delay(delay);

        try {
          data = await loadFn();
          loaded = true;
          loading = false;
          return data;
        } catch (error) {
          loading = false;
          throw error;
        }
      },

      isLoaded: () => loaded,
      isLoading: () => loading,
      getData: () => data,
      reset: () => {
        loaded = false;
        loading = false;
        data = null;
      }
    };
  }
};

// Main utils object that combines everything
export const utils = {
  fieldTypes,
  validation,
  formatting,
  helpers,
  dateUtils,
  fileUtils,
  formUtils,
  uiUtils,
  dataUtils,
  performanceUtils,
  
  // Constants
  constants: {
    COLLECTIONS,
    UI_CONSTANTS,
    FORM_SETTINGS,
    VALIDATION_CONSTANTS,
    FILE_UPLOAD,
    EXPORT,
    ANALYTICS,
    THEME,
    ERRORS,
    STORAGE_KEYS,
    API_ENDPOINTS,
    FEATURES,
    PERFORMANCE
  }
};

// Export default utils object
export default utils;