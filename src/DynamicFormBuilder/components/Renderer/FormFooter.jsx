// components/Renderer/FormFooter.jsx
import React from 'react';
import { Button } from '../UI';
import { ChevronLeft, ChevronRight, Send, Save, RotateCcw, Shield } from 'lucide-react';

const FormFooter = ({
  form,
  isMultiStep = false,
  currentStep = 0,
  progressInfo = null,
  isSubmitting = false,
  canSubmit = false,
  onPrevious,
  onNext,
  onSubmit,
  onSaveDraft,
  onReset,
  showDraftSave = false,
  showReset = false,
  showPrivacyInfo = true,
  className = ''
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = progressInfo?.isLastStep || !isMultiStep;
  const canProceed = progressInfo?.canProceed ?? true;

  return (
    <div className={`form-footer border-t border-gray-200 pt-6 ${className}`}>
      {/* Privacy and Security Info */}
      {showPrivacyInfo && form?.settings?.showPrivacyNotice && (
        <div className="flex items-center justify-center text-xs text-gray-500 mb-4">
          <Shield className="h-3 w-3 mr-1" />
          <span>Your information is secure and will not be shared with third parties</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left Side - Previous/Secondary Actions */}
        <div className="flex items-center space-x-3">
          {/* Previous Step Button */}
          {isMultiStep && !isFirstStep && (
            <Button
              type="button"
              variant="secondary"
              onClick={onPrevious}
              disabled={isSubmitting}
              icon={ChevronLeft}
              className="order-1 sm:order-none"
            >
              Previous
            </Button>
          )}

          {/* Save Draft Button */}
          {showDraftSave && onSaveDraft && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSaveDraft}
              disabled={isSubmitting}
              icon={Save}
              size="sm"
              className="order-3 sm:order-none"
            >
              Save Draft
            </Button>
          )}

          {/* Reset Button */}
          {showReset && onReset && (
            <Button
              type="button"
              variant="ghost"
              onClick={onReset}
              disabled={isSubmitting}
              icon={RotateCcw}
              size="sm"
              className="order-4 sm:order-none text-gray-500 hover:text-gray-700"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Right Side - Primary Actions */}
        <div className="flex items-center space-x-3">
          {/* Next Step Button */}
          {isMultiStep && !isLastStep && (
            <Button
              type="button"
              variant="primary"
              onClick={onNext}
              disabled={!canProceed || isSubmitting}
              icon={ChevronRight}
              iconPosition="right"
              className="order-2 sm:order-none flex-1 sm:flex-none"
            >
              Next
            </Button>
          )}

          {/* Submit Button */}
          {isLastStep && (
            <Button
              type="submit"
              variant="primary"
              onClick={onSubmit}
              disabled={!canSubmit || isSubmitting}
              loading={isSubmitting}
              icon={Send}
              iconPosition="right"
              className="order-2 sm:order-none flex-1 sm:flex-none"
            >
              {isSubmitting ? 'Submitting...' : (form?.settings?.submitButtonText || 'Submit')}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Text for Multi-step */}
      {isMultiStep && progressInfo && (
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-500">
            {progressInfo.currentStep} of {progressInfo.totalSteps} steps completed
          </div>
          {progressInfo.completionPercentage > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              {Math.round(progressInfo.completionPercentage)}% of form completed
            </div>
          )}
        </div>
      )}

      {/* Submission Guidelines */}
      {form?.settings?.submissionGuidelines && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600">
            <strong>Before submitting:</strong> {form.settings.submissionGuidelines}
          </p>
        </div>
      )}

      {/* Custom Footer Content */}
      {form?.settings?.footerHTML && (
        <div 
          className="mt-4 custom-footer-content"
          dangerouslySetInnerHTML={{ __html: form.settings.footerHTML }}
        />
      )}
    </div>
  );
};

// Specialized footer components
export const SimpleFormFooter = ({ 
  onSubmit, 
  isSubmitting = false, 
  canSubmit = false,
  submitText = 'Submit',
  className = '' 
}) => (
  <div className={`form-footer-simple text-center ${className}`}>
    <Button
      type="submit"
      variant="primary"
      onClick={onSubmit}
      disabled={!canSubmit || isSubmitting}
      loading={isSubmitting}
      icon={Send}
      size="lg"
    >
      {isSubmitting ? 'Submitting...' : submitText}
    </Button>
  </div>
);

export const CompactFormFooter = ({ 
  onSubmit, 
  isSubmitting = false, 
  canSubmit = false,
  className = '' 
}) => (
  <div className={`form-footer-compact flex justify-end ${className}`}>
    <Button
      type="submit"
      variant="primary"
      onClick={onSubmit}
      disabled={!canSubmit || isSubmitting}
      loading={isSubmitting}
      size="sm"
    >
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </Button>
  </div>
);

export const MultiStepFormFooter = ({
  currentStep,
  totalSteps,
  canProceed = true,
  isSubmitting = false,
  onPrevious,
  onNext,
  onSubmit,
  className = ''
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className={`form-footer-multistep ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          {!isFirstStep && (
            <Button
              type="button"
              variant="secondary"
              onClick={onPrevious}
              disabled={isSubmitting}
              icon={ChevronLeft}
            >
              Previous
            </Button>
          )}
        </div>

        <div className="text-sm text-gray-500">
          Step {currentStep + 1} of {totalSteps}
        </div>

        <div>
          {isLastStep ? (
            <Button
              type="submit"
              variant="primary"
              onClick={onSubmit}
              disabled={!canProceed || isSubmitting}
              loading={isSubmitting}
              icon={Send}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={onNext}
              disabled={!canProceed || isSubmitting}
              icon={ChevronRight}
              iconPosition="right"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const StickyFormFooter = ({ 
  children, 
  className = '',
  ...props 
}) => (
  <div className={`sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg ${className}`}>
    <div className="max-w-2xl mx-auto">
      <FormFooter {...props}>
        {children}
      </FormFooter>
    </div>
  </div>
);

export default FormFooter;