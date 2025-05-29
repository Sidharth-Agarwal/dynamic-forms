// hooks/useFormRenderer.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';
import { formService, submissionService } from '../services';
import { useFormValidation } from './useFieldValidation';
import { useConditionalLogic } from './useConditionalLogic';
import { useLocalStorage } from './useLocalStorage';
import { formatFormData, deepClone } from '../utils';

/**
 * Hook for form rendering and submission
 * @param {string} formId - ID of form to render
 * @param {Object} options - Configuration options
 * @returns {Object} - Form renderer state and functions
 */
export const useFormRenderer = (formId, options = {}) => {
  const {
    enableDrafts = true,
    enableProgress = true,
    enableValidation = true,
    submitOnComplete = true,
    showProgressBar = true
  } = options;

  // Context and services
  const { showSuccess, showError, showWarning } = useNotification();

  // State
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [touchedFields, setTouchedFields] = useState(new Set());
  const [submission, setSubmission] = useState(null);
  
  // Local storage for draft
  const [draft, setDraft] = useLocalStorage(`form-response-${formId}`, null);
  
  // Refs
  const formRef = useRef(null);
  const startTime = useRef(null);

  // Conditional logic
  const conditionalLogic = useConditionalLogic(form?.fields || [], formData);

  // Form validation
  const validation = useFormValidation(
    form, 
    formData, 
    { 
      validateOnChange: enableValidation,
      validateOnSubmit: true 
    }
  );

  // Load form on mount
  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId]);

  // Initialize start time when form loads
  useEffect(() => {
    if (form && !startTime.current) {
      startTime.current = Date.now();
    }
  }, [form]);

  // Load form data
  const loadForm = useCallback(async () => {
    setIsLoading(true);
    try {
      const formData = await formService.getForm(formId);
      if (formData) {
        setForm(formData);
        
        // Initialize form data with default values
        const initialData = {};
        formData.fields.forEach(field => {
          if (field.defaultValue !== undefined) {
            initialData[field.name] = field.defaultValue;
          }
        });
        
        // Load draft if available
        if (enableDrafts && draft) {
          setFormData({ ...initialData, ...draft.data });
          showWarning('Draft restored. You can continue where you left off.');
        } else {
          setFormData(initialData);
        }
      } else {
        showError('Form not found');
      }
    } catch (error) {
      console.error('Error loading form:', error);
      showError('Failed to load form');
    } finally {
      setIsLoading(false);
    }
  }, [formId, enableDrafts, draft, showError, showWarning]);

  // Update field value
  const updateFieldValue = useCallback((fieldName, value) => {
    setFormData(prev => {
      const newData = { ...prev, [fieldName]: value };
      
      // Save draft if enabled
      if (enableDrafts) {
        setDraft({
          formId,
          data: newData,
          savedAt: new Date().toISOString()
        });
      }
      
      return newData;
    });

    // Mark field as touched
    setTouchedFields(prev => new Set([...prev, fieldName]));
    
    // Trigger field validation if enabled
    if (enableValidation) {
      validation.touchField(fieldName);
    }
  }, [formId, enableDrafts, enableValidation, setDraft, validation]);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName, value) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));
    
    if (enableValidation) {
      validation.validateField(fieldName, value);
    }
  }, [enableValidation, validation]);

  // Get visible fields for current step
  const getVisibleFields = useCallback(() => {
    if (!form) return [];
    
    let fields = form.fields;
    
    // Apply conditional logic
    if (conditionalLogic) {
      fields = conditionalLogic.getVisibleFields();
    }
    
    // For multi-step forms, filter by current step
    if (form.settings?.multiStep && form.steps) {
      const currentStepConfig = form.steps[currentStep];
      if (currentStepConfig) {
        fields = fields.filter(field => 
          currentStepConfig.fields.includes(field.name)
        );
      }
    }
    
    return fields;
  }, [form, currentStep, conditionalLogic]);

  // Get completion percentage
  const getCompletionPercentage = useCallback(() => {
    if (!form) return 0;
    
    const visibleFields = getVisibleFields();
    const requiredFields = visibleFields.filter(field => 
      conditionalLogic ? conditionalLogic.isFieldRequired(field.name) : field.required
    );
    
    if (requiredFields.length === 0) return 100;
    
    const completedFields = requiredFields.filter(field => {
      const value = formData[field.name];
      return value !== undefined && value !== null && value !== '';
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }, [form, formData, getVisibleFields, conditionalLogic]);

  // Check if current step is valid
  const isCurrentStepValid = useCallback(() => {
    if (!enableValidation) return true;
    
    const stepFields = getVisibleFields();
    return stepFields.every(field => {
      const fieldValidation = validation.getFieldValidation(field.name);
      return fieldValidation.isValid || !fieldValidation.isTouched;
    });
  }, [enableValidation, getVisibleFields, validation]);

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (!form || !form.settings?.multiStep) return;
    
    if (!isCurrentStepValid()) {
      // Touch all fields in current step to show validation errors
      const stepFields = getVisibleFields();
      stepFields.forEach(field => {
        validation.touchField(field.name);
      });
      showWarning('Please correct the errors before proceeding');
      return;
    }
    
    if (currentStep < (form.steps?.length || 1) - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [form, currentStep, isCurrentStepValid, getVisibleFields, validation, showWarning]);

  // Navigate to previous step
  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Go to specific step
  const goToStep = useCallback((stepIndex) => {
    if (!form || !form.settings?.multiStep) return;
    
    if (stepIndex >= 0 && stepIndex < (form.steps?.length || 1)) {
      setCurrentStep(stepIndex);
    }
  }, [form]);

  // Submit form
  const submitForm = useCallback(async (finalData = formData) => {
    if (!form) return false;

    setIsSubmitting(true);
    
    try {
      // Final validation
      if (enableValidation) {
        const formValidation = await validation.validateForSubmit(finalData);
        if (!formValidation.isValid) {
          showError('Please correct all errors before submitting');
          setIsSubmitting(false);
          return false;
        }
      }

      // Calculate completion time
      const completionTime = startTime.current 
        ? Date.now() - startTime.current 
        : 0;

      // Format data for submission
      const submissionData = formatFormData(finalData, form);
      
      // Add metadata
      const metadata = {
        completionTime,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        formVersion: form.version || '1.0'
      };

      // Submit to service
      const result = await submissionService.submitForm(formId, submissionData, metadata);
      
      if (result) {
        setSubmission(result);
        setIsSubmitted(true);
        
        // Clear draft
        if (enableDrafts) {
          setDraft(null);
        }
        
        // Show success message
        const message = form.settings?.confirmationMessage || 'Thank you for your submission!';
        showSuccess(message);
        
        // Handle redirect if configured
        if (form.settings?.redirectUrl) {
          setTimeout(() => {
            window.location.href = form.settings.redirectUrl;
          }, 2000);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error submitting form:', error);
      showError('Failed to submit form. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [form, formData, formId, enableValidation, enableDrafts, validation, setDraft, showSuccess, showError]);

  // Reset form
  const resetForm = useCallback(() => {
    if (!form) return;
    
    // Reset to initial values
    const initialData = {};
    form.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue;
      }
    });
    
    setFormData(initialData);
    setTouchedFields(new Set());
    setCurrentStep(0);
    setIsSubmitted(false);
    setSubmission(null);
    startTime.current = Date.now();
    
    // Clear validation
    validation.clearValidation();
    
    // Clear draft
    if (enableDrafts) {
      setDraft(null);
    }
  }, [form, enableDrafts, setDraft, validation]);

  // Save draft manually
  const saveDraft = useCallback(() => {
    if (!enableDrafts || !form) return;
    
    setDraft({
      formId,
      data: formData,
      savedAt: new Date().toISOString(),
      step: currentStep
    });
    
    showSuccess('Draft saved');
  }, [enableDrafts, form, formId, formData, currentStep, setDraft, showSuccess]);

  // Get field props for rendering
  const getFieldProps = useCallback((field) => {
    const fieldName = field.name;
    const fieldValidation = validation.getFieldValidation(fieldName);
    
    // Apply conditional modifications
    let modifiedField = field;
    if (conditionalLogic) {
      modifiedField = conditionalLogic.getModifiedField(field);
    }
    
    return {
      field: modifiedField,
      value: formData[fieldName] || '',
      onChange: (value) => updateFieldValue(fieldName, value),
      onBlur: (value) => handleFieldBlur(fieldName, value),
      error: fieldValidation.errors,
      disabled: isSubmitting || isSubmitted,
      mode: 'renderer'
    };
  }, [formData, validation, conditionalLogic, isSubmitting, isSubmitted, updateFieldValue, handleFieldBlur]);

  // Get form progress info
  const getProgressInfo = useCallback(() => {
    if (!form) return null;
    
    const totalSteps = form.settings?.multiStep ? (form.steps?.length || 1) : 1;
    const completionPercentage = getCompletionPercentage();
    
    return {
      currentStep: currentStep + 1,
      totalSteps,
      stepProgress: ((currentStep + 1) / totalSteps) * 100,
      completionPercentage,
      canProceed: isCurrentStepValid(),
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === totalSteps - 1
    };
  }, [form, currentStep, getCompletionPercentage, isCurrentStepValid]);

  // Check if form can be submitted
  const canSubmit = useCallback(() => {
    if (!form || isSubmitting || isSubmitted) return false;
    
    if (form.settings?.multiStep) {
      const progress = getProgressInfo();
      return progress?.isLastStep && progress?.canProceed;
    }
    
    return isCurrentStepValid();
  }, [form, isSubmitting, isSubmitted, getProgressInfo, isCurrentStepValid]);

  return {
    // State
    form,
    formData,
    isLoading,
    isSubmitting,
    isSubmitted,
    submission,
    currentStep,
    touchedFields: Array.from(touchedFields),
    
    // Form operations
    updateFieldValue,
    handleFieldBlur,
    submitForm,
    resetForm,
    saveDraft,
    
    // Navigation (multi-step)
    nextStep,
    previousStep,
    goToStep,
    
    // Utilities
    getVisibleFields,
    getFieldProps,
    getProgressInfo,
    getCompletionPercentage,
    canSubmit,
    isCurrentStepValid,
    
    // Validation
    validation,
    
    // Conditional logic
    conditionalLogic
  };
};

/**
 * Hook for form submission tracking and analytics
 * @param {string} formId - Form ID
 * @returns {Object} - Submission tracking functions
 */
export const useFormSubmissionTracking = (formId) => {
  const [analytics, setAnalytics] = useState({
    startTime: null,
    fieldInteractions: {},
    timeSpentOnFields: {},
    validationErrors: 0,
    submissionAttempts: 0
  });

  // Track form start
  const trackFormStart = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      startTime: Date.now()
    }));
  }, []);

  // Track field interaction
  const trackFieldInteraction = useCallback((fieldName, interactionType) => {
    setAnalytics(prev => ({
      ...prev,
      fieldInteractions: {
        ...prev.fieldInteractions,
        [fieldName]: (prev.fieldInteractions[fieldName] || 0) + 1
      }
    }));
  }, []);

  // Track validation error
  const trackValidationError = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      validationErrors: prev.validationErrors + 1
    }));
  }, []);

  // Track submission attempt
  const trackSubmissionAttempt = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      submissionAttempts: prev.submissionAttempts + 1
    }));
  }, []);

  // Get analytics data
  const getAnalytics = useCallback(() => {
    const totalTime = analytics.startTime 
      ? Date.now() - analytics.startTime 
      : 0;

    return {
      ...analytics,
      totalTime,
      averageFieldInteractions: Object.keys(analytics.fieldInteractions).length > 0
        ? Object.values(analytics.fieldInteractions).reduce((a, b) => a + b, 0) / Object.keys(analytics.fieldInteractions).length
        : 0
    };
  }, [analytics]);

  return {
    trackFormStart,
    trackFieldInteraction,
    trackValidationError,
    trackSubmissionAttempt,
    getAnalytics
  };
};

export default useFormRenderer;