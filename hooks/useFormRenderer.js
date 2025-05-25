import { useState, useEffect, useCallback, useRef } from 'react';
import { useFormRenderer as useFormRendererContext } from '../context/FormRendererContext.js';
import { firebaseService } from '../services/firebaseService.js';
import { formUtils } from '../utils/index.js';

/**
 * Enhanced form renderer hook with additional functionality
 * @param {string} formId - Form ID to render
 * @param {object} options - Configuration options
 * @returns {object} Enhanced form renderer state and methods
 */
export const useFormRenderer = (formId = null, options = {}) => {
  const {
    enableAutoSave = false,
    autoSaveInterval = 30000,
    enableProgressTracking = true,
    onSubmissionComplete = null,
    onSubmissionError = null,
    onFieldChange = null
  } = options;

  const context = useFormRendererContext();
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  
  const autoSaveTimeoutRef = useRef(null);
  const loadedFormIdRef = useRef(null);

  // Load form configuration
  const loadForm = useCallback(async (id = formId) => {
    if (!id || loadedFormIdRef.current === id) return;

    try {
      setIsLoading(true);
      setLoadError(null);
      
      const formData = await firebaseService.getForm(id);
      
      // Check if form is active
      if (!formData.settings?.isActive) {
        throw new Error('This form is currently inactive');
      }

      setForm(formData);
      context.setFormConfig(formData);
      loadedFormIdRef.current = id;
      
    } catch (err) {
      setLoadError(err.message);
      console.error('Error loading form:', err);
    } finally {
      setIsLoading(false);
    }
  }, [formId, context]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!enableAutoSave || !formId || context.isEmpty) return;

    try {
      const saveData = {
        formId,
        data: context.formData,
        savedAt: new Date().toISOString(),
        progress: context.progress
      };
      
      localStorage.setItem(`form_draft_${formId}`, JSON.stringify(saveData));
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  }, [enableAutoSave, formId, context.formData, context.isEmpty, context.progress]);

  // Enhanced field update with auto-save
  const updateFieldValue = useCallback((fieldId, value) => {
    context.updateFieldValue(fieldId, value);
    
    // Trigger field change callback
    onFieldChange?.(fieldId, value, context.formData);
    
    // Schedule auto-save
    if (enableAutoSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(autoSave, autoSaveInterval);
    }
  }, [context, onFieldChange, enableAutoSave, autoSave, autoSaveInterval]);

  // Enhanced form submission
  const submitForm = useCallback(async () => {
    if (!form || !formId) return;

    try {
      context.setSubmitting(true);
      context.clearAllErrors();

      // Validate form
      const validation = await context.validateForm(context.formData);
      if (!validation.isValid) {
        throw new Error('Please correct the errors in the form');
      }

      // Process submission data
      const submissionData = formUtils.processSubmission(
        context.formData, 
        form.fields
      );

      // Submit to Firebase
      const submissionId = await firebaseService.createSubmission(formId, submissionData);

      const result = {
        id: submissionId,
        success: true,
        submittedAt: new Date().toISOString(),
        message: form.settings?.successMessage || 'Thank you for your submission!'
      };

      setSubmissionResult(result);
      context.setSubmitted(submissionId);
      
      // Clear auto-save data
      if (enableAutoSave) {
        localStorage.removeItem(`form_draft_${formId}`);
      }

      onSubmissionComplete?.(result);
      
      return result;

    } catch (err) {
      context.setSubmissionError(err.message);
      onSubmissionError?.(err);
      throw err;
    } finally {
      context.setSubmitting(false);
    }
  }, [form, formId, context, enableAutoSave, onSubmissionComplete, onSubmissionError]);

  // Load saved draft
  const loadDraft = useCallback(() => {
    if (!enableAutoSave || !formId) return null;

    try {
      const savedData = localStorage.getItem(`form_draft_${formId}`);
      if (savedData) {
        const draft = JSON.parse(savedData);
        context.setFormData(draft.data);
        return draft;
      }
    } catch (error) {
      console.warn('Failed to load draft:', error);
    }
    
    return null;
  }, [enableAutoSave, formId, context]);

  // Clear draft
  const clearDraft = useCallback(() => {
    if (formId) {
      localStorage.removeItem(`form_draft_${formId}`);
    }
  }, [formId]);

  // Auto-save effect
  useEffect(() => {
    if (enableAutoSave && context.hasChanges) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(autoSave, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [enableAutoSave, context.hasChanges, autoSave, autoSaveInterval]);

  // Load form on mount
  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
  }, [formId, loadForm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Context state and methods
    ...context,
    
    // Enhanced state
    form,
    isLoading,
    loadError,
    submissionResult,
    
    // Enhanced methods
    loadForm,
    updateFieldValue,
    submitForm,
    loadDraft,
    clearDraft,
    clearLoadError: () => setLoadError(null)
  };
};

/**
 * Hook for multi-step form rendering
 * @param {object} form - Form configuration
 * @param {object} options - Multi-step options
 * @returns {object} Multi-step form state and methods
 */
export const useMultiStepForm = (form, options = {}) => {
  const {
    fieldsPerStep = 5,
    enableStepValidation = true,
    allowBackNavigation = true
  } = options;

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [stepErrors, setStepErrors] = useState({});

  // Calculate steps
  const steps = useMemo(() => {
    if (!form?.fields) return [];
    
    const fieldGroups = [];
    for (let i = 0; i < form.fields.length; i += fieldsPerStep) {
      fieldGroups.push(form.fields.slice(i, i + fieldsPerStep));
    }
    
    return fieldGroups.map((fields, index) => ({
      id: index,
      fields,
      title: `Step ${index + 1}`,
      isCompleted: completedSteps.has(index),
      hasErrors: Boolean(stepErrors[index])
    }));
  }, [form?.fields, fieldsPerStep, completedSteps, stepErrors]);

  // Get current step data
  const currentStepData = steps[currentStep] || null;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Navigate to next step
  const nextStep = useCallback(async (formData) => {
    if (isLastStep) return false;

    if (enableStepValidation) {
      // Validate current step fields
      // Implementation would depend on your validation service
    }

    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setCurrentStep(prev => prev + 1);
    return true;
  }, [currentStep, isLastStep, enableStepValidation]);

  // Navigate to previous step
  const previousStep = useCallback(() => {
    if (isFirstStep || !allowBackNavigation) return false;
    
    setCurrentStep(prev => prev - 1);
    return true;
  }, [isFirstStep, allowBackNavigation]);

  // Go to specific step
  const goToStep = useCallback((stepIndex) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return false;
    
    setCurrentStep(stepIndex);
    return true;
  }, [steps.length]);

  // Calculate progress
  const progress = {
    currentStep: currentStep + 1,
    totalSteps: steps.length,
    percentage: ((currentStep + 1) / steps.length) * 100,
    completedSteps: completedSteps.size,
    remainingSteps: steps.length - (currentStep + 1)
  };

  return {
    // State
    steps,
    currentStep,
    currentStepData,
    completedSteps: Array.from(completedSteps),
    stepErrors,
    progress,
    
    // Navigation state
    isFirstStep,
    isLastStep,
    canGoNext: !isLastStep,
    canGoPrevious: !isFirstStep && allowBackNavigation,
    
    // Methods
    nextStep,
    previousStep,
    goToStep,
    
    // Reset
    reset: () => {
      setCurrentStep(0);
      setCompletedSteps(new Set());
      setStepErrors({});
    }
  };
};

export default useFormRenderer;