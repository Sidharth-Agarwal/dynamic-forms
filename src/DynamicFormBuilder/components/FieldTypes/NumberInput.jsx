// components/FieldTypes/NumberInput.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Hash } from 'lucide-react';
import { FieldTooltip } from '../UI';
import { validateField } from '../../utils/validators';
import { debounce } from '../../utils/helpers';

const NumberInput = ({
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

  // Debounced onChange
  const debouncedOnChange = debounce((newValue) => {
    onChange?.(newValue);
  }, 150);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    let newValue = e.target.value;
    
    // Handle decimal places
    if (field.allowDecimals === false) {
      newValue = newValue.replace(/\./g, '');
    }
    
    // Apply min/max constraints if specified
    if (newValue !== '' && !isNaN(newValue)) {
      const numValue = parseFloat(newValue);
      
      if (field.min !== undefined && numValue < field.min) {
        newValue = field.min.toString();
      }
      
      if (field.max !== undefined && numValue > field.max) {
        newValue = field.max.toString();
      }
    }

    setInternalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleIncrement = () => {
    const currentValue = parseFloat(internalValue) || 0;
    const step = field.step || 1;
    const newValue = currentValue + step;
    
    if (field.max === undefined || newValue <= field.max) {
      const formattedValue = field.allowDecimals === false ? 
        Math.round(newValue).toString() : 
        newValue.toString();
      
      setInternalValue(formattedValue);
      onChange?.(formattedValue);
    }
  };

  const handleDecrement = () => {
    const currentValue = parseFloat(internalValue) || 0;
    const step = field.step || 1;
    const newValue = currentValue - step;
    
    if (field.min === undefined || newValue >= field.min) {
      const formattedValue = field.allowDecimals === false ? 
        Math.round(newValue).toString() : 
        newValue.toString();
      
      setInternalValue(formattedValue);
      onChange?.(formattedValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    
    // Format the value on blur
    let finalValue = e.target.value;
    
    if (finalValue !== '' && !isNaN(finalValue)) {
      const numValue = parseFloat(finalValue);
      
      // Apply decimal formatting
      if (field.decimalPlaces !== undefined) {
        finalValue = numValue.toFixed(field.decimalPlaces);
      } else if (field.allowDecimals === false) {
        finalValue = Math.round(numValue).toString();
      }
      
      setInternalValue(finalValue);
    }
    
    onBlur?.(finalValue);
  };

  const handleKeyDown = (e) => {
    // Handle arrow keys for increment/decrement
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
    
    // Prevent non-numeric input
    if (field.allowDecimals === false && e.key === '.') {
      e.preventDefault();
    }
  };

  const inputId = `field-${field.id || field.name}`;
  const hasError = error && error.length > 0;
  const isRequired = field.required;
  const showStepper = field.showStepper !== false && mode === 'renderer';

  // Get input attributes
  const getInputProps = () => {
    const props = {
      type: 'number',
      step: field.step || (field.allowDecimals === false ? 1 : 'any'),
      min: field.min,
      max: field.max
    };

    if (field.allowDecimals === false) {
      props.pattern = '[0-9]*';
    }

    return props;
  };

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

        {/* Range Display */}
        {mode === 'renderer' && (field.min !== undefined || field.max !== undefined) && (
          <span className="text-xs text-gray-500">
            {field.min !== undefined && field.max !== undefined
              ? `${field.min} - ${field.max}`
              : field.min !== undefined
              ? `Min: ${field.min}`
              : `Max: ${field.max}`
            }
          </span>
        )}
      </div>

      {/* Input with Stepper */}
      <div className="relative">
        {/* Number Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Hash className="h-5 w-5 text-gray-400" />
        </div>

        <input
          id={inputId}
          name={field.name}
          value={internalValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={field.placeholder || '0'}
          disabled={disabled}
          required={isRequired}
          {...getInputProps()}
          className={`
            block w-full pl-10 py-2 border rounded-md shadow-sm placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${showStepper ? 'pr-16' : 'pr-3'}
            ${hasError 
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${isFocused ? 'ring-2' : ''}
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
        />

        {/* Stepper Buttons */}
        {showStepper && !disabled && (
          <div className="absolute inset-y-0 right-0 flex flex-col">
            <button
              type="button"
              onClick={handleIncrement}
              disabled={field.max !== undefined && parseFloat(internalValue || 0) >= field.max}
              className="flex-1 px-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-300"
            >
              <Plus className="h-3 w-3" />
            </button>
            <div className="border-t border-gray-300"></div>
            <button
              type="button"
              onClick={handleDecrement}
              disabled={field.min !== undefined && parseFloat(internalValue || 0) <= field.min}
              className="flex-1 px-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-300"
            >
              <Minus className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Unit Display */}
      {field.unit && internalValue && (
        <div className="text-sm text-gray-600">
          {internalValue} {field.unit}
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

      {/* Field Info for Builder Mode */}
      {mode === 'builder' && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>Field Name: {field.name}</div>
          <div>Type: Number</div>
          {field.min !== undefined && <div>Min: {field.min}</div>}
          {field.max !== undefined && <div>Max: {field.max}</div>}
          {field.step && <div>Step: {field.step}</div>}
          {field.unit && <div>Unit: {field.unit}</div>}
          <div>Decimals: {field.allowDecimals === false ? 'Not allowed' : 'Allowed'}</div>
        </div>
      )}
    </div>
  );
};

// Builder configuration component
export const NumberInputConfig = ({
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

      {/* Number-specific Properties */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Value
          </label>
          <input
            type="number"
            value={field.min || ''}
            onChange={(e) => handleFieldUpdate({ min: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Value
          </label>
          <input
            type="number"
            value={field.max || ''}
            onChange={(e) => handleFieldUpdate({ max: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Step
          </label>
          <input
            type="number"
            step="any"
            value={field.step || ''}
            onChange={(e) => handleFieldUpdate({ step: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit
          </label>
          <input
            type="text"
            value={field.unit || ''}
            onChange={(e) => handleFieldUpdate({ unit: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., kg, $, %"
          />
        </div>
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

      {/* Number-specific Features */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Number Features</h4>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.allowDecimals !== false}
              onChange={(e) => handleFieldUpdate({ allowDecimals: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Allow decimal numbers</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.showStepper !== false}
              onChange={(e) => handleFieldUpdate({ showStepper: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show increment/decrement buttons</span>
          </label>

          {field.allowDecimals !== false && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Decimal Places</label>
              <input
                type="number"
                min="0"
                max="10"
                value={field.decimalPlaces || ''}
                onChange={(e) => handleFieldUpdate({ 
                  decimalPlaces: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="Auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NumberInput;