/**
 * Validation Rules and Configuration
 * This file defines all validation rules, patterns, and error messages
 */

// Regular Expression Patterns
export const VALIDATION_PATTERNS = {
  // Email validation (RFC 5322 compliant)
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  // Phone number patterns
  phone: {
    us: /^(\+1\s?)?(\([0-9]{3}\)|[0-9]{3})[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}$/,
    international: /^[\+]?[1-9][\d]{0,15}$/,
    general: /^[\+]?[\d\s\-\(\)]{7,15}$/
  },
  
  // URL validation
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  
  // Text patterns
  alphaOnly: /^[a-zA-Z\s]+$/,
  alphaNumeric: /^[a-zA-Z0-9\s]+$/,
  numeric: /^[0-9]+$/,
  decimal: /^[0-9]+(\.[0-9]+)?$/,
  
  // Special formats
  creditCard: /^[0-9]{13,19}$/,
  zipCode: {
    us: /^[0-9]{5}(-[0-9]{4})?$/,
    canada: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    uk: /^[A-Za-z]{1,2}[0-9Rr][0-9A-Za-z]?\s?[0-9][ABD-HJLNP-UW-Zabd-hjlnp-uw-z]{2}$/
  },
  
  // Security patterns
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  noHtml: /^[^<>]*$/,
  noSql: /^(?!.*('|(--|\/\*|\*\/|;|union|select|insert|delete|update|drop|create|alter|exec|execute))).*$/i
};

// Validation Rule Definitions
export const VALIDATION_RULES = {
  required: {
    name: 'required',
    message: 'This field is required',
    validator: (value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      return value !== null && value !== undefined && value !== '';
    }
  },

  email: {
    name: 'email',
    message: 'Please enter a valid email address',
    validator: (value) => {
      if (!value) return true; // Allow empty if not required
      return VALIDATION_PATTERNS.email.test(value);
    }
  },

  phone: {
    name: 'phone',
    message: 'Please enter a valid phone number',
    validator: (value, options = {}) => {
      if (!value) return true;
      const pattern = options.format === 'us' 
        ? VALIDATION_PATTERNS.phone.us 
        : VALIDATION_PATTERNS.phone.international;
      return pattern.test(value);
    }
  },

  url: {
    name: 'url',
    message: 'Please enter a valid URL',
    validator: (value) => {
      if (!value) return true;
      return VALIDATION_PATTERNS.url.test(value);
    }
  },

  minLength: {
    name: 'minLength',
    message: 'Minimum length is {min} characters',
    validator: (value, options) => {
      if (!value) return true;
      return value.toString().length >= options.min;
    }
  },

  maxLength: {
    name: 'maxLength',
    message: 'Maximum length is {max} characters',
    validator: (value, options) => {
      if (!value) return true;
      return value.toString().length <= options.max;
    }
  },

  min: {
    name: 'min',
    message: 'Minimum value is {min}',
    validator: (value, options) => {
      if (!value && value !== 0) return true;
      return Number(value) >= options.min;
    }
  },

  max: {
    name: 'max',
    message: 'Maximum value is {max}',
    validator: (value, options) => {
      if (!value && value !== 0) return true;
      return Number(value) <= options.max;
    }
  },

  pattern: {
    name: 'pattern',
    message: 'Please enter a valid format',
    validator: (value, options) => {
      if (!value) return true;
      const regex = new RegExp(options.pattern);
      return regex.test(value);
    }
  },

  integer: {
    name: 'integer',
    message: 'Please enter a whole number',
    validator: (value) => {
      if (!value && value !== 0) return true;
      return Number.isInteger(Number(value));
    }
  },

  decimal: {
    name: 'decimal',
    message: 'Please enter a valid decimal number',
    validator: (value, options = {}) => {
      if (!value && value !== 0) return true;
      const decimalPlaces = options.decimalPlaces || 2;
      const regex = new RegExp(`^\\d+(\\.\\d{1,${decimalPlaces}})?$`);
      return regex.test(value.toString());
    }
  },

  fileSize: {
    name: 'fileSize',
    message: 'File size must be less than {maxSize}MB',
    validator: (file, options) => {
      if (!file) return true;
      const maxSizeBytes = options.maxSize * 1024 * 1024; // Convert MB to bytes
      return file.size <= maxSizeBytes;
    }
  },

  fileType: {
    name: 'fileType',
    message: 'Invalid file type. Allowed types: {allowedTypes}',
    validator: (file, options) => {
      if (!file) return true;
      const allowedTypes = options.allowedTypes || [];
      
      // Handle wildcard types like 'image/*'
      return allowedTypes.some(type => {
        if (type === '*') return true;
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return file.type.startsWith(category + '/');
        }
        return file.type === type || file.name.toLowerCase().endsWith(type.toLowerCase());
      });
    }
  },

  minSelect: {
    name: 'minSelect',
    message: 'Please select at least {min} options',
    validator: (value, options) => {
      if (!Array.isArray(value)) return true;
      return value.length >= options.min;
    }
  },

  maxSelect: {
    name: 'maxSelect',
    message: 'Please select no more than {max} options',
    validator: (value, options) => {
      if (!Array.isArray(value)) return true;
      return value.length <= options.max;
    }
  },

  minDate: {
    name: 'minDate',
    message: 'Date must be after {minDate}',
    validator: (value, options) => {
      if (!value) return true;
      const inputDate = new Date(value);
      const minDate = new Date(options.minDate);
      return inputDate >= minDate;
    }
  },

  maxDate: {
    name: 'maxDate',
    message: 'Date must be before {maxDate}',
    validator: (value, options) => {
      if (!value) return true;
      const inputDate = new Date(value);
      const maxDate = new Date(options.maxDate);
      return inputDate <= maxDate;
    }
  },

  strongPassword: {
    name: 'strongPassword',
    message: 'Password must contain at least 8 characters with uppercase, lowercase, number and special character',
    validator: (value) => {
      if (!value) return true;
      return VALIDATION_PATTERNS.strongPassword.test(value);
    }
  },

  noHtml: {
    name: 'noHtml',
    message: 'HTML tags are not allowed',
    validator: (value) => {
      if (!value) return true;
      return VALIDATION_PATTERNS.noHtml.test(value);
    }
  },

  unique: {
    name: 'unique',
    message: 'This value must be unique',
    validator: async (value, options) => {
      if (!value) return true;
      // This would need to be implemented with your data source
      // Return true for now, implement based on your needs
      return true;
    }
  }
};

// Field Type Specific Validation Configurations
export const FIELD_VALIDATION_CONFIG = {
  text: {
    availableRules: ['required', 'minLength', 'maxLength', 'pattern', 'noHtml'],
    defaultRules: {
      maxLength: { max: 255 },
      noHtml: true
    }
  },

  email: {
    availableRules: ['required', 'email'],
    defaultRules: {
      email: true
    }
  },

  number: {
    availableRules: ['required', 'min', 'max', 'integer', 'decimal'],
    defaultRules: {}
  },

  textarea: {
    availableRules: ['required', 'minLength', 'maxLength', 'noHtml'],
    defaultRules: {
      maxLength: { max: 5000 },
      noHtml: true
    }
  },

  select: {
    availableRules: ['required'],
    defaultRules: {}
  },

  radio: {
    availableRules: ['required'],
    defaultRules: {}
  },

  checkbox: {
    availableRules: ['required', 'minSelect', 'maxSelect'],
    defaultRules: {}
  },

  date: {
    availableRules: ['required', 'minDate', 'maxDate'],
    defaultRules: {}
  },

  file: {
    availableRules: ['required', 'fileSize', 'fileType'],
    defaultRules: {
      fileSize: { maxSize: 10 }, // 10MB
      fileType: { allowedTypes: ['image/*', 'application/pdf'] }
    }
  }
};

// Error Message Templates
export const ERROR_MESSAGES = {
  // Generic messages
  generic: {
    required: 'This field is required',
    invalid: 'Please enter a valid value',
    tooShort: 'Value is too short',
    tooLong: 'Value is too long',
    outOfRange: 'Value is out of range'
  },

  // Field-specific messages
  text: {
    required: 'Please enter some text',
    minLength: 'Please enter at least {min} characters',
    maxLength: 'Please enter no more than {max} characters',
    pattern: 'Please match the required format',
    noHtml: 'HTML tags are not allowed'
  },

  email: {
    required: 'Please enter your email address',
    invalid: 'Please enter a valid email address',
    format: 'Email format should be: user@example.com'
  },

  number: {
    required: 'Please enter a number',
    invalid: 'Please enter a valid number',
    min: 'Number must be at least {min}',
    max: 'Number must be no more than {max}',
    integer: 'Please enter a whole number',
    decimal: 'Please enter a valid decimal number'
  },

  phone: {
    required: 'Please enter your phone number',
    invalid: 'Please enter a valid phone number',
    format: 'Phone format should be: (123) 456-7890'
  },

  url: {
    required: 'Please enter a URL',
    invalid: 'Please enter a valid URL',
    format: 'URL format should be: https://example.com'
  },

  date: {
    required: 'Please select a date',
    invalid: 'Please enter a valid date',
    min: 'Date must be after {minDate}',
    max: 'Date must be before {maxDate}',
    range: 'Date must be between {minDate} and {maxDate}'
  },

  file: {
    required: 'Please select a file',
    size: 'File size must be less than {maxSize}MB',
    type: 'File type not allowed. Allowed types: {allowedTypes}',
    count: 'Please select between {min} and {max} files'
  },

  select: {
    required: 'Please select an option',
    invalid: 'Please select a valid option'
  },

  checkbox: {
    required: 'Please select at least one option',
    min: 'Please select at least {min} options',
    max: 'Please select no more than {max} options',
    range: 'Please select between {min} and {max} options'
  },

  radio: {
    required: 'Please select an option'
  }
};

// Validation Severity Levels
export const VALIDATION_SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success'
};

// Custom Validation Rule Builder
export const createCustomValidation = (name, validator, message, options = {}) => {
  return {
    name,
    message,
    validator,
    severity: options.severity || VALIDATION_SEVERITY.ERROR,
    async: options.async || false,
    dependencies: options.dependencies || []
  };
};

// Pre-built Custom Validations
export const CUSTOM_VALIDATIONS = {
  passwordConfirm: createCustomValidation(
    'passwordConfirm',
    (value, options, formData) => {
      const passwordField = options.passwordField || 'password';
      return value === formData[passwordField];
    },
    'Passwords do not match',
    { dependencies: ['password'] }
  ),

  ageVerification: createCustomValidation(
    'ageVerification',
    (value, options) => {
      if (!value) return true;
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= (options.minAge || 18);
    },
    'You must be at least {minAge} years old'
  ),

  businessEmail: createCustomValidation(
    'businessEmail',
    (value) => {
      if (!value) return true;
      const commonPersonalDomains = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
        'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'
      ];
      const domain = value.split('@')[1]?.toLowerCase();
      return !commonPersonalDomains.includes(domain);
    },
    'Please use a business email address'
  ),

  futureDate: createCustomValidation(
    'futureDate',
    (value) => {
      if (!value) return true;
      return new Date(value) > new Date();
    },
    'Date must be in the future'
  ),

  pastDate: createCustomValidation(
    'pastDate',
    (value) => {
      if (!value) return true;
      return new Date(value) < new Date();
    },
    'Date must be in the past'
  )
};

// Validation Configuration Presets
export const VALIDATION_PRESETS = {
  basic: {
    name: 'Basic',
    description: 'Basic validation for general forms',
    rules: ['required', 'minLength', 'maxLength']
  },

  strict: {
    name: 'Strict',
    description: 'Strict validation with security measures',
    rules: ['required', 'minLength', 'maxLength', 'pattern', 'noHtml']
  },

  minimal: {
    name: 'Minimal',
    description: 'Minimal validation for simple forms',
    rules: ['required']
  },

  comprehensive: {
    name: 'Comprehensive',
    description: 'Full validation suite',
    rules: ['required', 'minLength', 'maxLength', 'pattern', 'noHtml', 'strongPassword']
  }
};

export default {
  VALIDATION_PATTERNS,
  VALIDATION_RULES,
  FIELD_VALIDATION_CONFIG,
  ERROR_MESSAGES,
  VALIDATION_SEVERITY,
  createCustomValidation,
  CUSTOM_VALIDATIONS,
  VALIDATION_PRESETS
};