// components/Renderer/FormRenderer.jsx
import React, { useEffect, useState } from 'react';
import { useFormRenderer } from '../../hooks/useFormRenderer';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner, Card, EmptyState, ErrorState } from '../UI';
import FormHeader from './FormHeader';
import FormField from './FormField';
import FormFooter from './FormFooter';
import ProgressBar from './ProgressBar';
import ConditionalRenderer from './ConditionalRenderer';
import ValidationSummary from './ValidationSummary';

const FormRenderer = ({
  formId,
  onSubmissionComplete = null,
  onSubmissionError = null,
  className = '',
  showHeader = true,
  showFooter = true,
  showProgress = true,
  enableDrafts = true,
  customTheme = null,
  embedded = false
}) => {
  const { showError } = useNotification();
  const [renderKey, setRenderKey] = useState(0);

  // Use form renderer hook
  const {
    form,
    formData,
    isLoading,
    isSubmitting,
    isSubmitted,
    submission,
    currentStep,
    updateFieldValue,
    handleFieldBlur,
    submitForm,
    resetForm,
    nextStep,
    previousStep,
    getVisibleFields,
    getFieldProps,
    getProgressInfo,
    canSubmit,
    validation,
    conditionalLogic
  } = useFormRenderer(formId, {
    enableDrafts,
    enableProgress: showProgress,
    submitOnComplete: true
  });

  // Handle submission completion
  useEffect(() => {
    if (isSubmitted && submission) {
      onSubmissionComplete?.(submission, form);
    }
  }, [isSubmitted, submission, form, onSubmissionComplete]);

  // Handle form reset (for development/testing)
  const handleReset = () => {
    resetForm();
    setRenderKey(prev => prev + 1); // Force re-render
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const success = await submitForm();
      if (!success) {
        onSubmissionError?.(new Error('Submission failed'), form);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      onSubmissionError?.(error, form);
      showError('Failed to submit form. Please try again.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`form-renderer ${className}`}>
        <Card padding="lg" className="max-w-2xl mx-auto">
          <LoadingSpinner size="lg" text="Loading form..." />
        </Card>
      </div>
    );
  }

  // Form not found
  if (!form) {
    return (
      <div className={`form-renderer ${className}`}>
        <Card padding="lg" className="max-w-2xl mx-auto">
          <ErrorState 
            title="Form Not Found"
            description="The requested form could not be found or is no longer available."
          />
        </Card>
      </div>
    );
  }

  // Form not accepting responses
  if (!form.settings?.acceptResponses) {
    return (
      <div className={`form-renderer ${className}`}>
        <Card padding="lg" className="max-w-2xl mx-auto">
          <EmptyState
            title="Form Closed"
            description="This form is no longer accepting responses."
            icon={() => <span className="text-4xl">🔒</span>}
          />
        </Card>
      </div>
    );
  }

  // Submission complete
  if (isSubmitted) {
    return (
      <div className={`form-renderer ${className}`}>
        <Card padding="lg" className="max-w-2xl mx-auto">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-600 mb-4">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {form.settings?.confirmationTitle || 'Thank You!'}
            </h3>
            <p className="text-gray-600 mb-6">
              {form.settings?.confirmationMessage || 'Your response has been submitted successfully.'}
            </p>
            
            {submission && (
              <div className="bg-gray-50 rounded-md p-4 mb-4">
                <p className="text-sm text-gray-600">
                  Submission ID: <span className="font-mono">{submission.id}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Submitted: {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
            )}

            {/* Development/Testing Reset Button */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={handleReset}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Reset Form (Dev Only)
              </button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const progressInfo = getProgressInfo();
  const visibleFields = getVisibleFields();
  const isMultiStep = form.settings?.multiStep && form.steps?.length > 1;

  return (
    <div 
      key={renderKey}
      className={`form-renderer ${className}`}
      style={customTheme ? { ...customTheme } : {}}
    >
      <Card 
        padding="lg" 
        className={`${embedded ? '' : 'max-w-2xl mx-auto'} ${form.settings?.customCSS || ''}`}
      >
        <form onSubmit={handleSubmit} noValidate>
          {/* Form Header */}
          {showHeader && (
            <FormHeader 
              form={form}
              currentStep={currentStep}
              isMultiStep={isMultiStep}
              className="mb-6"
            />
          )}

          {/* Progress Bar */}
          {showProgress && isMultiStep && progressInfo && (
            <ProgressBar 
              {...progressInfo}
              form={form}
              className="mb-6"
            />
          )}

          {/* Validation Summary */}
          <ValidationSummary 
            validation={validation}
            visibleFields={visibleFields}
            className="mb-4"
          />

          {/* Form Fields */}
          <ConditionalRenderer
            fields={visibleFields}
            formData={formData}
            conditionalLogic={conditionalLogic}
            renderField={(field) => (
              <FormField
                key={field.id}
                {...getFieldProps(field)}
                className="mb-6"
              />
            )}
            className="space-y-6"
          />

          {/* Form Footer */}
          {showFooter && (
            <FormFooter
              form={form}
              isMultiStep={isMultiStep}
              currentStep={currentStep}
              progressInfo={progressInfo}
              isSubmitting={isSubmitting}
              canSubmit={canSubmit()}
              onPrevious={previousStep}
              onNext={nextStep}
              onSubmit={handleSubmit}
              className="mt-8"
            />
          )}
        </form>
      </Card>
    </div>
  );
};

export default FormRenderer;