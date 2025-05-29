// components/Renderer/ValidationSummary.jsx
import React, { useMemo } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Card, Button } from '../UI';

const ValidationSummary = ({
  validation,
  visibleFields = [],
  showOnlyTouched = true,
  showSuccessMessage = false,
  autoScroll = true,
  collapsible = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [hasBeenShown, setHasBeenShown] = React.useState(false);

  // Process validation errors
  const validationSummary = useMemo(() => {
    if (!validation) {
      return {
        hasErrors: false,
        errorCount: 0,
        fieldErrors: [],
        isValid: true
      };
    }

    const fieldErrors = [];
    let errorCount = 0;

    // Process field errors
    Object.entries(validation.fieldErrors || {}).forEach(([fieldName, errors]) => {
      if (!errors || errors.length === 0) return;

      // Find field info
      const field = visibleFields.find(f => f.name === fieldName);
      if (!field) return;

      // Skip if showing only touched fields and this field hasn't been touched
      if (showOnlyTouched && !validation.touchedFields?.includes(fieldName)) {
        return;
      }

      fieldErrors.push({
        fieldName,
        fieldLabel: field.label || fieldName,
        errors: Array.isArray(errors) ? errors : [errors],
        fieldId: field.id
      });

      errorCount += Array.isArray(errors) ? errors.length : 1;
    });

    return {
      hasErrors: fieldErrors.length > 0,
      errorCount,
      fieldErrors,
      isValid: validation.isValid && fieldErrors.length === 0
    };
  }, [validation, visibleFields, showOnlyTouched]);

  // Auto-scroll to validation summary when errors appear
  React.useEffect(() => {
    if (validationSummary.hasErrors && autoScroll && !hasBeenShown) {
      const timer = setTimeout(() => {
        const element = document.querySelector('.validation-summary');
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);

      setHasBeenShown(true);
      return () => clearTimeout(timer);
    }
  }, [validationSummary.hasErrors, autoScroll, hasBeenShown]);

  // Reset hasBeenShown when errors are cleared
  React.useEffect(() => {
    if (!validationSummary.hasErrors) {
      setHasBeenShown(false);
    }
  }, [validationSummary.hasErrors]);

  // Helper function to scroll to field
  const scrollToField = (fieldId) => {
    if (!fieldId) return;
    
    const element = document.querySelector(`[data-field-id="${fieldId}"]`) || 
                   document.querySelector(`#field-${fieldId}`) ||
                   document.querySelector(`[name="${fieldId}"]`);
    
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Focus the field if it's focusable
      const input = element.querySelector('input, textarea, select, [tabindex]');
      if (input && typeof input.focus === 'function') {
        setTimeout(() => input.focus(), 300);
      }
    }
  };

  // Don't render if no errors and not showing success
  if (!validationSummary.hasErrors && !showSuccessMessage) {
    return null;
  }

  // Success message
  if (!validationSummary.hasErrors && showSuccessMessage && validationSummary.isValid) {
    return (
      <div className={`validation-summary validation-summary--success ${className}`}>
        <Card className="border-green-200 bg-green-50">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                All fields are valid
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Your form is ready to submit.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Error summary
  return (
    <div className={`validation-summary validation-summary--error ${className}`}>
      <Card className="border-red-200 bg-red-50">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  {validationSummary.errorCount === 1 
                    ? 'Please correct the following error:' 
                    : `Please correct the following ${validationSummary.errorCount} errors:`
                  }
                </h3>
              </div>
              
              {collapsible && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-red-600 hover:text-red-800 focus:outline-none ml-2"
                  aria-expanded={isExpanded}
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

            {/* Error List */}
            {(!collapsible || isExpanded) && (
              <div className="mt-3">
                <ul className="space-y-2">
                  {validationSummary.fieldErrors.map((fieldError, index) => (
                    <ValidationError
                      key={`${fieldError.fieldName}-${index}`}
                      fieldError={fieldError}
                      onFieldClick={() => scrollToField(fieldError.fieldId)}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Individual validation error component
const ValidationError = ({ 
  fieldError, 
  onFieldClick, 
  showFieldName = true 
}) => {
  return (
    <li className="flex items-start">
      <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {showFieldName && (
          <button
            type="button"
            onClick={onFieldClick}
            className="text-sm font-medium text-red-700 hover:text-red-800 underline focus:outline-none"
          >
            {fieldError.fieldLabel}:
          </button>
        )}
        <div className="text-sm text-red-600">
          {fieldError.errors.map((error, index) => (
            <div key={index} className={showFieldName ? 'ml-2' : ''}>
              • {error}
            </div>
          ))}
        </div>
      </div>
    </li>
  );
};

// Inline validation summary for specific fields
export const InlineValidationSummary = ({ 
  fieldName, 
  validation, 
  className = '' 
}) => {
  const fieldErrors = validation?.fieldErrors?.[fieldName];
  
  if (!fieldErrors || fieldErrors.length === 0) {
    return null;
  }

  return (
    <div className={`inline-validation-summary mt-1 ${className}`}>
      {fieldErrors.map((error, index) => (
        <div key={index} className="flex items-center text-sm text-red-600">
          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ))}
    </div>
  );
};

// Floating validation summary
export const FloatingValidationSummary = ({ 
  validation, 
  visibleFields, 
  onClose,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const hasErrors = validation?.fieldErrors && 
      Object.keys(validation.fieldErrors).length > 0;
    
    setIsVisible(hasErrors);
  }, [validation]);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-md ${className}`}>
      <Card className="border-red-200 bg-red-50 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Form has errors
              </h4>
              <p className="text-sm text-red-700 mt-1">
                Please review and correct the highlighted fields.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            className="text-red-400 hover:text-red-600 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </div>
  );
};

// Summary for multi-step forms
export const StepValidationSummary = ({ 
  validation, 
  currentStep, 
  stepFields,
  className = '' 
}) => {
  const stepErrors = useMemo(() => {
    if (!validation?.fieldErrors || !stepFields) return [];
    
    return stepFields
      .filter(field => validation.fieldErrors[field.name])
      .map(field => ({
        fieldName: field.name,
        fieldLabel: field.label,
        errors: validation.fieldErrors[field.name]
      }));
  }, [validation, stepFields]);

  if (stepErrors.length === 0) {
    return null;
  }

  return (
    <ValidationSummary
      validation={{
        fieldErrors: stepErrors.reduce((acc, error) => {
          acc[error.fieldName] = error.errors;
          return acc;
        }, {}),
        isValid: false
      }}
      visibleFields={stepFields}
      className={className}
    />
  );
};

// Validation summary with custom renderer
export const CustomValidationSummary = ({
  validation,
  visibleFields,
  renderError,
  renderSuccess,
  className = ''
}) => {
  const validationSummary = useMemo(() => {
    if (!validation) return { hasErrors: false, fieldErrors: [], isValid: true };

    const fieldErrors = [];
    Object.entries(validation.fieldErrors || {}).forEach(([fieldName, errors]) => {
      if (!errors || errors.length === 0) return;
      const field = visibleFields.find(f => f.name === fieldName);
      if (!field) return;

      fieldErrors.push({
        fieldName,
        fieldLabel: field.label || fieldName,
        errors: Array.isArray(errors) ? errors : [errors],
        field
      });
    });

    return {
      hasErrors: fieldErrors.length > 0,
      fieldErrors,
      isValid: validation.isValid && fieldErrors.length === 0
    };
  }, [validation, visibleFields]);

  if (!validationSummary.hasErrors && validationSummary.isValid && renderSuccess) {
    return renderSuccess();
  }

  if (validationSummary.hasErrors && renderError) {
    return renderError(validationSummary.fieldErrors);
  }

  return <ValidationSummary validation={validation} visibleFields={visibleFields} className={className} />;
};

export default ValidationSummary;