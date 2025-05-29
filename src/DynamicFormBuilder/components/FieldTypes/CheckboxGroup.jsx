// components/FieldTypes/CheckboxGroup.jsx
import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { FieldTooltip, Button } from '../UI';
import { validateField } from '../../utils/validators';

const CheckboxGroup = ({
  field,
  value = [],
  onChange,
  onBlur,
  error = null,
  disabled = false,
  mode = 'renderer',
  className = ''
}) => {
  const [internalValue, setInternalValue] = useState(Array.isArray(value) ? value : []);

  useEffect(() => {
    setInternalValue(Array.isArray(value) ? value : []);
  }, [value]);

  const handleOptionChange = (optionValue, isChecked) => {
    let newValue;
    
    if (isChecked) {
      // Add option to selection
      newValue = [...internalValue, optionValue];
    } else {
      // Remove option from selection
      newValue = internalValue.filter(val => val !== optionValue);
    }

    // Apply min/max selection limits
    if (field.validation?.maxSelections && newValue.length > field.validation.maxSelections) {
      return; // Don't update if exceeds max
    }

    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleSelectAll = () => {
    const allValues = (field.options || [])
      .filter(option => !option.disabled)
      .map(option => option.value);
    
    setInternalValue(allValues);
    onChange?.(allValues);
  };

  const handleSelectNone = () => {
    setInternalValue([]);
    onChange?.([]);
  };

  const handleBlur = () => {
    onBlur?.(internalValue);
  };

  const inputId = `field-${field.id || field.name}`;
  const hasError = error && error.length > 0;
  const isRequired = field.required;
  const hasSelectAll = field.allowSelectAll && (field.options || []).length > 2;
  
  // Check selection limits
  const minSelections = field.validation?.minSelections;
  const maxSelections = field.validation?.maxSelections;
  const hasReachedMin = minSelections && internalValue.length >= minSelections;
  const hasReachedMax = maxSelections && internalValue.length >= maxSelections;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <fieldset>
          <legend className={`text-sm font-medium ${
            hasError ? 'text-red-700' : 'text-gray-700'
          }`}>
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
            {field.helpText && (
              <FieldTooltip content={field.helpText}>
                <span className="ml-1 text-gray-400 cursor-help">?</span>
              </FieldTooltip>
            )}
          </legend>
        </fieldset>

        {/* Selection Info */}
        {mode === 'renderer' && (minSelections || maxSelections) && (
          <span className="text-xs text-gray-500">
            {internalValue.length} selected
            {minSelections && maxSelections
              ? ` (${minSelections}-${maxSelections} required)`
              : minSelections
              ? ` (min ${minSelections})`
              : maxSelections
              ? ` (max ${maxSelections})`
              : ''
            }
          </span>
        )}
      </div>

      {/* Select All/None Controls */}
      {hasSelectAll && mode === 'renderer' && !disabled && (
        <div className="flex space-x-3 text-sm">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={hasReachedMax}
            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleSelectNone}
            disabled={internalValue.length === 0}
            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Select None
          </button>
        </div>
      )}

      {/* Checkbox Options */}
      <div className={`space-y-2 ${field.layout === 'horizontal' ? 'sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0' : ''}`}>
        {(field.options || []).map((option, index) => {
          const optionId = `${inputId}-option-${index}`;
          const isSelected = internalValue.includes(option.value);
          const isDisabled = disabled || option.disabled || (hasReachedMax && !isSelected);

          return (
            <div key={option.value || index} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={optionId}
                  name={`${field.name}[]`}
                  type="checkbox"
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => !isDisabled && handleOptionChange(option.value, e.target.checked)}
                  onBlur={handleBlur}
                  disabled={isDisabled}
                  className={`
                    h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${hasError ? 'border-red-300' : ''}
                  `}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `${inputId}-error` : undefined}
                />
              </div>
              
              <div className="ml-3 text-sm">
                <label
                  htmlFor={optionId}
                  className={`
                    font-medium cursor-pointer
                    ${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}
                    ${hasError ? 'text-red-700' : ''}
                  `}
                >
                  <div className="flex items-center">
                    {option.icon && (
                      <span className="mr-2">
                        {option.icon}
                      </span>
                    )}
                    <span>{option.label}</span>
                  </div>
                </label>
                {option.description && (
                  <p className="text-gray-500 mt-1">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Validation Hints */}
      {mode === 'renderer' && !hasError && (minSelections || maxSelections) && (
        <div className="text-sm">
          {minSelections && internalValue.length < minSelections && (
            <p className="text-yellow-600">
              Please select at least {minSelections} option{minSelections > 1 ? 's' : ''}
            </p>
          )}
          {maxSelections && internalValue.length >= maxSelections && (
            <p className="text-blue-600">
              Maximum {maxSelections} option{maxSelections > 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      )}

      {/* Selected Options Summary */}
      {field.showSelectedSummary && internalValue.length > 0 && mode === 'renderer' && (
        <div className="text-sm">
          <p className="font-medium text-gray-700 mb-1">Selected:</p>
          <div className="flex flex-wrap gap-1">
            {internalValue.map((selectedValue) => {
              const option = field.options?.find(opt => opt.value === selectedValue);
              return option ? (
                <span
                  key={selectedValue}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {option.label}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleOptionChange(selectedValue, false)}
                      className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ) : null;
            })}
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

      {/* Field Info for Builder Mode */}
      {mode === 'builder' && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>Field Name: {field.name}</div>
          <div>Type: Checkbox Group</div>
          <div>Options: {field.options?.length || 0}</div>
          <div>Layout: {field.layout || 'vertical'}</div>
          {minSelections && <div>Min Selections: {minSelections}</div>}
          {maxSelections && <div>Max Selections: {maxSelections}</div>}
        </div>
      )}
    </div>
  );
};

// Builder configuration component
export const CheckboxGroupConfig = ({
  field,
  onUpdate,
  className = ''
}) => {
  const [newOption, setNewOption] = useState({ label: '', value: '' });

  const handleFieldUpdate = (updates) => {
    onUpdate({ ...field, ...updates });
  };

  const handleValidationUpdate = (validationUpdates) => {
    onUpdate({
      ...field,
      validation: { ...field.validation, ...validationUpdates }
    });
  };

  const handleOptionAdd = () => {
    if (!newOption.label.trim()) return;

    const option = {
      label: newOption.label.trim(),
      value: newOption.value.trim() || newOption.label.toLowerCase().replace(/\s+/g, '_'),
      disabled: false
    };

    const updatedOptions = [...(field.options || []), option];
    handleFieldUpdate({ options: updatedOptions });
    setNewOption({ label: '', value: '' });
  };

  const handleOptionUpdate = (index, updates) => {
    const updatedOptions = [...(field.options || [])];
    updatedOptions[index] = { ...updatedOptions[index], ...updates };
    handleFieldUpdate({ options: updatedOptions });
  };

  const handleOptionRemove = (index) => {
    const updatedOptions = field.options?.filter((_, i) => i !== index) || [];
    handleFieldUpdate({ options: updatedOptions });
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

      {/* Layout Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Layout
        </label>
        <select
          value={field.layout || 'vertical'}
          onChange={(e) => handleFieldUpdate({ layout: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="vertical">Vertical</option>
          <option value="horizontal">Horizontal (Grid)</option>
        </select>
      </div>

      {/* Options Management */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Options</h4>
        
        {/* Add New Option */}
        <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-md">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Option label"
              value={newOption.label}
              onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Option value (optional)"
              value={newOption.value}
              onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={Plus}
            onClick={handleOptionAdd}
            disabled={!newOption.label.trim()}
          >
            Add Option
          </Button>
        </div>

        {/* Existing Options */}
        <div className="space-y-2">
          {(field.options || []).map((option, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 border border-gray-200 rounded">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => handleOptionUpdate(index, { label: e.target.value })}
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="Option label"
                />
                <input
                  type="text"
                  value={option.value || ''}
                  onChange={(e) => handleOptionUpdate(index, { value: e.target.value })}
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="Option value"
                />
              </div>
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={option.disabled || false}
                  onChange={(e) => handleOptionUpdate(index, { disabled: e.target.checked })}
                  className="mr-1"
                />
                Disabled
              </label>
              <button
                type="button"
                onClick={() => handleOptionRemove(index)}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Selection Limits */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Selection Limits</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Minimum Selections</label>
            <input
              type="number"
              min="0"
              value={field.validation?.minSelections || ''}
              onChange={(e) => handleValidationUpdate({ 
                minSelections: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="block w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Maximum Selections</label>
            <input
              type="number"
              min="1"
              value={field.validation?.maxSelections || ''}
              onChange={(e) => handleValidationUpdate({ 
                maxSelections: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="block w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="Unlimited"
            />
          </div>
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
            <span className="ml-2 text-sm text-gray-700">Required (at least one selection)</span>
          </label>
        </div>
      </div>

      {/* Checkbox-specific Features */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Checkbox Features</h4>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.allowSelectAll || false}
              onChange={(e) => handleFieldUpdate({ allowSelectAll: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show "Select All" / "Select None" buttons</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.showSelectedSummary || false}
              onChange={(e) => handleFieldUpdate({ showSelectedSummary: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show selected options summary</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CheckboxGroup;