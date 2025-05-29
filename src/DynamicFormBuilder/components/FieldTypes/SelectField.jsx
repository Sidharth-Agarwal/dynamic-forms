// components/FieldTypes/SelectField.jsx
import React, { useState, useEffect } from 'react';
import { ChevronDown, Check, X, Plus } from 'lucide-react';
import { FieldTooltip, Button } from '../UI';
import { validateField } from '../../utils/validators';

const SelectField = ({
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
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleOptionSelect = (optionValue) => {
    if (field.multiple) {
      const currentValues = Array.isArray(internalValue) ? internalValue : [];
      let newValues;
      
      if (currentValues.includes(optionValue)) {
        newValues = currentValues.filter(v => v !== optionValue);
      } else {
        newValues = [...currentValues, optionValue];
      }
      
      setInternalValue(newValues);
      onChange?.(newValues);
    } else {
      setInternalValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    const newValue = field.multiple ? [] : '';
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleBlur = () => {
    setIsOpen(false);
    onBlur?.(internalValue);
  };

  const getSelectedOption = () => {
    if (field.multiple) return null;
    return field.options?.find(option => option.value === internalValue);
  };

  const getSelectedOptions = () => {
    if (!field.multiple) return [];
    const values = Array.isArray(internalValue) ? internalValue : [];
    return field.options?.filter(option => values.includes(option.value)) || [];
  };

  const getFilteredOptions = () => {
    if (!searchTerm || !field.searchable) return field.options || [];
    return field.options?.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  };

  const inputId = `field-${field.id || field.name}`;
  const hasError = error && error.length > 0;
  const isRequired = field.required;
  const selectedOption = getSelectedOption();
  const selectedOptions = getSelectedOptions();
  const filteredOptions = getFilteredOptions();

  const getDisplayText = () => {
    if (field.multiple) {
      if (selectedOptions.length === 0) return field.placeholder || 'Select options...';
      if (selectedOptions.length === 1) return selectedOptions[0].label;
      return `${selectedOptions.length} options selected`;
    } else {
      return selectedOption ? selectedOption.label : (field.placeholder || 'Select an option...');
    }
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
      </div>

      {/* Select Dropdown */}
      <div className="relative">
        <button
          id={inputId}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onBlur={handleBlur}
          disabled={disabled}
          className={`
            relative w-full bg-white border rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${hasError 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
          `}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
        >
          <span className={`block truncate ${
            (field.multiple ? selectedOptions.length === 0 : !selectedOption) ? 'text-gray-500' : 'text-gray-900'
          }`}>
            {getDisplayText()}
          </span>
          
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>

        {/* Clear Button */}
        {!disabled && ((field.multiple && selectedOptions.length > 0) || (!field.multiple && selectedOption)) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="absolute inset-y-0 right-8 flex items-center pr-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md border border-gray-300 text-base overflow-auto focus:outline-none">
            {/* Search Input */}
            {field.searchable && (
              <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                <input
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Options List */}
            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {searchTerm ? 'No options found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = field.multiple 
                    ? selectedOptions.some(selected => selected.value === option.value)
                    : selectedOption?.value === option.value;

                  return (
                    <button
                      key={option.value || index}
                      type="button"
                      onClick={() => handleOptionSelect(option.value)}
                      className={`
                        w-full text-left px-3 py-2 text-sm flex items-center justify-between
                        hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                        ${isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                        ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      disabled={option.disabled}
                    >
                      <div className="flex items-center">
                        {option.icon && (
                          <span className="mr-2">
                            {option.icon}
                          </span>
                        )}
                        <span>{option.label}</span>
                        {option.description && (
                          <span className="ml-2 text-xs text-gray-500">
                            {option.description}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Options Display (Multiple) */}
      {field.multiple && selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
            >
              {option.label}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleOptionSelect(option.value)}
                  className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
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
          <div>Type: Select</div>
          <div>Options: {field.options?.length || 0}</div>
          <div>Multiple: {field.multiple ? 'Yes' : 'No'}</div>
          <div>Searchable: {field.searchable ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

// Builder configuration component
export const SelectFieldConfig = ({
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

  const handleOptionReorder = (fromIndex, toIndex) => {
    const updatedOptions = [...(field.options || [])];
    const [moved] = updatedOptions.splice(fromIndex, 1);
    updatedOptions.splice(toIndex, 0, moved);
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
          Placeholder
        </label>
        <input
          type="text"
          value={field.placeholder || ''}
          onChange={(e) => handleFieldUpdate({ placeholder: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Select an option..."
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

      {/* Select-specific Features */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Select Features</h4>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.multiple || false}
              onChange={(e) => handleFieldUpdate({ multiple: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Allow multiple selections</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.searchable || false}
              onChange={(e) => handleFieldUpdate({ searchable: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable search functionality</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.clearable !== false}
              onChange={(e) => handleFieldUpdate({ clearable: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Allow clearing selection</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SelectField;