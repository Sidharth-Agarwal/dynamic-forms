// utils/constants.js
export const FIELD_TYPES = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  EMAIL: 'email',
  NUMBER: 'number',
  SELECT: 'select',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  FILE: 'file',
  DATE: 'date',
  URL: 'url',
  PHONE: 'phone',
  CUSTOM: 'custom'
};

export const VALIDATION_TYPES = {
  REQUIRED: 'required',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  MIN_VALUE: 'minValue',
  MAX_VALUE: 'maxValue',
  PATTERN: 'pattern',
  EMAIL: 'email',
  URL: 'url',
  PHONE: 'phone',
  CUSTOM: 'custom'
};

export const FORM_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

export const SUBMISSION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const UI_CONSTANTS = {
  MAX_FIELD_NAME_LENGTH: 50,
  MAX_FORM_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_OPTION_LENGTH: 100,
  DEFAULT_DEBOUNCE_MS: 300,
  TOAST_DURATION: 3000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/*', '.pdf', '.doc', '.docx', '.txt']
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  CUSTOM: 'custom'
};

export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  JSON: 'json',
  PDF: 'pdf'
};

// utils/fieldTypes.js
import { 
  Type, 
  FileText, 
  Mail, 
  Hash, 
  List, 
  Radio, 
  CheckSquare, 
  Upload, 
  Calendar, 
  Link, 
  Phone, 
  Settings 
} from 'lucide-react';

export const FIELD_TYPE_DEFINITIONS = {
  text: {
    type: 'text',
    label: 'Text Input',
    icon: Type,
    category: 'input',
    defaultProps: {
      label: 'Text Field',
      placeholder: 'Enter text...',
      required: false,
      maxLength: 255
    },
    validationOptions: ['required', 'minLength', 'maxLength', 'pattern'],
    configurable: ['label', 'placeholder', 'helpText', 'required', 'maxLength', 'minLength']
  },
  textarea: {
    type: 'textarea',
    label: 'Text Area',
    icon: FileText,
    category: 'input',
    defaultProps: {
      label: 'Text Area',
      placeholder: 'Enter detailed text...',
      required: false,
      rows: 4,
      maxLength: 1000
    },
    validationOptions: ['required', 'minLength', 'maxLength'],
    configurable: ['label', 'placeholder', 'helpText', 'required', 'rows', 'maxLength', 'minLength']
  },
  email: {
    type: 'email',
    label: 'Email',
    icon: Mail,
    category: 'input',
    defaultProps: {
      label: 'Email Address',
      placeholder: 'Enter email...',
      required: false
    },
    validationOptions: ['required', 'email'],
    configurable: ['label', 'placeholder', 'helpText', 'required']
  },
  number: {
    type: 'number',
    label: 'Number',
    icon: Hash,
    category: 'input',
    defaultProps: {
      label: 'Number',
      placeholder: 'Enter number...',
      required: false,
      step: 1
    },
    validationOptions: ['required', 'minValue', 'maxValue'],
    configurable: ['label', 'placeholder', 'helpText', 'required', 'step', 'min', 'max']
  },
  select: {
    type: 'select',
    label: 'Select Dropdown',
    icon: List,
    category: 'choice',
    defaultProps: {
      label: 'Select Option',
      placeholder: 'Choose an option...',
      required: false,
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' }
      ]
    },
    validationOptions: ['required'],
    configurable: ['label', 'placeholder', 'helpText', 'required', 'options', 'multiple']
  },
  radio: {
    type: 'radio',
    label: 'Radio Group',
    icon: Radio,
    category: 'choice',
    defaultProps: {
      label: 'Choose One',
      required: false,
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' }
      ]
    },
    validationOptions: ['required'],
    configurable: ['label', 'helpText', 'required', 'options']
  },
  checkbox: {
    type: 'checkbox',
    label: 'Checkbox Group',
    icon: CheckSquare,
    category: 'choice',
    defaultProps: {
      label: 'Select Multiple',
      required: false,
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' }
      ]
    },
    validationOptions: ['required'],
    configurable: ['label', 'helpText', 'required', 'options', 'minSelections', 'maxSelections']
  },
  file: {
    type: 'file',
    label: 'File Upload',
    icon: Upload,
    category: 'input',
    defaultProps: {
      label: 'Upload File',
      required: false,
      accept: 'image/*',
      multiple: false,
      maxSize: 10485760 // 10MB
    },
    validationOptions: ['required'],
    configurable: ['label', 'helpText', 'required', 'accept', 'multiple', 'maxSize']
  },
  date: {
    type: 'date',
    label: 'Date Picker',
    icon: Calendar,
    category: 'input',
    defaultProps: {
      label: 'Select Date',
      required: false
    },
    validationOptions: ['required', 'minDate', 'maxDate'],
    configurable: ['label', 'helpText', 'required', 'min', 'max']
  },
  url: {
    type: 'url',
    label: 'URL Input',
    icon: Link,
    category: 'input',
    defaultProps: {
      label: 'Website URL',
      placeholder: 'https://example.com',
      required: false
    },
    validationOptions: ['required', 'url'],
    configurable: ['label', 'placeholder', 'helpText', 'required']
  },
  phone: {
    type: 'phone',
    label: 'Phone Number',
    icon: Phone,
    category: 'input',
    defaultProps: {
      label: 'Phone Number',
      placeholder: '+1 (555) 123-4567',
      required: false
    },
    validationOptions: ['required', 'phone'],
    configurable: ['label', 'placeholder', 'helpText', 'required']
  },
  custom: {
    type: 'custom',
    label: 'Custom Field',
    icon: Settings,
    category: 'advanced',
    defaultProps: {
      label: 'Custom Field',
      required: false,
      customType: 'text'
    },
    validationOptions: ['required', 'custom'],
    configurable: ['label', 'helpText', 'required', 'customType', 'customValidation']
  }
};

export const getFieldTypesByCategory = () => {
  const categories = {};
  Object.values(FIELD_TYPE_DEFINITIONS).forEach(field => {
    if (!categories[field.category]) {
      categories[field.category] = [];
    }
    categories[field.category].push(field);
  });
  return categories;
};

export const getFieldTypeDefinition = (type) => {
  return FIELD_TYPE_DEFINITIONS[type] || null;
};

// utils/validators.js
export const validators = {
  required: (value, fieldConfig) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return `${fieldConfig.label} is required`;
    }
    return null;
  },

  minLength: (value, fieldConfig) => {
    const minLength = fieldConfig.validation?.minLength;
    if (minLength && value && value.length < minLength) {
      return `${fieldConfig.label} must be at least ${minLength} characters long`;
    }
    return null;
  },

  maxLength: (value, fieldConfig) => {
    const maxLength = fieldConfig.validation?.maxLength || fieldConfig.maxLength;
    if (maxLength && value && value.length > maxLength) {
      return `${fieldConfig.label} must be no more than ${maxLength} characters long`;
    }
    return null;
  },

  minValue: (value, fieldConfig) => {
    const minValue = fieldConfig.validation?.minValue || fieldConfig.min;
    if (minValue !== undefined && value !== undefined && Number(value) < Number(minValue)) {
      return `${fieldConfig.label} must be at least ${minValue}`;
    }
    return null;
  },

  maxValue: (value, fieldConfig) => {
    const maxValue = fieldConfig.validation?.maxValue || fieldConfig.max;
    if (maxValue !== undefined && value !== undefined && Number(value) > Number(maxValue)) {
      return `${fieldConfig.label} must be no more than ${maxValue}`;
    }
    return null;
  },

  email: (value, fieldConfig) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return `${fieldConfig.label} must be a valid email address`;
    }
    return null;
  },

  url: (value, fieldConfig) => {
    const urlRegex = /^https?:\/\/.+\..+/;
    if (value && !urlRegex.test(value)) {
      return `${fieldConfig.label} must be a valid URL`;
    }
    return null;
  },

  phone: (value, fieldConfig) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanValue = value?.replace(/[\s\-\(\)]/g, '');
    if (value && !phoneRegex.test(cleanValue)) {
      return `${fieldConfig.label} must be a valid phone number`;
    }
    return null;
  },

  pattern: (value, fieldConfig) => {
    const pattern = fieldConfig.validation?.pattern;
    if (pattern && value) {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        return fieldConfig.validation?.patternMessage || `${fieldConfig.label} format is invalid`;
      }
    }
    return null;
  },

  custom: (value, fieldConfig) => {
    const customValidator = fieldConfig.validation?.customValidator;
    if (customValidator && typeof customValidator === 'function') {
      return customValidator(value, fieldConfig);
    }
    return null;
  },

  minSelections: (value, fieldConfig) => {
    const minSelections = fieldConfig.validation?.minSelections;
    if (minSelections && Array.isArray(value) && value.length < minSelections) {
      return `Please select at least ${minSelections} option(s)`;
    }
    return null;
  },

  maxSelections: (value, fieldConfig) => {
    const maxSelections = fieldConfig.validation?.maxSelections;
    if (maxSelections && Array.isArray(value) && value.length > maxSelections) {
      return `Please select no more than ${maxSelections} option(s)`;
    }
    return null;
  },

  fileSize: (files, fieldConfig) => {
    const maxSize = fieldConfig.maxSize || 10485760; // 10MB default
    if (files) {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        if (file.size > maxSize) {
          return `File size must be less than ${Math.round(maxSize / 1048576)}MB`;
        }
      }
    }
    return null;
  },

  fileType: (files, fieldConfig) => {
    const acceptedTypes = fieldConfig.accept;
    if (acceptedTypes && files) {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        const isAccepted = acceptedTypes.split(',').some(type => {
          const trimmedType = type.trim();
          if (trimmedType.includes('*')) {
            const mainType = trimmedType.split('/')[0];
            return file.type.startsWith(mainType);
          }
          return file.type === trimmedType || file.name.toLowerCase().endsWith(trimmedType);
        });
        if (!isAccepted) {
          return `File type not allowed. Accepted types: ${acceptedTypes}`;
        }
      }
    }
    return null;
  }
};

export const validateField = (value, fieldConfig) => {
  const errors = [];
  const validationRules = fieldConfig.validation || {};

  // Always check required first
  if (fieldConfig.required) {
    const requiredError = validators.required(value, fieldConfig);
    if (requiredError) {
      errors.push(requiredError);
      return errors; // If required fails, don't check other validations
    }
  }

  // Skip other validations if value is empty and not required
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return errors;
  }

  // Run all applicable validations
  Object.keys(validationRules).forEach(rule => {
    if (validators[rule]) {
      const error = validators[rule](value, fieldConfig);
      if (error) {
        errors.push(error);
      }
    }
  });

  // Special file validations
  if (fieldConfig.type === 'file' && value) {
    const sizeError = validators.fileSize(value, fieldConfig);
    const typeError = validators.fileType(value, fieldConfig);
    if (sizeError) errors.push(sizeError);
    if (typeError) errors.push(typeError);
  }

  return errors;
};

export const validateForm = (formData, formConfig) => {
  const errors = {};
  let isValid = true;

  formConfig.fields.forEach(field => {
    const fieldValue = formData[field.name];
    const fieldErrors = validateField(fieldValue, field);
    
    if (fieldErrors.length > 0) {
      errors[field.name] = fieldErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// utils/helpers.js
export const generateId = () => {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateFormId = () => {
  return `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const sanitizeFieldName = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    default:
      return d.toLocaleDateString();
  }
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
};

// utils/formatters.js
export const formatFormData = (formData, formConfig) => {
  const formatted = {};
  
  formConfig.fields.forEach(field => {
    const value = formData[field.name];
    
    switch (field.type) {
      case 'number':
        formatted[field.name] = value ? Number(value) : null;
        break;
      case 'checkbox':
        formatted[field.name] = Array.isArray(value) ? value : [];
        break;
      case 'date':
        formatted[field.name] = value ? new Date(value).toISOString() : null;
        break;
      case 'file':
        // File handling would depend on storage implementation
        formatted[field.name] = value ? Array.from(value).map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        })) : [];
        break;
      default:
        formatted[field.name] = value || null;
    }
  });
  
  return formatted;
};

export const formatSubmissionForExport = (submission, formConfig) => {
  const formatted = {
    'Submission ID': submission.id,
    'Submitted At': formatDate(submission.submittedAt, 'MM/DD/YYYY'),
    'Form ID': submission.formId
  };
  
  formConfig.fields.forEach(field => {
    const value = submission.data[field.name];
    
    switch (field.type) {
      case 'checkbox':
        formatted[field.label] = Array.isArray(value) ? value.join(', ') : '';
        break;
      case 'select':
      case 'radio':
        const option = field.options?.find(opt => opt.value === value);
        formatted[field.label] = option ? option.label : value || '';
        break;
      case 'file':
        formatted[field.label] = Array.isArray(value) 
          ? value.map(f => f.name).join(', ') 
          : '';
        break;
      case 'date':
        formatted[field.label] = value ? formatDate(value, 'MM/DD/YYYY') : '';
        break;
      default:
        formatted[field.label] = value || '';
    }
  });
  
  return formatted;
};

export const formatFieldConfig = (fieldType, customProps = {}) => {
  const definition = FIELD_TYPE_DEFINITIONS[fieldType];
  if (!definition) return null;
  
  return {
    id: generateId(),
    name: sanitizeFieldName(customProps.label || definition.defaultProps.label),
    type: fieldType,
    ...definition.defaultProps,
    ...customProps,
    validation: {
      ...definition.defaultProps.validation,
      ...customProps.validation
    }
  };
};

// utils/dateUtils.js
export const dateUtils = {
  isValidDate: (date) => {
    return date instanceof Date && !isNaN(date);
  },
  
  parseDate: (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return dateUtils.isValidDate(date) ? date : null;
  },
  
  formatForInput: (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (!dateUtils.isValidDate(d)) return '';
    return d.toISOString().split('T')[0];
  },
  
  addDays: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
  
  isBefore: (date1, date2) => {
    return new Date(date1) < new Date(date2);
  },
  
  isAfter: (date1, date2) => {
    return new Date(date1) > new Date(date2);
  },
  
  isToday: (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return checkDate.toDateString() === today.toDateString();
  }
};

// utils/fileUtils.js
export const fileUtils = {
  isValidFileType: (file, acceptedTypes) => {
    if (!acceptedTypes) return true;
    
    const types = acceptedTypes.split(',').map(type => type.trim());
    
    return types.some(type => {
      if (type.includes('*')) {
        const mainType = type.split('/')[0];
        return file.type.startsWith(mainType);
      }
      return file.type === type || file.name.toLowerCase().endsWith(type);
    });
  },
  
  isValidFileSize: (file, maxSize) => {
    return !maxSize || file.size <= maxSize;
  },
  
  getFileExtension: (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },
  
  generateFileName: (originalName) => {
    const timestamp = Date.now();
    const extension = fileUtils.getFileExtension(originalName);
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    return `${baseName}_${timestamp}.${extension}`;
  },
  
  readFileAsDataURL: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
  
  readFileAsText: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
};

// utils/exportUtils.js
export const exportUtils = {
  downloadJSON: (data, filename = 'export.json') => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    exportUtils.downloadBlob(blob, filename);
  },
  
  downloadCSV: (data, filename = 'export.csv') => {
    if (!Array.isArray(data) || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    exportUtils.downloadBlob(blob, filename);
  },
  
  downloadBlob: (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// utils/apiUtils.js
export const apiUtils = {
  handleResponse: async (response) => {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  
  createHeaders: (contentType = 'application/json', authToken = null) => {
    const headers = {
      'Content-Type': contentType
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
  },
  
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  },
  
  retry: async (fn, maxAttempts = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
};

// utils/index.js - Main export file
export * from './constants.js';
export * from './fieldTypes.js';
export * from './validators.js';
export * from './helpers.js';
export * from './formatters.js';
export * from './dateUtils.js';
export * from './fileUtils.js';
export * from './exportUtils.js';
export * from './apiUtils.js';