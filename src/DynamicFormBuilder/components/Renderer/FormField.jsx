// components/Renderer/FormField.jsx
import React, { memo } from 'react';
import { FieldRenderer } from '../FieldTypes';
import { Tooltip } from '../UI';
import { AlertCircle, HelpCircle } from 'lucide-react';

const FormField = memo(({
  field,
  value,
  onChange,
  onBlur,
  error = null,
  disabled = false,
  className = '',
  showFieldInfo = false,
  renderMode = 'standard' // 'standard', 'compact', 'inline'
}) => {
  const hasError = error && error.length > 0;
  const isRequired = field.required;
  const fieldId = `field-${field.id || field.name}`;

  // Don't render if field is not visible
  if (field.visible === false) {
    return null;
  }

  // Render compact mode
  if (renderMode === 'compact') {
    return (
      <div className={`form-field form-field--compact ${className}`}>
        <FieldRenderer
          field={field}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          disabled={disabled}
          mode="renderer"
        />
      </div>
    );
  }

  // Render inline mode (for single-line layouts)
  if (renderMode === 'inline') {
    return (
      <div className={`form-field form-field--inline flex items-center space-x-3 ${className}`}>
        <div className="flex-shrink-0">
          <label 
            htmlFor={fieldId}
            className={`text-sm font-medium ${hasError ? 'text-red-700' : 'text-gray-700'}`}
          >
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        <div className="flex-1">
          <FieldRenderer
            field={field}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
            disabled={disabled}
            mode="renderer"
          />
        </div>
      </div>
    );
  }

  // Standard mode (default)
  return (
    <div className={`form-field ${hasError ? 'form-field--error' : ''} ${className}`}>
      {/* Field Container */}
      <div className="relative">
        {/* Field Component */}
        <FieldRenderer
          field={field}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          disabled={disabled}
          mode="renderer"
        />

        {/* Field Status Indicators */}
        <div className="absolute top-0 right-0 flex items-center space-x-1 mt-1 mr-1">
          {/* Help Text Tooltip */}
          {field.helpText && (
            <Tooltip content={field.helpText} position="left">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
            </Tooltip>
          )}

          {/* Error Indicator */}
          {hasError && (
            <Tooltip 
              content={Array.isArray(error) ? error.join(', ') : error} 
              position="left"
            >
              <AlertCircle className="h-4 w-4 text-red-500" />
            </Tooltip>
          )}

          {/* Required Indicator */}
          {isRequired && !hasError && (
            <span className="h-4 w-4 flex items-center justify-center">
              <span className="h-1 w-1 bg-red-500 rounded-full"></span>
            </span>
          )}
        </div>
      </div>

      {/* Field Information (Development/Debug) */}
      {showFieldInfo && process.env.NODE_ENV === 'development' && (
        <details className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <summary className="cursor-pointer font-medium">Field Info (Dev)</summary>
          <div className="mt-2 space-y-1">
            <div><strong>ID:</strong> {field.id}</div>
            <div><strong>Name:</strong> {field.name}</div>
            <div><strong>Type:</strong> {field.type}</div>
            <div><strong>Required:</strong> {isRequired ? 'Yes' : 'No'}</div>
            <div><strong>Value:</strong> {JSON.stringify(value)}</div>
            {field.validation && (
              <div><strong>Validation:</strong> {JSON.stringify(field.validation)}</div>
            )}
            {field.conditions && (
              <div><strong>Conditions:</strong> {JSON.stringify(field.conditions)}</div>
            )}
          </div>
        </details>
      )}

      {/* Conditional Logic Debug */}
      {field._conditionalState && process.env.NODE_ENV === 'development' && (
        <div className="mt-1 text-xs text-blue-600 bg-blue-50 p-1 rounded">
          Conditional: {JSON.stringify(field._conditionalState)}
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

// Higher-order component for field animation
export const AnimatedFormField = ({ 
  field, 
  animationType = 'fadeIn',
  duration = 300,
  ...props 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const animationClasses = {
    fadeIn: `transition-opacity duration-${duration} ${isVisible ? 'opacity-100' : 'opacity-0'}`,
    slideIn: `transition-all duration-${duration} transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`,
    scaleIn: `transition-all duration-${duration} transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`
  };

  return (
    <div className={animationClasses[animationType]}>
      <FormField field={field} {...props} />
    </div>
  );
};

// Field group component for related fields
export const FormFieldGroup = ({
  title,
  description,
  fields = [],
  children,
  collapsible = false,
  defaultExpanded = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <div className={`form-field-group border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Group Header */}
      {title && (
        <div className="mb-4 pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">{title}</h3>
              {description && (
                <p className="text-xs text-gray-600 mt-1">{description}</p>
              )}
            </div>
            {collapsible && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg 
                  className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Group Content */}
      {(!collapsible || isExpanded) && (
        <div className="space-y-4">
          {children || fields.map((field, index) => (
            <FormField key={field.id || index} field={field} />
          ))}
        </div>
      )}
    </div>
  );
};

// Responsive field layout wrapper
export const ResponsiveFieldLayout = ({
  fields = [],
  breakpoint = 'md',
  columns = 2,
  className = ''
}) => {
  const breakpointClasses = {
    sm: `sm:grid-cols-${columns}`,
    md: `md:grid-cols-${columns}`,
    lg: `lg:grid-cols-${columns}`,
    xl: `xl:grid-cols-${columns}`
  };

  return (
    <div className={`grid grid-cols-1 ${breakpointClasses[breakpoint]} gap-4 ${className}`}>
      {fields.map((field, index) => (
        <FormField 
          key={field.id || index} 
          field={field}
          className={field.fullWidth ? `col-span-full` : ''}
        />
      ))}
    </div>
  );
};

export default FormField;