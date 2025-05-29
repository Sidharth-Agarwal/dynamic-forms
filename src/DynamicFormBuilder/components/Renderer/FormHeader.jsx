// components/Renderer/FormHeader.jsx
import React from 'react';
import { Badge, Card } from '../UI';
import { Clock, Users, FileText, Shield } from 'lucide-react';

const FormHeader = ({
  form,
  currentStep = 0,
  isMultiStep = false,
  showMetadata = true,
  showStatus = true,
  compact = false,
  className = ''
}) => {
  if (!form) return null;

  const getCurrentStepInfo = () => {
    if (!isMultiStep || !form.steps) return null;
    
    const step = form.steps[currentStep];
    return step || null;
  };

  const stepInfo = getCurrentStepInfo();

  // Compact header for embedded forms
  if (compact) {
    return (
      <div className={`form-header form-header--compact ${className}`}>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {stepInfo?.title || form.title}
          </h2>
          {(stepInfo?.description || form.description) && (
            <p className="text-sm text-gray-600 mt-1">
              {stepInfo?.description || form.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`form-header ${className}`}>
      {/* Main Header */}
      <div className="text-center mb-6">
        {/* Form Status */}
        {showStatus && form.status && (
          <div className="flex justify-center mb-3">
            <Badge 
              variant={form.status === 'published' ? 'success' : 'secondary'}
              size="sm"
            >
              {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
            </Badge>
          </div>
        )}

        {/* Form Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {stepInfo?.title || form.title}
        </h1>

        {/* Form Description */}
        {(stepInfo?.description || form.description) && (
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-600 leading-relaxed">
              {stepInfo?.description || form.description}
            </p>
          </div>
        )}

        {/* Multi-step indicator */}
        {isMultiStep && form.steps && (
          <div className="mt-4 text-sm text-gray-500">
            Step {currentStep + 1} of {form.steps.length}
            {stepInfo?.title && (
              <span className="font-medium"> - {stepInfo.title}</span>
            )}
          </div>
        )}
      </div>

      {/* Form Metadata */}
      {showMetadata && !compact && (
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            {/* Estimated Time */}
            {form.settings?.estimatedTime && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{form.settings.estimatedTime} min</span>
              </div>
            )}

            {/* Response Count */}
            {form.submissionCount !== undefined && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{form.submissionCount} responses</span>
              </div>
            )}

            {/* Field Count */}
            {form.fields?.length && (
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                <span>{form.fields.length} questions</span>
              </div>
            )}

            {/* Privacy Notice */}
            {form.settings?.showPrivacyNotice && (
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                <span>Secure</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Header Content */}
      {form.settings?.headerHTML && (
        <div 
          className="custom-header-content mb-6"
          dangerouslySetInnerHTML={{ __html: form.settings.headerHTML }}
        />
      )}

      {/* Form Instructions */}
      {form.settings?.instructions && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">
                Instructions
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                {form.settings.instructions}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Required Fields Notice */}
      {form.fields?.some(field => field.required) && (
        <div className="text-center text-sm text-gray-500 mb-4">
          <span className="text-red-500">*</span> Indicates required fields
        </div>
      )}

      {/* Progress Indicator for Long Forms */}
      {!isMultiStep && form.fields?.length > 10 && (
        <div className="text-center text-sm text-gray-500 mb-4">
          This form has {form.fields.length} questions and takes approximately{' '}
          {Math.ceil(form.fields.length * 0.5)} minutes to complete.
        </div>
      )}
    </div>
  );
};

// Specialized header components
export const MinimalFormHeader = ({ form, className = '' }) => (
  <FormHeader 
    form={form} 
    compact={true}
    showMetadata={false}
    showStatus={false}
    className={className}
  />
);

export const DetailedFormHeader = ({ form, className = '' }) => (
  <FormHeader 
    form={form} 
    showMetadata={true}
    showStatus={true}
    className={className}
  />
);

export const StepFormHeader = ({ form, currentStep, className = '' }) => (
  <FormHeader 
    form={form}
    currentStep={currentStep}
    isMultiStep={true}
    showMetadata={false}
    className={className}
  />
);

export default FormHeader;