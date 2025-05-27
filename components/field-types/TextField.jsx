/**
 * TextField Component
 * Basic text input field for forms
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../../hooks/index.js';
import { validateField, uiUtils, FIELD_TYPES } from '../../utils/index.js';
import { validationService } from '../../services/index.js';
import { FIELD_TYPE_COLORS } from '../../config/index.js';

const TextField = ({
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
  validationMode = 'onBlur', // 'onChange' | 'onBlur' | 'onSubmit'
  debounceMs = 300,
  theme = 'default'
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Debounced validation for onChange mode
  const debouncedValue = useDebounce(internalValue, debounceMs);

  // Get field configuration
  const fieldConfig = FIELD_TYPES.text;
  const fieldColors = FIELD_TYPE_COLORS.text;

  // Sync with external value changes
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

  // Validation handler
  const handleValidation = useCallback(async (valueToValidate) => {
    if (!field.validation || Object.keys(field.validation).length === 0) {
      setLocalError(null);
      return null;
    }

    setIsValidating(true);
    
    try {
      const validationResult = await validationService.validateField(valueToValidate, field);
      const errorMessage = validationResult.isValid ? null : validationResult.errors[0];
      
      setLocalError(errorMessage);
      return errorMessage;
    } catch (error) {
      console.error('Validation error:', error);
      setLocalError('Validation failed');
      return 'Validation failed';
    } finally {
      setIsValidating(false);
    }
  }, [field]);

  // Input change handler
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    setIsDirty(true);

    // For immediate validation modes
    if (validationMode === 'onChange') {
      // Validation will be handled by debounced effect
    } else {
      // Clear previous errors when user starts typing
      if (localError || error) {
        setLocalError(null);
      }
      // Immediate callback for non-debounced scenarios
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

  // Generate CSS classes using uiUtils
  const inputClasses = uiUtils.generateClasses(
    // Base input classes
    'w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2',
    // State-based classes
    hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
    // Value state
    hasValue ? 'bg-white' : 'bg-gray-50',
    // Focus state
    isFocused && 'ring-2',
    // Disabled state
    disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
    // Read-only state
    readOnly && 'bg-gray-100 cursor-default',
    // Validation state
    isValidating && 'opacity-75',
    // Custom classes
    className
  );

  // Field configuration from config
  const {
    label = 'Text Field',
    placeholder = '',
    required = false,
    validation = {},
    helpText = ''
  } = field;

  const {
    minLength,
    maxLength,
    pattern
  } = validation;

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
        {/* Input Field */}
        <input
          id={field.id}
          name={field.id}
          type="text"
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          className={inputClasses}
          style={style}
          aria-invalid={hasError}
          aria-describedby={
            uiUtils.generateClasses(
              hasError && `${field.id}-error`,
              helpText && `${field.id}-help`,
              maxLength && `${field.id}-count`
            ).trim() || undefined
          }
        />

        {/* Validation Indicator */}
        {isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Success Indicator */}
        {!hasError && !isValidating && hasValue && isDirty && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Character Count */}
      {maxLength && (
        <div className="flex justify-end mt-1">
          <span 
            id={`${field.id}-count`}
            className={uiUtils.generateClasses(
              'text-xs transition-colors',
              internalValue.length > maxLength * 0.8 
                ? internalValue.length >= maxLength 
                  ? 'text-red-600 font-medium' 
                  : 'text-orange-600'
                : 'text-gray-500'
            )}
          >
            {internalValue.length}/{maxLength}
          </span>
        </div>
      )}

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
    </div>
  );
};

// Default props
TextField.defaultProps = {
  value: '',
  disabled: false,
  readOnly: false,
  showError: true,
  validationMode: 'onBlur',
  debounceMs: 300,
  theme: 'default'
};

// Field configuration for form builder (matches fieldConfig.js)
TextField.fieldConfig = FIELD_TYPES.text;

// Display name for React DevTools
TextField.displayName = 'TextField';

export default TextField;