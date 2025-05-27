/**
 * NumberField Component
 * Numeric input field with validation and formatting
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../../hooks/index.js';
import { validateField, uiUtils, FIELD_TYPES } from '../../utils/index.js';
import { validationService } from '../../services/index.js';
import { FIELD_TYPE_COLORS } from '../../config/index.js';

const NumberField = ({
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
  allowDecimals = true,
  thousandsSeparator = false,
  theme = 'default'
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Debounced validation
  const debouncedValue = useDebounce(internalValue, debounceMs);

  // Get field configuration
  const fieldConfig = FIELD_TYPES.number;
  const fieldColors = FIELD_TYPE_COLORS.number;

  // Format number for display
  const formatNumber = useCallback((num) => {
    if (num === '' || num === null || num === undefined) return '';
    
    const numValue = parseFloat(num);
    if (isNaN(numValue)) return '';

    if (thousandsSeparator && !isFocused) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: allowDecimals ? 10 : 0
      }).format(numValue);
    }

    return num.toString();
  }, [thousandsSeparator, isFocused, allowDecimals]);

  // Parse display value to number
  const parseNumber = useCallback((displayVal) => {
    if (!displayVal) return '';
    
    // Remove thousands separators and non-numeric characters except decimal point and minus
    const cleaned = displayVal.replace(/[^\d.-]/g, '');
    
    // Handle decimal places
    if (!allowDecimals) {
      return cleaned.replace(/\./g, '');
    }
    
    return cleaned;
  }, [allowDecimals]);

  // Sync with external value changes
  useEffect(() => {
    setInternalValue(value);
    setDisplayValue(formatNumber(value));
  }, [value, formatNumber]);

  // Update display value when focus changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(internalValue));
    }
  }, [isFocused, internalValue, formatNumber]);

  // Handle debounced validation
  useEffect(() => {
    if (validationMode === 'onChange' && isDirty && debouncedValue !== value) {
      handleValidation(debouncedValue);
      onChange?.(debouncedValue, field.id);
    }
  }, [debouncedValue, isDirty, validationMode, field.id, onChange, value]);

  // Number validation
  const validateNumber = useCallback((numValue) => {
    if (!numValue && numValue !== 0) {
      return field.required ? 'This field is required' : null;
    }

    const num = parseFloat(numValue);
    if (isNaN(num)) {
      return 'Please enter a valid number';
    }

    const validation = field.validation || {};

    // Integer validation
    if (validation.integer && !Number.isInteger(num)) {
      return 'Please enter a whole number';
    }

    // Min value validation
    if (validation.min !== undefined && num < validation.min) {
      return `Number must be at least ${validation.min}`;
    }

    // Max value validation
    if (validation.max !== undefined && num > validation.max) {
      return `Number must be no more than ${validation.max}`;
    }

    // Decimal places validation
    if (validation.decimalPlaces !== undefined) {
      const decimalPlaces = (num.toString().split('.')[1] || '').length;
      if (decimalPlaces > validation.decimalPlaces) {
        return `Number can have at most ${validation.decimalPlaces} decimal places`;
      }
    }

    return null;
  }, [field]);

  // Main validation handler
  const handleValidation = useCallback(async (valueToValidate) => {
    setIsValidating(true);
    
    try {
      // Number-specific validation
      const numberError = validateNumber(valueToValidate);
      if (numberError) {
        setLocalError(numberError);
        return numberError;
      }

      // General field validation
      if (field.validation && Object.keys(field.validation).length > 0) {
        const validationResult = await validationService.validateField(valueToValidate, field);
        const errorMessage = validationResult.isValid ? null : validationResult.errors[0];
        
        setLocalError(errorMessage);
        return errorMessage;
      }

      setLocalError(null);
      return null;
    } catch (error) {
      console.error('Number validation error:', error);
      setLocalError('Validation failed');
      return 'Validation failed';
    } finally {
      setIsValidating(false);
    }
  }, [field, validateNumber]);

  // Input change handler
  const handleChange = useCallback((e) => {
    const rawValue = e.target.value;
    const parsedValue = parseNumber(rawValue);
    
    setDisplayValue(rawValue);
    setInternalValue(parsedValue);
    setIsDirty(true);

    if (validationMode === 'onChange') {
      // Validation handled by debounced effect
    } else {
      if (localError || error) {
        setLocalError(null);
      }
      onChange?.(parsedValue, field.id);
    }
  }, [onChange, field.id, validationMode, localError, error, parseNumber]);

  // Blur handler
  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    
    // Format the display value
    setDisplayValue(formatNumber(internalValue));
    
    if (validationMode === 'onBlur' || validationMode === 'onChange') {
      handleValidation(internalValue);
    }

    onBlur?.(e, field.id, internalValue);
  }, [onBlur, field.id, internalValue, validationMode, handleValidation, formatNumber]);

  // Focus handler
  const handleFocus = useCallback((e) => {
    setIsFocused(true);
    // Show raw value without formatting when focused
    setDisplayValue(internalValue.toString());
    onFocus?.(e, field.id);
  }, [onFocus, field.id, internalValue]);

  // Increment/Decrement handlers
  const handleIncrement = useCallback(() => {
    if (disabled || readOnly) return;
    
    const currentNum = parseFloat(internalValue) || 0;
    const step = field.step || 1;
    const newValue = (currentNum + step).toString();
    
    setInternalValue(newValue);
    setDisplayValue(newValue);
    setIsDirty(true);
    onChange?.(newValue, field.id);
  }, [disabled, readOnly, internalValue, field.step, onChange, field.id]);

  const handleDecrement = useCallback(() => {
    if (disabled || readOnly) return;
    
    const currentNum = parseFloat(internalValue) || 0;
    const step = field.step || 1;
    const newValue = (currentNum - step).toString();
    
    setInternalValue(newValue);
    setDisplayValue(newValue);
    setIsDirty(true);
    onChange?.(newValue, field.id);
  }, [disabled, readOnly, internalValue, field.step, onChange, field.id]);

  // Keyboard event handler
  const handleKeyDown = useCallback((e) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        (e.keyCode === 90 && e.ctrlKey === true) ||
        // Allow: home, end, left, right, down, up
        (e.keyCode >= 35 && e.keyCode <= 40)) {
      return;
    }
    
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
        (e.keyCode < 96 || e.keyCode > 105)) {
      
      // Allow decimal point if decimals are allowed
      if (allowDecimals && (e.keyCode === 190 || e.keyCode === 110)) {
        // Only allow one decimal point
        if (displayValue.includes('.')) {
          e.preventDefault();
        }
        return;
      }
      
      // Allow minus sign at the beginning
      if (e.keyCode === 189 || e.keyCode === 109) {
        if (displayValue.includes('-') || e.target.selectionStart !== 0) {
          e.preventDefault();
        }
        return;
      }
      
      e.preventDefault();
    }
  }, [allowDecimals, displayValue]);

  // Determine state
  const displayError = error || localError;
  const hasError = Boolean(displayError);
  const hasValue = Boolean(internalValue);
  const numValue = parseFloat(internalValue);
  const isValidNumber = hasValue && !isNaN(numValue);

  // Generate CSS classes
  const inputClasses = uiUtils.generateClasses(
    // Base classes
    'w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2',
    // State classes
    hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
      : isValidNumber
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
    // Add padding for increment/decrement buttons
    field.showSteppers !== false && 'pr-12',
    className
  );

  // Field configuration
  const {
    label = 'Number',
    placeholder = 'Enter a number...',
    required = false,
    helpText = '',
    min,
    max,
    step = 1
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
        {/* Number Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        </div>

        {/* Input Field */}
        <input
          id={field.id}
          name={field.id}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          min={min}
          max={max}
          step={step}
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

        {/* Increment/Decrement Buttons */}
        {field.showSteppers !== false && !disabled && !readOnly && (
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
            <button
              type="button"
              onClick={handleIncrement}
              className="px-2 py-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
              tabIndex={-1}
              aria-label="Increment"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              className="px-2 py-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
              tabIndex={-1}
              aria-label="Decrement"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Status Indicators */}
        <div className={uiUtils.generateClasses(
          'absolute top-1/2 transform -translate-y-1/2',
          field.showSteppers !== false ? 'right-12' : 'right-3'
        )}>
          {isValidating && (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          )}
          
          {!isValidating && isValidNumber && !hasError && (
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

      {/* Value Range Indicator */}
      {(min !== undefined || max !== undefined) && hasValue && !hasError && (
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          {min !== undefined && <span>Min: {min}</span>}
          {max !== undefined && <span>Max: {max}</span>}
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

      {/* Number Info */}
      {isDirty && hasValue && isValidNumber && !hasError && (
        <div className="mt-1 text-xs text-blue-600">
          {thousandsSeparator && !isFocused && (
            <span>Formatted: {formatNumber(internalValue)}</span>
          )}
          {field.validation?.integer && !Number.isInteger(numValue) && (
            <span className="text-orange-600 ml-2">⚠️ Decimal values will be rounded</span>
          )}
        </div>
      )}
    </div>
  );
};

// Default props
NumberField.defaultProps = {
  value: '',
  disabled: false,
  readOnly: false,
  showError: true,
  validationMode: 'onBlur',
  debounceMs: 300,
  allowDecimals: true,
  thousandsSeparator: false,
  theme: 'default'
};

// Field configuration (matches fieldConfig.js)
NumberField.fieldConfig = FIELD_TYPES.number;

// Display name for React DevTools
NumberField.displayName = 'NumberField';

export default NumberField;