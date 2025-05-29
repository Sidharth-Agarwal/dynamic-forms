// components/FieldTypes/RadioGroup.jsx
import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { FieldTooltip, Button } from '../UI';
import { validateField } from '../../utils/validators';

const RadioGroup = ({
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

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleOptionChange = (optionValue) => {
    setInternalValue(optionValue);
    onChange?.(optionValue);
  };

  const handleBlur = () => {
    onBlur?.(internalValue);
  };

  const inputId = `field-${field.id || field.name}`;
  const hasError = error && error.length > 0;
  const isRequired = field.required;

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
      </div>

      {/* Radio Options */}
      <div className={`space-y-2 ${field.layout === 'horizontal' ? 'sm:flex sm:space-y-0 sm:space-x-6' : ''}`}>
        {(field.options || []).map((option, index) => {
          const optionId = `${inputId}-option-${index}`;
          const isSelected = internalValue === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <div key={option.value || index} className="flex items-center">
              <input
                id={optionId}
                name={field.name}
                type="radio"
                value={option.value}
                checked={isSelected}
                onChange={() => !isDisabled && handleOptionChange(option.value)}
                onBlur={handleBlur}
                disabled={isDisabled}
                className={`
                  h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${hasError ? 'border-red-300' : ''}
                `}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${inputId}-error` : undefined}
              />
              <label
                htmlFor={optionId}
                className={`
                  ml-3 block text-sm font-medium cursor-pointer
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
                {option.description && (
                  <p className="text-xs text-gray-500 mt-1 ml-0">
                    {option.description}
                  </p>
                )}
              </label>
            </div>
          );
        })}
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
          <div>Type: Radio Group</div>
          <div>Options: {field.options?.length || 0}</div>
          <div>Layout: {field.layout || 'vertical'}</div>
        </div>
      )}
    </div>
  );
};

// Builder configuration component
export const RadioGroupConfig = ({
  field,
  onUpdate,
  className = ''
}) => {
  const [newOption, setNewOption] = useState({ label: '', value: '' });

  const handleFieldUpdate = (updates) => {
    onUpdate({ ...field, ...updates });
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
          <option value="horizontal">Horizontal</option>
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
    </div>
  );
};

export default RadioGroup;