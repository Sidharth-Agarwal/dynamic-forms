/**
 * EmailField Component
 * Email input field with built-in email validation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../../hooks/index.js';
import { validateField, uiUtils, FIELD_TYPES } from '../../utils/index.js';
import { validationService } from '../../services/index.js';
import { FIELD_TYPE_COLORS, VALIDATION_PATTERNS } from '../../config/index.js';

const EmailField = ({
  field,
  value = '',
  onChange,
  onBlur,
  onFocus,
  error = null,
  disabled = false,
  readOnly = false,
  className = '',
  style = {},
  showError = true,
  validationMode = 'onBlur',
  debounceMs = 300,
  showValidIcon = true,
  theme = 'default'
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Debounced validation
  const debouncedValue = useDebounce(internalValue, debounceMs);

  // Get field configuration
  const fieldConfig = FIELD_TYPES.email;
  const fieldColors = FIELD_TYPE_COLORS.email;

  // Sync with external value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Handle debounced validation
  useEffect(() => {
    if (validationMode === 'onChange' && isDirty && debouncedValue !== value) {
      handleValidation(debouncedValue);
      onChange?.(debouncedValue, field.id);
    }
  }, [debouncedValue, isDirty, validationMode, field.id, onChange, value]);

  // Email validation with enhanced rules
  const validateEmail = useCallback((emailValue) => {
    if (!emailValue) {
      return field.required ? 'Email is required' : null;
    }

    // Basic email format validation using config pattern
    if (!VALIDATION_PATTERNS.email.test(emailValue)) {
      return 'Please enter a valid email address';
    }

    // Additional validations if specified
    const validation = field.validation || {};
    
    // Domain validation
    if (validation.allowedDomains && validation.allowedDomains.length > 0) {
      const domain = emailValue.split('@')[1]?.toLowerCase();
      if (!validation.allowedDomains.some(allowed => 
        domain === allowed.toLowerCase() || domain?.endsWith(`.${allowed.toLowerCase()}`)
      )) {
        return `Email must be from allowed domains: ${validation.allowedDomains.join(', ')}`;
      }
    }

    // Blocked domains
    if (validation.blockedDomains && validation.blockedDomains.length > 0) {
      const domain = emailValue.split('@')[1]?.toLowerCase();
      if (validation.blockedDomains.some(blocked => 
        domain === blocked.toLowerCase() || domain?.endsWith(`.${blocked.toLowerCase()}`)
      )) {
        return 'This email domain is not allowed';
      }
    }

    // Business email validation
    if (validation.businessEmailOnly) {
      const commonPersonalDomains = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
        'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'
      ];
      const domain = emailValue.split('@')[1]?.toLowerCase();
      if (commonPersonalDomains.includes(domain)) {
        return 'Please use a business email address';
      }
    }

    return null;
  }, [field]);

  // Main validation handler
  const handleValidation = useCallback(async (valueToValidate) => {
    setIsValidating(true);
    
    try {
      // Email-specific validation
      const emailError = validateEmail(valueToValidate);
      if (emailError) {
        setLocalError(emailError);
        return emailError;
      }

      // General field validation using validation service
      if (field.validation && Object.keys(field.validation).length > 0) {
        const validationResult = await validationService.validateField(valueToValidate, {
          ...field,
          validation: { ...field.validation, email: true }
        });
        
        const errorMessage = validationResult.isValid ? null : validationResult.errors[0];
        setLocalError(errorMessage);
        return errorMessage;
      }

      setLocalError(null);
      return null;
    } catch (error) {
      console.error('Email validation error:', error);
      setLocalError('Validation failed');
      return 'Validation failed';
    } finally {
      setIsValidating(false);
    }
  }, [field, validateEmail]);

  // Input change handler
  const handleChange = useCallback((e) => {
    const newValue = e.target.value.trim();
    setInternalValue(newValue);
    setIsDirty(true);

    if (validationMode === 'onChange') {
      // Validation handled by debounced effect
    } else {
      if (localError || error) {
        setLocalError(null);
      }
      onChange?.(newValue, field.id);
    }
  }, [onChange, field.id, validationMode, localError, error]);

  // Blur handler
  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    
    if (validationMode === 'onBlur' || validationMode === 'onChange') {
      handleValidation(internalValue);
    }

    onBlur?.(e, field.id, internalValue);
  }, [onBlur, field.id, internalValue, validationMode, handleValidation]);

  // Focus handler
  const handleFocus = useCallback((e) => {
    setIsFocused(true);
    onFocus?.(e, field.id);
  }, [onFocus, field.id]);

  // Determine which error to show
  const displayError = error || localError;
  const hasError = Boolean(displayError);
  const hasValue = Boolean(internalValue);
  const isValidEmail = hasValue && !hasError && VALIDATION_PATTERNS.email.test(internalValue);

  // Generate CSS classes
  const inputClasses = uiUtils.generateClasses(
    // Base classes
    'w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2',
    // State classes
    hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
      : isValidEmail
        ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
    // Background
    hasValue ? 'bg-white' : 'bg-gray-50',
    // Focus
    isFocused && 'ring-2',
    // States
    disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
    readOnly && 'bg-gray-100 cursor-default',
    isValidating && 'opacity-75',
    className
  );

  // Field configuration
  const {
    label = 'Email Address',
    placeholder = 'your.email@example.com',
    required = false,
    helpText = ''
  } = field;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          htmlFor={field.id}
          className={uiUtils.generateClasses(
            'block text-sm font-medium mb-1 transition-colors',
            hasError ? 'text-red-700' : 'text-gray-700',
            required && "after:content-['*'] after:text-red-500 after:ml-1"
          )}
        >
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Email Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
        </div>

        {/* Input Field */}
        <input
          id={field.id}
          name={field.id}
          type="email"
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete="email"
          className={uiUtils.generateClasses(inputClasses, 'pl-10')}
          style={style}
          aria-invalid={hasError}
          aria-describedby={
            uiUtils.generateClasses(
              hasError && `${field.id}-error`,
              helpText && `${field.id}-help`
            ).trim() || undefined
          }
        />

        {/* Status Indicators */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isValidating && (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          )}
          
          {!isValidating && showValidIcon && isValidEmail && (
            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          
          {!isValidating && hasError && (
            <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Error Message */}
      {showError && hasError && (
        <p 
          id={`${field.id}-error`}
          className="mt-1 text-sm text-red-600 flex items-center"
          role="alert"
        >
          <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {displayError}
        </p>
      )}

      {/* Help Text */}
      {helpText && !hasError && (
        <p 
          id={`${field.id}-help`}
          className="mt-1 text-sm text-gray-500"
        >
          {helpText}
        </p>
      )}

      {/* Email Suggestions (Future Enhancement) */}
      {isDirty && hasValue && !isValidEmail && !hasError && (
        <div className="mt-1 text-xs text-blue-600">
          💡 Tip: Make sure your email includes @ and a domain (e.g., .com, .org)
        </div>
      )}
    </div>
  );
};

// Default props
EmailField.defaultProps = {
  value: '',
  disabled: false,
  readOnly: false,
  showError: true,
  validationMode: 'onBlur',
  debounceMs: 300,
  showValidIcon: true,
  theme: 'default'
};

// Field configuration (matches fieldConfig.js)
EmailField.fieldConfig = FIELD_TYPES.email;

// Display name for React DevTools
EmailField.displayName = 'EmailField';

export default EmailField;