// components/FieldTypes/TextArea.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FieldTooltip } from '../UI';
import { validateField } from '../../utils/validators';
import { debounce } from '../../utils/helpers';

const TextArea = ({
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
  const [characterCount, setCharacterCount] = useState(value?.length || 0);
  const textareaRef = useRef(null);

  // Debounced onChange
  const debouncedOnChange = debounce((newValue) => {
    onChange?.(newValue);
  }, 150);

  useEffect(() => {
    setInternalValue(value);
    setCharacterCount(value?.length || 0);
  }, [value]);

  // Auto-resize functionality
  useEffect(() => {
    if (field.autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [internalValue, field.autoResize]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    
    // Apply maxLength if specified
    if (field.maxLength && newValue.length > field.maxLength) {
      return;
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
    // Handle Tab key for indentation if enabled
    if (field.allowTabs && e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = internalValue.substring(0, start) + '\t' + internalValue.substring(end);
      
      setInternalValue(newValue);
      debouncedOnChange(newValue);
      
      // Set cursor position after tab
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 1;
      }, 0);
    }
  };

  const inputId = `field-${field.id || field.name}`;
  const hasError = error && error.length > 0;
  const showCharacterCount = field.maxLength && (isFocused || mode === 'builder');
  const isRequired = field.required;
  const rows = field.rows || 4;

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

      {/* TextArea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id={inputId}
          name={field.name}
          value={internalValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={field.placeholder || ''}
          disabled={disabled}
          required={isRequired}
          rows={field.autoResize ? 1 : rows}
          minLength={field.validation?.minLength}
          maxLength={field.maxLength}
          style={{
            minHeight: field.autoResize ? `${rows * 1.5}rem` : undefined,
            resize: field.autoResize ? 'none' : 'vertical'
          }}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${hasError 
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${isFocused ? 'ring-2' : ''}
            ${field.autoResize ? 'overflow-hidden' : ''}
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
        />

        {/* Word count indicator */}
        {field.showWordCount && internalValue && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1 rounded">
            {internalValue.trim().split(/\s+/).filter(word => word.length > 0).length} words
          </div>
        )}
      </div>

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

      {/* Field Info for Builder Mode */}
      {mode === 'builder' && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>Field Name: {field.name}</div>
          <div>Rows: {rows}</div>
          {field.validation?.minLength && (
            <div>Min Length: {field.validation.minLength}</div>
          )}
          {field.maxLength && (
            <div>Max Length: {field.maxLength}</div>
          )}
          {field.autoResize && <div>Auto-resize: Enabled</div>}
          {field.allowTabs && <div>Tab Support: Enabled</div>}
        </div>
      )}
    </div>
  );
};

// Builder configuration component
export const TextAreaConfig = ({
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

      {/* Textarea-specific Properties */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rows
        </label>
        <input
          type="number"
          min="2"
          max="20"
          value={field.rows || 4}
          onChange={(e) => handleFieldUpdate({ rows: parseInt(e.target.value) || 4 })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md"
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
        </div>
      </div>

      {/* Additional Features */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Features</h4>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.autoResize || false}
              onChange={(e) => handleFieldUpdate({ autoResize: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Auto-resize height</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.allowTabs || false}
              onChange={(e) => handleFieldUpdate({ allowTabs: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Allow tab indentation</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.showWordCount || false}
              onChange={(e) => handleFieldUpdate({ showWordCount: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show word count</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default TextArea;