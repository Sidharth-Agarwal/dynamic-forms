// components/FieldTypes/EmailInput.jsx
import React, { useState, useEffect } from 'react';
import { Mail, Check, X } from 'lucide-react';
import { FieldTooltip } from '../UI';
import { validateField } from '../../utils/validators';
import { debounce, isValidEmail } from '../../utils/helpers';

const EmailInput = ({
  field,
  value = '',
  onChange,
  onBlur,
  error = null,
  disabled = false,
  mode = 'renderer',
  className = ''
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Debounced onChange and validation
  const debouncedOnChange = debounce((newValue) => {
    onChange?.(newValue);
  }, 150);

  const debouncedValidation = debounce((emailValue) => {
    setIsValidating(false);
    if (emailValue) {
      setIsValid(isValidEmail(emailValue));
    } else {
      setIsValid(false);
    }
  }, 300);

  useEffect(() => {
    setInternalValue(value);
    if (value) {
      setIsValid(isValidEmail(value));
    }
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value.trim(); // Auto-trim email inputs
    
    setInternalValue(newValue);
    setIsValidating(true);
    
    debouncedOnChange(newValue);
    debouncedValidation(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e.target.value.trim());
  };

  const handlePaste = (e) => {
    // Clean up pasted email addresses
    const paste = e.clipboardData.getData('text');
    const cleanEmail = paste.trim().toLowerCase();
    
    if (isValidEmail(cleanEmail)) {
      e.preventDefault();
      setInternalValue(cleanEmail);
      debouncedOnChange(cleanEmail);
      setIsValid(true);
    }
  };

  const getSuggestions = () => {
    if (!internalValue || internalValue.includes('@')) return [];
    
    const commonDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'icloud.com',
      'aol.com'
    ];

    return commonDomains.map(domain => `${internalValue}@${domain}`);
  };

  const inputId = `field-${field.id || field.name}`;
  const hasError = error && error.length > 0;
  const isRequired = field.required;
  const suggestions = field.showSuggestions ? getSuggestions() : [];

  // Determine validation state
  const getValidationState = () => {
    if (!internalValue) return 'none';
    if (isValidating) return 'validating';
    if (hasError) return 'error';
    if (isValid) return 'valid';
    return 'invalid';
  };

  const validationState = getValidationState();

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
      </div>

      {/* Input */}
      <div className="relative">
        {/* Email Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail className="h-5 w-5 text-gray-400" />
        </div>

        <input
          id={inputId}
          name={field.name}
          type="email"
          value={internalValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onPaste={handlePaste}
          placeholder={field.placeholder || 'Enter your email address'}
          disabled={disabled}
          required={isRequired}
          autoComplete="email"
          className={`
            block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400
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

        {/* Validation Indicator */}
        {mode === 'renderer' && internalValue && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {validationState === 'validating' && (
              <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
            )}
            {validationState === 'valid' && (
              <Check className="h-5 w-5 text-green-500" />
            )}
            {validationState === 'invalid' && (
              <X className="h-5 w-5 text-red-500" />
            )}
            {validationState === 'error' && (
              <X className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Email Suggestions */}
      {suggestions.length > 0 && isFocused && !hasError && (
        <div className="bg-white border border-gray-200 rounded-md shadow-sm mt-1">
          <div className="py-1">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setInternalValue(suggestion);
                  onChange?.(suggestion);
                  setIsValid(true);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
          {Array.isArray(error) ? error[0] : error}
        </p>
      )}

      {/* Help Text */}
      {!hasError && field.helpText && mode === 'renderer' && (
        <p className="text-sm text-gray-500">
          {field.helpText}
        </p>
      )}

      {/* Validation Hint */}
      {!hasError && internalValue && validationState === 'invalid' && mode === 'renderer' && (
        <p className="text-sm text-yellow-600">
          Please enter a valid email address
        </p>
      )}

      {/* Field Info for Builder Mode */}
      {mode === 'builder' && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>Field Name: {field.name}</div>
          <div>Type: Email</div>
          <div>Auto-validation: Enabled</div>
          {field.showSuggestions && <div>Email suggestions: Enabled</div>}
        </div>
      )}
    </div>
  );
};

// Builder configuration component
export const EmailInputConfig = ({
  field,
  onUpdate,
  className = ''
}) => {
  const handleFieldUpdate = (updates) => {
    onUpdate({ ...field, ...updates });
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
        </div>
      </div>

      {/* Email-specific Features */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Email Features</h4>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.showSuggestions || false}
              onChange={(e) => handleFieldUpdate({ showSuggestions: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show email suggestions</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.allowMultiple || false}
              onChange={(e) => handleFieldUpdate({ allowMultiple: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Allow multiple emails (comma-separated)</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.verifyEmail || false}
              onChange={(e) => handleFieldUpdate({ verifyEmail: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Require email verification</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default EmailInput;