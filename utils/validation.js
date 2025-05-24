import { VALIDATION_RULES, VALIDATION_PATTERNS, ERROR_MESSAGES } from '../config/validationConfig.js';
import { FIELD_TYPES } from '../config/fieldConfig.js';

/**
 * Validation utility functions for form fields and data
 */

/**
 * Validate a single field value
 * @param {any} value - The value to validate
 * @param {object} field - Field configuration
 * @param {object} allValues - All form values (for cross-field validation)
 * @returns {object} Validation result
 */
export const validateField = (value, field, allValues = {}) => {
  const errors = [];
  const warnings = [];
  
  if (!field || !field.validation) {
    return { isValid: true, errors: [], warnings: [] };
  }

  const validationRules = field.validation;

  // Check each validation rule
  for (const [ruleName, ruleOptions] of Object.entries(validationRules)) {
    if (ruleOptions === false || ruleOptions === null || ruleOptions === undefined) {
      continue;
    }

    const rule = VALIDATION_RULES[ruleName];
    if (!rule) {
      console.warn(`Unknown validation rule: ${ruleName}`);
      continue;
    }

    try {
      const isValid = rule.validator(value, ruleOptions, allValues);
      
      if (!isValid) {
        const message = formatErrorMessage(rule.message, ruleOptions, field);
        errors.push({
          rule: ruleName,
          message,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error(`Error validating rule ${ruleName}:`, error);
      errors.push({
        rule: ruleName,
        message: 'Validation error occurred',
        severity: 'error'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    value
  };
};

/**
 * Validate an entire form
 * @param {object} formData - Form values
 * @param {array} fields - Field configurations
 * @param {object} options - Validation options
 * @returns {object} Form validation result
 */
export const validateForm = (formData, fields, options = {}) => {
  const results = {};
  const errors = [];
  const warnings = [];
  let isValid = true;

  for (const field of fields) {
    const value = formData[field.id];
    const fieldResult = validateField(value, field, formData);
    
    results[field.id] = fieldResult;
    
    if (!fieldResult.isValid) {
      isValid = false;
      errors.push(...fieldResult.errors.map(error => ({
        ...error,
        fieldId: field.id,
        fieldLabel: field.label
      })));
    }
    
    warnings.push(...fieldResult.warnings.map(warning => ({
      ...warning,
      fieldId: field.id,
      fieldLabel: field.label
    })));
  }

  // Cross-field validation
  if (options.enableCrossFieldValidation) {
    const crossFieldResult = validateCrossFields(formData, fields);
    if (!crossFieldResult.isValid) {
      isValid = false;
      errors.push(...crossFieldResult.errors);
    }
  }

  return {
    isValid,
    errors,
    warnings,
    fieldResults: results,
    summary: {
      totalFields: fields.length,
      validFields: Object.values(results).filter(r => r.isValid).length,
      invalidFields: Object.values(results).filter(r => !r.isValid).length,
      totalErrors: errors.length,
      totalWarnings: warnings.length
    }
  };
};

/**
 * Validate cross-field dependencies
 * @param {object} formData - Form values
 * @param {array} fields - Field configurations
 * @returns {object} Cross-field validation result
 */
export const validateCrossFields = (formData, fields) => {
  const errors = [];

  // Password confirmation validation
  const passwordField = fields.find(f => f.type === 'password');
  const confirmField = fields.find(f => f.id === 'password_confirm' || f.validation?.confirmPassword);
  
  if (passwordField && confirmField) {
    const password = formData[passwordField.id];
    const confirm = formData[confirmField.id];
    
    if (password && confirm && password !== confirm) {
      errors.push({
        rule: 'passwordConfirm',
        message: 'Passwords do not match',
        fieldId: confirmField.id,
        severity: 'error'
      });
    }
  }

  // Date range validation
  const dateFields = fields.filter(f => f.type === 'date');
  for (let i = 0; i < dateFields.length; i++) {
    for (let j = i + 1; j < dateFields.length; j++) {
      const field1 = dateFields[i];
      const field2 = dateFields[j];
      
      if (field1.validation?.beforeField === field2.id) {
        const date1 = new Date(formData[field1.id]);
        const date2 = new Date(formData[field2.id]);
        
        if (date1 >= date2) {
          errors.push({
            rule: 'dateRange',
            message: `${field1.label} must be before ${field2.label}`,
            fieldId: field1.id,
            severity: 'error'
          });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format error message with dynamic values
 * @param {string} template - Message template
 * @param {object} options - Rule options
 * @param {object} field - Field configuration
 * @returns {string} Formatted message
 */
export const formatErrorMessage = (template, options, field) => {
  let message = template;

  // Replace common placeholders
  const replacements = {
    '{label}': field?.label || 'Field',
    '{min}': options?.min,
    '{max}': options?.max,
    '{minLength}': options?.minLength,
    '{maxLength}': options?.maxLength,
    '{minDate}': options?.minDate,
    '{maxDate}': options?.maxDate,
    '{maxSize}': options?.maxSize,
    '{allowedTypes}': Array.isArray(options?.allowedTypes) 
      ? options.allowedTypes.join(', ') 
      : options?.allowedTypes,
    '{minSelect}': options?.minSelect,
    '{maxSelect}': options?.maxSelect,
    '{minAge}': options?.minAge
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    if (value !== undefined && value !== null) {
      message = message.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }
  }

  return message;
};

/**
 * Get validation rules for a field type
 * @param {string} fieldType - Field type
 * @returns {object} Available validation rules
 */
export const getValidationRulesForFieldType = (fieldType) => {
  const fieldConfig = FIELD_TYPES[fieldType];
  if (!fieldConfig) return {};

  const availableRules = {};
  
  for (const ruleName of fieldConfig.validationRules.supportedValidations) {
    if (VALIDATION_RULES[ruleName]) {
      availableRules[ruleName] = VALIDATION_RULES[ruleName];
    }
  }

  return availableRules;
};

/**
 * Check if a value is empty
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Sanitize input value
 * @param {any} value - Value to sanitize
 * @param {object} options - Sanitization options
 * @returns {any} Sanitized value
 */
export const sanitizeValue = (value, options = {}) => {
  if (typeof value !== 'string') return value;

  let sanitized = value;

  // Remove HTML tags
  if (options.removeHtml !== false) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Remove script tags (extra security)
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Trim whitespace
  if (options.trim !== false) {
    sanitized = sanitized.trim();
  }

  // Normalize whitespace
  if (options.normalizeWhitespace) {
    sanitized = sanitized.replace(/\s+/g, ' ');
  }

  // Remove special characters
  if (options.removeSpecialChars) {
    sanitized = sanitized.replace(/[^\w\s-_.]/g, '');
  }

  // Convert to lowercase
  if (options.toLowerCase) {
    sanitized = sanitized.toLowerCase();
  }

  // Convert to uppercase
  if (options.toUpperCase) {
    sanitized = sanitized.toUpperCase();
  }

  return sanitized;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION_PATTERNS.email.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @param {string} format - Format type (us, international, general)
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone, format = 'general') => {
  if (!phone || typeof phone !== 'string') return false;
  const pattern = VALIDATION_PATTERNS.phone[format] || VALIDATION_PATTERNS.phone.general;
  return pattern.test(phone);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return VALIDATION_PATTERNS.url.test(url);
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeBytes - Maximum size in bytes
 * @returns {boolean} True if valid
 */
export const isValidFileSize = (file, maxSizeBytes) => {
  if (!file || !file.size) return false;
  return file.size <= maxSizeBytes;
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {array} allowedTypes - Allowed MIME types or extensions
 * @returns {boolean} True if valid
 */
export const isValidFileType = (file, allowedTypes = []) => {
  if (!file || !allowedTypes.length) return false;

  return allowedTypes.some(type => {
    // Check for wildcard types like 'image/*'
    if (type.endsWith('/*')) {
      const category = type.split('/')[0];
      return file.type.startsWith(category + '/');
    }
    
    // Check for exact MIME type match
    if (file.type === type) {
      return true;
    }
    
    // Check for file extension match
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    
    return false;
  });
};

/**
 * Validate date range
 * @param {Date|string} date - Date to validate
 * @param {Date|string} minDate - Minimum date
 * @param {Date|string} maxDate - Maximum date
 * @returns {boolean} True if valid
 */
export const isValidDateRange = (date, minDate, maxDate) => {
  const dateObj = new Date(date);
  const minDateObj = minDate ? new Date(minDate) : null;
  const maxDateObj = maxDate ? new Date(maxDate) : null;

  if (isNaN(dateObj.getTime())) return false;
  
  if (minDateObj && dateObj < minDateObj) return false;
  if (maxDateObj && dateObj > maxDateObj) return false;
  
  return true;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {object} requirements - Strength requirements
 * @returns {object} Validation result with strength info
 */
export const validatePasswordStrength = (password, requirements = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
    forbidCommonPasswords = true
  } = requirements;

  const result = {
    isValid: false,
    strength: 0,
    issues: [],
    suggestions: []
  };

  if (!password) {
    result.issues.push('Password is required');
    return result;
  }

  // Check length
  if (password.length < minLength) {
    result.issues.push(`Password must be at least ${minLength} characters long`);
  } else {
    result.strength += 1;
  }

  // Check for uppercase letters
  if (requireUppercase && !/[A-Z]/.test(password)) {
    result.issues.push('Password must contain at least one uppercase letter');
  } else if (requireUppercase) {
    result.strength += 1;
  }

  // Check for lowercase letters
  if (requireLowercase && !/[a-z]/.test(password)) {
    result.issues.push('Password must contain at least one lowercase letter');
  } else if (requireLowercase) {
    result.strength += 1;
  }

  // Check for numbers
  if (requireNumbers && !/\d/.test(password)) {
    result.issues.push('Password must contain at least one number');
  } else if (requireNumbers) {
    result.strength += 1;
  }

  // Check for special characters
  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    result.issues.push('Password must contain at least one special character');
  } else if (requireSpecialChars) {
    result.strength += 1;
  }

  // Check for common passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (forbidCommonPasswords && commonPasswords.includes(password.toLowerCase())) {
    result.issues.push('Password is too common');
  }

  // Add suggestions
  if (result.issues.length > 0) {
    result.suggestions.push('Use a mix of uppercase and lowercase letters');
    result.suggestions.push('Include numbers and special characters');
    result.suggestions.push('Avoid common passwords and personal information');
  }

  result.isValid = result.issues.length === 0;
  
  return result;
};

/**
 * Debounced validation function
 * @param {function} validationFn - Validation function
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {function} Debounced validation function
 */
export const createDebouncedValidator = (validationFn, delay = 300) => {
  let timeoutId = null;
  
  return (...args) => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const result = validationFn(...args);
        resolve(result);
      }, delay);
    });
  };
};

/**
 * Async validation wrapper
 * @param {function} asyncValidator - Async validation function
 * @param {number} timeout - Timeout in milliseconds
 * @returns {function} Wrapped async validator
 */
export const createAsyncValidator = (asyncValidator, timeout = 5000) => {
  return async (...args) => {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Validation timeout')), timeout);
      });
      
      const validationPromise = asyncValidator(...args);
      
      return await Promise.race([validationPromise, timeoutPromise]);
    } catch (error) {
      console.error('Async validation error:', error);
      return {
        isValid: false,
        errors: [{
          rule: 'async',
          message: 'Validation failed due to network error',
          severity: 'error'
        }]
      };
    }
  };
};

/**
 * Create validation summary
 * @param {object} validationResult - Validation result
 * @returns {object} Summary object
 */
export const createValidationSummary = (validationResult) => {
  const summary = {
    isValid: validationResult.isValid,
    totalErrors: validationResult.errors?.length || 0,
    totalWarnings: validationResult.warnings?.length || 0,
    errorsByField: {},
    errorsByRule: {},
    criticalErrors: [],
    suggestions: []
  };

  // Group errors by field
  validationResult.errors?.forEach(error => {
    const fieldId = error.fieldId || 'general';
    if (!summary.errorsByField[fieldId]) {
      summary.errorsByField[fieldId] = [];
    }
    summary.errorsByField[fieldId].push(error);

    // Group errors by rule
    if (!summary.errorsByRule[error.rule]) {
      summary.errorsByRule[error.rule] = [];
    }
    summary.errorsByRule[error.rule].push(error);

    // Identify critical errors
    if (error.severity === 'error' && ['required', 'email', 'fileSize'].includes(error.rule)) {
      summary.criticalErrors.push(error);
    }
  });

  return summary;
};

export default {
  validateField,
  validateForm,
  validateCrossFields,
  formatErrorMessage,
  getValidationRulesForFieldType,
  isEmpty,
  sanitizeValue,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidFileSize,
  isValidFileType,
  isValidDateRange,
  validatePasswordStrength,
  createDebouncedValidator,
  createAsyncValidator,
  createValidationSummary
};