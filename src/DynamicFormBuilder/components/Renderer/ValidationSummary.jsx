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
                      onFiel