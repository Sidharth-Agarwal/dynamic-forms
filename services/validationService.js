import { 
  validateField, 
  validateForm, 
  validatePasswordStrength,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  sanitizeValue,
  createDebouncedValidator,
  createAsyncValidator
} from '../utils/validation.js';
import { VALIDATION_RULES, VALIDATION_PATTERNS } from '../config/validationConfig.js';

/**
 * Validation Service
 * Centralized validation logic with caching and performance optimizations
 */
class ValidationService {
  constructor() {
    this.cache = new Map();
    this.debouncedValidators = new Map();
    this.asyncValidators = new Map();
  }

  // ============================================================================
  // FIELD VALIDATION
  // ============================================================================

  /**
   * Validate single field with caching
   * @param {any} value - Field value
   * @param {object} field - Field configuration
   * @param {object} allValues - All form values
   * @param {object} options - Validation options
   * @returns {object} Validation result
   */
  validateField(value, field, allValues = {}, options = {}) {
    const { useCache = true, debounce = false } = options;
    
    // Create cache key
    const cacheKey = this._createCacheKey('field', value, field.id, allValues);
    
    // Check cache first
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Perform validation
    const result = validateField(value, field, allValues);
    
    // Cache result
    if (useCache) {
      this._setCacheWithTTL(cacheKey, result, 5000); // 5 second TTL
    }
    
    return result;
  }

  /**
   * Validate entire form
   * @param {object} formData - Form data
   * @param {array} fields - Field configurations
   * @param {object} options - Validation options
   * @returns {object} Form validation result
   */
  validateForm(formData, fields, options = {}) {
    const { useCache = true, enableCrossField = true } = options;
    
    const cacheKey = this._createCacheKey('form', formData, fields.map(f => f.id).join(','));
    
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = validateForm(formData, fields, { enableCrossFieldValidation: enableCrossField });
    
    if (useCache) {
      this._setCacheWithTTL(cacheKey, result, 3000); // 3 second TTL
    }
    
    return result;
  }

  /**
   * Get debounced validator for a field
   * @param {string} fieldId - Field ID
   * @param {number} delay - Debounce delay
   * @returns {function} Debounced validator
   */
  getDebouncedValidator(fieldId, delay = 300) {
    const key = `${fieldId}_${delay}`;
    
    if (!this.debouncedValidators.has(key)) {
      const validator = createDebouncedValidator(
        (value, field, allValues) => this.validateField(value, field, allValues, { useCache: false }),
        delay
      );
      this.debouncedValidators.set(key, validator);
    }
    
    return this.debouncedValidators.get(key);
  }

  /**
   * Get async validator for a field
   * @param {string} fieldId - Field ID
   * @param {function} asyncValidationFn - Async validation function
   * @param {number} timeout - Timeout in milliseconds
   * @returns {function} Async validator
   */
  getAsyncValidator(fieldId, asyncValidationFn, timeout = 5000) {
    if (!this.asyncValidators.has(fieldId)) {
      const validator = createAsyncValidator(asyncValidationFn, timeout);
      this.asyncValidators.set(fieldId, validator);
    }
    
    return this.asyncValidators.get(fieldId);
  }

  // ============================================================================
  // SPECIALIZED VALIDATORS
  // ============================================================================

  /**
   * Validate email with additional checks
   * @param {string} email - Email to validate
   * @param {object} options - Validation options
   * @returns {object} Validation result
   */
  validateEmail(email, options = {}) {
    const { 
      checkDomain = false, 
      checkMX = false, 
      allowTemporary = true,
      customDomains = [] 
    } = options;

    const result = {
      isValid: false,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Basic format validation
    if (!isValidEmail(email)) {
      result.errors.push('Invalid email format');
      return result;
    }

    const [localPart, domain] = email.split('@');

    // Check local part length
    if (localPart.length > 64) {
      result.errors.push('Email local part too long (max 64 characters)');
    }

    // Check domain length
    if (domain.length > 253) {
      result.errors.push('Email domain too long (max 253 characters)');
    }

    // Check for temporary email domains
    if (!allowTemporary && this._isTemporaryEmailDomain(domain)) {
      result.errors.push('Temporary email addresses are not allowed');
    }

    // Check custom domain restrictions
    if (customDomains.length > 0) {
      const isAllowedDomain = customDomains.some(allowedDomain => 
        domain.toLowerCase().endsWith(allowedDomain.toLowerCase())
      );
      
      if (!isAllowedDomain) {
        result.errors.push(`Email domain must be from: ${customDomains.join(', ')}`);
      }
    }

    // Warnings for common issues
    if (localPart.includes('..')) {
      result.warnings.push('Email contains consecutive dots');
    }

    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      result.warnings.push('Email local part should not start or end with a dot');
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Validate phone number with formatting
   * @param {string} phone - Phone number
   * @param {object} options - Validation options
   * @returns {object} Validation result
   */
  validatePhone(phone, options = {}) {
    const { 
      format = 'international', 
      country = null,
      allowExtensions = false 
    } = options;

    const result = {
      isValid: false,
      errors: [],
      warnings: [],
      formatted: null,
      country: null
    };

    if (!phone || typeof phone !== 'string') {
      result.errors.push('Phone number is required');
      return result;
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length < 7) {
      result.errors.push('Phone number too short');
      return result;
    }

    if (cleanPhone.length > 15) {
      result.errors.push('Phone number too long');
      return result;
    }

    // Basic validation
    if (!isValidPhone(phone, format)) {
      result.errors.push('Invalid phone number format');
      return result;
    }

    // Format phone number
    result.formatted = this._formatPhoneNumber(cleanPhone, format, country);
    result.isValid = true;

    return result;
  }

  /**
   * Validate URL with additional checks
   * @param {string} url - URL to validate
   * @param {object} options - Validation options
   * @returns {object} Validation result
   */
  validateUrl(url, options = {}) {
    const { 
      requireHttps = false,
      allowedDomains = [],
      blockedDomains = [],
      checkReachability = false 
    } = options;

    const result = {
      isValid: false,
      errors: [],
      warnings: [],
      protocol: null,
      domain: null
    };

    if (!isValidUrl(url)) {
      result.errors.push('Invalid URL format');
      return result;
    }

    try {
      const urlObj = new URL(url);
      result.protocol = urlObj.protocol;
      result.domain = urlObj.hostname;

      // Check protocol
      if (requireHttps && urlObj.protocol !== 'https:') {
        result.errors.push('HTTPS is required');
      }

      // Check allowed domains
      if (allowedDomains.length > 0) {
        const isAllowed = allowedDomains.some(domain => 
          urlObj.hostname.endsWith(domain)
        );
        
        if (!isAllowed) {
          result.errors.push(`Domain must be from: ${allowedDomains.join(', ')}`);
        }
      }

      // Check blocked domains
      if (blockedDomains.length > 0) {
        const isBlocked = blockedDomains.some(domain => 
          urlObj.hostname.endsWith(domain)
        );
        
        if (isBlocked) {
          result.errors.push('This domain is not allowed');
        }
      }

      result.isValid = result.errors.length === 0;

    } catch (error) {
      result.errors.push('Invalid URL format');
    }

    return result;
  }

  /**
   * Validate password with strength checking
   * @param {string} password - Password to validate
   * @param {object} requirements - Password requirements
   * @returns {object} Validation result with strength info
   */
  validatePassword(password, requirements = {}) {
    return validatePasswordStrength(password, requirements);
  }

  // ============================================================================
  // FORM-SPECIFIC VALIDATION
  // ============================================================================

  /**
   * Validate required fields
   * @param {object} formData - Form data
   * @param {array} fields - Field configurations
   * @returns {object} Validation result
   */
  validateRequiredFields(formData, fields) {
    const errors = [];
    const requiredFields = fields.filter(field => field.required);

    requiredFields.forEach(field => {
      const value = formData[field.id];
      
      if (this._isEmpty(value)) {
        errors.push({
          fieldId: field.id,
          fieldLabel: field.label,
          rule: 'required',
          message: `${field.label} is required`
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      missingFields: errors.map(error => error.fieldId)
    };
  }

  /**
   * Validate field dependencies
   * @param {object} formData - Form data
   * @param {array} fields - Field configurations
   * @returns {object} Validation result
   */
  validateFieldDependencies(formData, fields) {
    const errors = [];

    fields.forEach(field => {
      if (field.dependencies) {
        field.dependencies.forEach(dependency => {
          const dependentValue = formData[dependency.fieldId];
          const currentValue = formData[field.id];

          // Check if dependency condition is met
          const conditionMet = this._checkDependencyCondition(
            dependentValue, 
            dependency.condition, 
            dependency.value
          );

          // If condition is met and current field is required but empty
          if (conditionMet && dependency.required && this._isEmpty(currentValue)) {
            errors.push({
              fieldId: field.id,
              fieldLabel: field.label,
              rule: 'dependency',
              message: `${field.label} is required when ${dependency.fieldLabel} ${dependency.condition} ${dependency.value}`
            });
          }
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ============================================================================
  // SANITIZATION
  // ============================================================================

  /**
   * Sanitize form data
   * @param {object} formData - Form data to sanitize
   * @param {array} fields - Field configurations
   * @param {object} options - Sanitization options
   * @returns {object} Sanitized form data
   */
  sanitizeFormData(formData, fields, options = {}) {
    const sanitized = {};

    fields.forEach(field => {
      const value = formData[field.id];
      
      if (value !== undefined && value !== null) {
        sanitized[field.id] = this.sanitizeFieldValue(value, field, options);
      }
    });

    return sanitized;
  }

  /**
   * Sanitize individual field value
   * @param {any} value - Value to sanitize
   * @param {object} field - Field configuration
   * @param {object} options - Sanitization options
   * @returns {any} Sanitized value
   */
  sanitizeFieldValue(value, field, options = {}) {
    if (typeof value !== 'string') {
      return value;
    }

    const fieldOptions = {
      ...options,
      ...field.sanitization
    };

    return sanitizeValue(value, fieldOptions);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Clear validation cache
   * @param {string} pattern - Optional pattern to match keys
   */
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Create cache key
   * @param {string} type - Validation type
   * @param {any} value - Value being validated
   * @param {string} identifier - Field or form identifier
   * @param {object} context - Additional context
   * @returns {string} Cache key
   */
  _createCacheKey(type, value, identifier, context = {}) {
    const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const contextStr = typeof context === 'object' ? JSON.stringify(context) : String(context);
    return `${type}:${identifier}:${btoa(valueStr + contextStr)}`;
  }

  /**
   * Set cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Cache value
   * @param {number} ttl - Time to live in milliseconds
   */
  _setCacheWithTTL(key, value, ttl) {
    this.cache.set(key, value);
    
    // Set timeout to remove from cache
    setTimeout(() => {
      this.cache.delete(key);
    }, ttl);
  }

  /**
   * Check if value is empty
   * @param {any} value - Value to check
   * @returns {boolean} True if empty
   */
  _isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  /**
   * Check if email domain is temporary
   * @param {string} domain - Email domain
   * @returns {boolean} True if temporary
   */
  _isTemporaryEmailDomain(domain) {
    const temporaryDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'throwaway.email'
    ];
    
    return temporaryDomains.some(tempDomain => 
      domain.toLowerCase().includes(tempDomain)
    );
  }

  /**
   * Format phone number
   * @param {string} phone - Clean phone number
   * @param {string} format - Format type
   * @param {string} country - Country code
   * @returns {string} Formatted phone number
   */
  _formatPhoneNumber(phone, format, country) {
    // Simple formatting - in production, use a library like libphonenumber
    if (format === 'us' && phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    
    if (format === 'international') {
      return `+${phone}`;
    }
    
    return phone;
  }

  /**
   * Check dependency condition
   * @param {any} value - Dependent field value
   * @param {string} condition - Condition type
   * @param {any} expectedValue - Expected value
   * @returns {boolean} True if condition is met
   */
  _checkDependencyCondition(value, condition, expectedValue) {
    switch (condition) {
      case 'equals':
        return value === expectedValue;
      case 'not_equals':
        return value !== expectedValue;
      case 'contains':
        return String(value).includes(String(expectedValue));
      case 'greater_than':
        return Number(value) > Number(expectedValue);
      case 'less_than':
        return Number(value) < Number(expectedValue);
      case 'is_empty':
        return this._isEmpty(value);
      case 'is_not_empty':
        return !this._isEmpty(value);
      default:
        return false;
    }
  }
}

// Export singleton instance
export const validationService = new ValidationService();
export default validationService;