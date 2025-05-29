// components/FieldTypes/TextInput.jsx
import React, { useState, useEffect } from 'react';
import { Tooltip, FieldTooltip } from '../UI';
import { validateField } from '../../utils/validators';
import { debounce } from '../../utils/helpers';

const TextInput = ({
  field,
  value = '',
  onChange,
  onBlur,
  error = null,
  disabled = false,
  mode = 'renderer', // 'renderer' or 'builder'
  className = ''
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [characterCount, setCharacterCount] = useState(value?.length || 0);

  // Debounced onChange to avoid excessive re-renders
  const debouncedOnChange = debounce((newValue) => {
    onChange?.(newValue);
  }, 150);

  useEffect(() => {
    setInternalValue(value);
    setCharacterCount(value?.length || 0);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    
    // Apply maxLength if specified
    if (field.maxLength && newValue.length > field.maxLength) {
      return; // Don't update if exceeds max length
    }

    setInternalValue(newValue);
    setCharacterCount(newValue.length);
    debouncedOnChange(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Handle special key behaviors if needed
    if (field.validation?.pattern && e.key === 'Enter') {
      // Validate on Enter if pattern is specified
      const errors = validateField(internalValue, field);
      if (errors.length > 0) {
        e.preventDefault();
      }
    }
  };

  // Get input type based on field configuration
  const getInputType = () => {
    if (field.inputType) return field.inputType;
    if (field.validation?.pattern) {
      // Auto-detect type based on common patterns
      const pattern = field.validation.pattern;
      if (pattern.includes('[0-9]')) return 'text'; // Keep as text for custom number patterns
    }
    return 'text';
  };

  const inputId = `field-${field.id || field.name}`;
  const hasError = error && error.length > 0;
  const showCharacterCount = field.maxLength && (isFocused || mode === 'builder');
  const isRequired = field.required;

  return (
    <div className={`space-y-2 ${className}`}>
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

        {showCharacterCount && (
          <span className={`text-xs ${
            characterCount > (field.maxLength * 0.9) ? 'text-yellow-600' : 'text-gray-500'
          }`}>
            {characterCount}{field.maxLength ? `/${field.maxLength}` : ''}
          </span>
        )}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          id={inputId}
          name={field.name}
          type={getInputType()}
          value={internalValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={field.placeholder || ''}
          disabled={disabled}
          required={isRequired}
          minLength={field.validation?.minLength}
          maxLength={field.maxLength}
          pattern={field.validation?.pattern}
          autoComplete={field.autoComplete || 'off'}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${hasError 
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${isFocused ? 'ring-2' : ''}
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
        />

        {/* Input validation indicator */}
        {mode === 'renderer' && internalValue && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {hasError ? (
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
          {Array.isArray(error) ? error[0] : error}
        </p>
      )}

      {/* Help Text (if no error) */}
      {!hasError && field.helpText && mode === 'renderer' && (
        <p className="text-sm text-gray-500">
          {field.helpText}
        </p>
      )}

      {/* Field Info for Builder Mode */}
      {mode === 'builder' && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>Field Name: {field.name}</div>
          {field.validation?.minLength && (
            <div>Min Length: {field.validation.minLength}</div>
          )}
          {field.maxLength && (
            <div>Max Length: {field.maxLength}</div>
          )}
          {field.validation?.pattern && (
            <div>Pattern: {field.validation.pattern}</div>
          )}
        </div>
      )}
    </div>
  );
};

// Builder-specific configuration component
export const TextInputConfig = ({
  field,
  onUpdate,
  className = ''
}) => {
  const handleFieldUpdate = (updates) => {
    onUpdate({ ...field, ...updates });
  };

  const handleValidationUpdate = (validationUpdates) => {
    onUpdate({
      ...field,
      validation: { ...field.validation, ...validationUpdates }
    });
  };

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
          Placeholder
        </label>
        <input
          type="text"
          value={field.placeholder || ''}
          onChange={(e) => handleFieldUpdate({ placeholder: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Enter placeholder text"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Min Length</label>
              <input
                type="number"
                min="0"
                value={field.validation?.minLength || ''}
                onChange={(e) => handleValidationUpdate({ 
                  minLength: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="block w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max Length</label>
              <input
                type="number"
                min="1"
                value={field.maxLength || ''}
                onChange={(e) => handleFieldUpdate({ 
                  maxLength: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="block w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Pattern (RegEx)</label>
            <input
              type="text"
              value={field.validation?.pattern || ''}
              onChange={(e) => handleValidationUpdate({ pattern: e.target.value || undefined })}
              className="block w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="e.g., ^[A-Za-z]+$"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextInput;