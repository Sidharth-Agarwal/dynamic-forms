import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { validation, helpers, formUtils } from '../utils/index.js';

// Action types
const ACTIONS = {
  // Form loading
  SET_FORM_CONFIG: 'SET_FORM_CONFIG',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Form data
  UPDATE_FIELD_VALUE: 'UPDATE_FIELD_VALUE',
  SET_FORM_DATA: 'SET_FORM_DATA',
  RESET_FORM_DATA: 'RESET_FORM_DATA',
  
  // Validation
  SET_FIELD_ERROR: 'SET_FIELD_ERROR',
  CLEAR_FIELD_ERROR: 'CLEAR_FIELD_ERROR',
  SET_VALIDATION_ERRORS: 'SET_VALIDATION_ERRORS',
  CLEAR_ALL_ERRORS: 'CLEAR_ALL_ERRORS',
  
  // Submission
  SET_SUBMITTING: 'SET_SUBMITTING',
  SET_SUBMITTED: 'SET_SUBMITTED',
  SET_SUBMISSION_ERROR: 'SET_SUBMISSION_ERROR',
  
  // UI state
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  SET_TOUCHED_FIELDS: 'SET_TOUCHED_FIELDS',
  SET_FOCUSED_FIELD: 'SET_FOCUSED_FIELD',
  
  // Progress tracking
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  SET_COMPLETION_TIME: 'SET_COMPLETION_TIME'
};

// Initial state
const initialState = {
  // Form configuration
  formConfig: null,
  isLoading: false,
  error: null,
  
  // Form data
  formData: {},
  originalData: {},
  
  // Validation
  fieldErrors: {},
  isValid: true,
  validationMode: 'onBlur', // 'onChange', 'onBlur', 'onSubmit'
  
  // Submission
  isSubmitting: false,
  isSubmitted: false,
  submissionError: null,
  submissionId: null,
  
  // UI state
  currentStep: 0,
  touchedFields: new Set(),
  focusedField: null,
  
  // Progress tracking
  progress: {
    completedFields: 0,
    totalFields: 0,
    percentage: 0,
    startTime: null,
    completionTime: null
  }
};

// Reducer function
const formRendererReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_FORM_CONFIG:
      const config = action.payload;
      return {
        ...state,
        formConfig: config,
        progress: {
          ...state.progress,
          totalFields: config?.fields?.length || 0,
          startTime: new Date().toISOString()
        },
        error: null
      };
      
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
      
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
      
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case ACTIONS.UPDATE_FIELD_VALUE:
      const { fieldId, value } = action.payload;
      const newFormData = {
        ...state.formData,
        [fieldId]: value
      };
      
      // Calculate progress
      const completedFields = Object.values(newFormData).filter(val => 
        !helpers.isEmpty(val)
      ).length;
      
      const percentage = state.progress.totalFields > 0 
        ? (completedFields / state.progress.totalFields) * 100 
        : 0;
      
      return {
        ...state,
        formData: newFormData,
        progress: {
          ...state.progress,
          completedFields,
          percentage
        }
      };
      
    case ACTIONS.SET_FORM_DATA:
      return {
        ...state,
        formData: action.payload,
        originalData: { ...action.payload }
      };
      
    case ACTIONS.RESET_FORM_DATA:
      return {
        ...state,
        formData: { ...state.originalData },
        fieldErrors: {},
        touchedFields: new Set(),
        isValid: true
      };
      
    case ACTIONS.SET_FIELD_ERROR:
      const { fieldId: errorFieldId, error } = action.payload;
      const newFieldErrors = {
        ...state.fieldErrors,
        [errorFieldId]: error
      };
      
      return {
        ...state,
        fieldErrors: newFieldErrors,
        isValid: Object.keys(newFieldErrors).length === 0
      };
      
    case ACTIONS.CLEAR_FIELD_ERROR:
      const { [action.payload]: removed, ...remainingErrors } = state.fieldErrors;
      
      return {
        ...state,
        fieldErrors: remainingErrors,
        isValid: Object.keys(remainingErrors).length === 0
      };
      
    case ACTIONS.SET_VALIDATION_ERRORS:
      return {
        ...state,
        fieldErrors: action.payload,
        isValid: Object.keys(action.payload).length === 0
      };
      
    case ACTIONS.CLEAR_ALL_ERRORS:
      return {
        ...state,
        fieldErrors: {},
        isValid: true,
        submissionError: null,
        error: null
      };
      
    case ACTIONS.SET_SUBMITTING:
      return {
        ...state,
        isSubmitting: action.payload,
        submissionError: action.payload ? null : state.submissionError
      };
      
    case ACTIONS.SET_SUBMITTED:
      return {
        ...state,
        isSubmitted: true,
        isSubmitting: false,
        submissionId: action.payload,
        progress: {
          ...state.progress,
          completionTime: new Date().toISOString()
        }
      };
      
    case ACTIONS.SET_SUBMISSION_ERROR:
      return {
        ...state,
        submissionError: action.payload,
        isSubmitting: false
      };
      
    case ACTIONS.SET_CURRENT_STEP:
      return {
        ...state,
        currentStep: action.payload
      };
      
    case ACTIONS.SET_TOUCHED_FIELDS:
      return {
        ...state,
        touchedFields: new Set([...state.touchedFields, action.payload])
      };
      
    case ACTIONS.SET_FOCUSED_FIELD:
      return {
        ...state,
        focusedField: action.payload
      };
      
    case ACTIONS.UPDATE_PROGRESS:
      return {
        ...state,
        progress: {
          ...state.progress,
          ...action.payload
        }
      };
      
    case ACTIONS.SET_COMPLETION_TIME:
      return {
        ...state,
        progress: {
          ...state.progress,
          completionTime: action.payload
        }
      };
      
    default:
      return state;
  }
};

// Create context
const FormRendererContext = createContext();

// Provider component
export const FormRendererProvider = ({ children, config = {} }) => {
  const [state, dispatch] = useReducer(formRendererReducer, initialState);
  
  // Configuration options
  const {
    validationMode = 'onBlur',
    enableProgressTracking = true,
    enableAutoSave = false,
    autoSaveInterval = 30000,
    onSubmit = null,
    onFieldChange = null,
    onValidationError = null,
    onProgress = null
  } = config;
  
  // Auto-save effect
  useEffect(() => {
    if (!enableAutoSave || helpers.isEmpty(state.formData)) return;
    
    const autoSaveTimer = setTimeout(() => {
      // Save form data to localStorage or call API
      helpers.storage.set('formData_' + state.formConfig?.id, state.formData);
    }, autoSaveInterval);
    
    return () => clearTimeout(autoSaveTimer);
  }, [state.formData, enableAutoSave, autoSaveInterval, state.formConfig?.id]);
  
  // Progress tracking effect
  useEffect(() => {
    if (enableProgressTracking && onProgress) {
      onProgress(state.progress);
    }
  }, [state.progress, enableProgressTracking, onProgress]);
  
  // Action creators
  const actions = {
    // Form loading
    setFormConfig: useCallback((config) => {
      dispatch({ type: ACTIONS.SET_FORM_CONFIG, payload: config });
    }, []),
    
    setLoading: useCallback((loading) => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
    }, []),
    
    setError: useCallback((error) => {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error });
    }, []),
    
    clearError: useCallback(() => {
      dispatch({ type: ACTIONS.CLEAR_ERROR });
    }, []),
    
    // Form data management
    updateFieldValue: useCallback((fieldId, value) => {
      dispatch({ 
        type: ACTIONS.UPDATE_FIELD_VALUE, 
        payload: { fieldId, value } 
      });
      
      // Call onChange callback
      onFieldChange?.(fieldId, value, state.formData);
      
      // Validate field if in onChange mode
      if (validationMode === 'onChange') {
        actions.validateField(fieldId, value);
      }
    }, [onFieldChange, validationMode, state.formData]),
    
    setFormData: useCallback((data) => {
      dispatch({ type: ACTIONS.SET_FORM_DATA, payload: data });
    }, []),
    
    resetFormData: useCallback(() => {
      dispatch({ type: ACTIONS.RESET_FORM_DATA });
    }, []),
    
    // Field interaction
    touchField: useCallback((fieldId) => {
      dispatch({ type: ACTIONS.SET_TOUCHED_FIELDS, payload: fieldId });
      
      // Validate field if in onBlur mode
      if (validationMode === 'onBlur') {
        const value = state.formData[fieldId];
        actions.validateField(fieldId, value);
      }
    }, [validationMode, state.formData]),
    
    focusField: useCallback((fieldId) => {
      dispatch({ type: ACTIONS.SET_FOCUSED_FIELD, payload: fieldId });
    }, []),
    
    blurField: useCallback((fieldId) => {
      dispatch({ type: ACTIONS.SET_FOCUSED_FIELD, payload: null });
      actions.touchField(fieldId);
    }, []),
    
    // Validation
    validateField: useCallback((fieldId, value = null) => {
      if (!state.formConfig) return true;
      
      const field = state.formConfig.fields.find(f => f.id === fieldId);
      if (!field) return true;
      
      const fieldValue = value !== null ? value : state.formData[fieldId];
      const validationResult = validation.validateField(fieldValue, field, state.formData);
      
      if (validationResult.isValid) {
        dispatch({ type: ACTIONS.CLEAR_FIELD_ERROR, payload: fieldId });
      } else {
        const errorMessage = validationResult.errors[0]?.message || 'Invalid value';
        dispatch({ 
          type: ACTIONS.SET_FIELD_ERROR, 
          payload: { fieldId, error: errorMessage } 
        });
        
        onValidationError?.(fieldId, errorMessage, field);
      }
      
      return validationResult.isValid;
    }, [state.formConfig, state.formData, onValidationError]),
    
    validateForm: useCallback(() => {
      if (!state.formConfig) return false;
      
      const validationResult = validation.validateForm(state.formData, state.formConfig.fields);
      
      const errors = {};
      validationResult.errors.forEach(error => {
        if (error.fieldId) {
          errors[error.fieldId] = error.message;
        }
      });
      
      dispatch({ type: ACTIONS.SET_VALIDATION_ERRORS, payload: errors });
      
      return validationResult.isValid;
    }, [state.formConfig, state.formData]),
    
    clearFieldError: useCallback((fieldId) => {
      dispatch({ type: ACTIONS.CLEAR_FIELD_ERROR, payload: fieldId });
    }, []),
    
    clearAllErrors: useCallback(() => {
      dispatch({ type: ACTIONS.CLEAR_ALL_ERRORS });
    }, []),
    
    // Submission
    submitForm: useCallback(async () => {
      if (!onSubmit || !state.formConfig) return;
      
      try {
        dispatch({ type: ACTIONS.SET_SUBMITTING, payload: true });
        actions.clearAllErrors();
        
        // Validate form before submission
        const isValid = actions.validateForm();
        if (!isValid) {
          throw new Error('Form validation failed');
        }
        
        // Process submission data
        const submissionData = formUtils.processSubmission(state.formData, state.formConfig.fields);
        
        // Submit form
        const result = await onSubmit(submissionData);
        
        dispatch({ type: ACTIONS.SET_SUBMITTED, payload: result.id || 'success' });
        
        return result;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_SUBMISSION_ERROR, payload: error.message });
        throw error;
      } finally {
        dispatch({ type: ACTIONS.SET_SUBMITTING, payload: false });
      }
    }, [onSubmit, state.formConfig, state.formData]),
    
    // Multi-step navigation
    goToStep: useCallback((step) => {
      dispatch({ type: ACTIONS.SET_CURRENT_STEP, payload: step });
    }, []),
    
    nextStep: useCallback(() => {
      dispatch({ type: ACTIONS.SET_CURRENT_STEP, payload: state.currentStep + 1 });
    }, [state.currentStep]),
    
    previousStep: useCallback(() => {
      dispatch({ type: ACTIONS.SET_CURRENT_STEP, payload: Math.max(0, state.currentStep - 1) });
    }, [state.currentStep]),
    
    // Progress
    updateProgress: useCallback((progressData) => {
      dispatch({ type: ACTIONS.UPDATE_PROGRESS, payload: progressData });
    }, [])
  };
  
  // Computed values
  const computed = {
    // Form state
    hasChanges: JSON.stringify(state.formData) !== JSON.stringify(state.originalData),
    isEmpty: Object.keys(state.formData).length === 0,
    
    // Field states
    getFieldValue: (fieldId) => state.formData[fieldId],
    getFieldError: (fieldId) => state.fieldErrors[fieldId],
    isFieldTouched: (fieldId) => state.touchedFields.has(fieldId),
    isFieldFocused: (fieldId) => state.focusedField === fieldId,
    isFieldValid: (fieldId) => !state.fieldErrors[fieldId],
    
    // Form completion
    completionPercentage: state.progress.percentage,
    completedFieldsCount: state.progress.completedFields,
    totalFieldsCount: state.progress.totalFields,
    
    // Time tracking
    timeSpent: state.progress.startTime 
      ? Date.now() - new Date(state.progress.startTime).getTime()
      : 0,
    
    // Submission state
    canSubmit: state.isValid && !state.isSubmitting && !state.isSubmitted,
    
    // Multi-step
    isFirstStep: state.currentStep === 0,
    isLastStep: state.formConfig ? state.currentStep >= state.formConfig.steps?.length - 1 : true,
    
    // Overall status
    status: state.isSubmitted 
      ? 'submitted' 
      : state.isSubmitting 
        ? 'submitting' 
        : state.isLoading 
          ? 'loading' 
          : 'ready'
  };
  
  const value = {
    // State
    ...state,
    
    // Actions
    ...actions,
    
    // Computed values
    ...computed,
    
    // Configuration
    config: {
      validationMode,
      enableProgressTracking,
      enableAutoSave,
      autoSaveInterval
    }
  };
  
  return (
    <FormRendererContext.Provider value={value}>
      {children}
    </FormRendererContext.Provider>
  );
};

// Custom hook to use the context
export const useFormRenderer = () => {
  const context = useContext(FormRendererContext);
  
  if (!context) {
    throw new Error('useFormRenderer must be used within a FormRendererProvider');
  }
  
  return context;
};

// Export action types for testing
export { ACTIONS };

export default FormRendererContext;