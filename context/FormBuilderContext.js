import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { formUtils, helpers, fieldTypes } from '../utils/index.js';

// Action types
const ACTIONS = {
  // Form actions
  SET_FORM: 'SET_FORM',
  UPDATE_FORM: 'UPDATE_FORM',
  RESET_FORM: 'RESET_FORM',
  
  // Field actions
  ADD_FIELD: 'ADD_FIELD',
  UPDATE_FIELD: 'UPDATE_FIELD',
  DELETE_FIELD: 'DELETE_FIELD',
  REORDER_FIELDS: 'REORDER_FIELDS',
  DUPLICATE_FIELD: 'DUPLICATE_FIELD',
  
  // UI state actions
  SET_SELECTED_FIELD: 'SET_SELECTED_FIELD',
  SET_PREVIEW_MODE: 'SET_PREVIEW_MODE',
  SET_LOADING: 'SET_LOADING',
  SET_SAVING: 'SET_SAVING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Validation actions
  SET_VALIDATION_ERRORS: 'SET_VALIDATION_ERRORS',
  CLEAR_VALIDATION_ERRORS: 'CLEAR_VALIDATION_ERRORS',
  
  // History actions (undo/redo)
  PUSH_HISTORY: 'PUSH_HISTORY',
  UNDO: 'UNDO',
  REDO: 'REDO',
  
  // Auto-save actions
  SET_AUTO_SAVE_STATUS: 'SET_AUTO_SAVE_STATUS',
  UPDATE_LAST_SAVED: 'UPDATE_LAST_SAVED'
};

// Initial state
const initialState = {
  // Form data
  form: {
    id: null,
    title: '',
    description: '',
    fields: [],
    settings: {
      allowMultipleSubmissions: true,
      requireAuth: false,
      successMessage: 'Thank you for your submission!',
      isActive: true
    },
    createdAt: null,
    updatedAt: null,
    createdBy: null
  },
  
  // UI state
  selectedFieldId: null,
  isPreviewMode: false,
  isLoading: false,
  isSaving: false,
  error: null,
  
  // Validation
  validationErrors: {},
  isFormValid: true,
  
  // History for undo/redo
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,
  
  // Auto-save
  autoSaveStatus: 'idle', // 'idle', 'saving', 'saved', 'error'
  lastSaved: null,
  hasUnsavedChanges: false
};

// Reducer function
const formBuilderReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_FORM:
      return {
        ...state,
        form: action.payload,
        hasUnsavedChanges: false,
        selectedFieldId: null,
        validationErrors: {},
        error: null
      };
      
    case ACTIONS.UPDATE_FORM:
      const updatedForm = {
        ...state.form,
        ...action.payload,
        updatedAt: new Date().toISOString()
      };
      
      return {
        ...state,
        form: updatedForm,
        hasUnsavedChanges: true
      };
      
    case ACTIONS.RESET_FORM:
      return {
        ...initialState,
        form: formUtils.createForm('Untitled Form')
      };
      
    case ACTIONS.ADD_FIELD:
      const newForm = formUtils.addField(state.form, action.payload.fieldType, action.payload.fieldData);
      
      return {
        ...state,
        form: newForm,
        selectedFieldId: newForm.fields[newForm.fields.length - 1].id,
        hasUnsavedChanges: true
      };
      
    case ACTIONS.UPDATE_FIELD:
      const formWithUpdatedField = formUtils.updateField(
        state.form, 
        action.payload.fieldId, 
        action.payload.updates
      );
      
      return {
        ...state,
        form: formWithUpdatedField,
        hasUnsavedChanges: true
      };
      
    case ACTIONS.DELETE_FIELD:
      const formWithoutField = formUtils.removeField(state.form, action.payload.fieldId);
      
      return {
        ...state,
        form: formWithoutField,
        selectedFieldId: state.selectedFieldId === action.payload.fieldId ? null : state.selectedFieldId,
        hasUnsavedChanges: true
      };
      
    case ACTIONS.REORDER_FIELDS:
      const reorderedForm = formUtils.reorderFields(
        state.form, 
        action.payload.fromIndex, 
        action.payload.toIndex
      );
      
      return {
        ...state,
        form: reorderedForm,
        hasUnsavedChanges: true
      };
      
    case ACTIONS.DUPLICATE_FIELD:
      const fieldToDuplicate = fieldTypes.findFieldById(state.form.fields, action.payload.fieldId);
      if (!fieldToDuplicate) return state;
      
      const duplicatedField = fieldTypes.cloneField(fieldToDuplicate);
      const formWithDuplicate = formUtils.addField(state.form, duplicatedField.type, duplicatedField);
      
      return {
        ...state,
        form: formWithDuplicate,
        selectedFieldId: duplicatedField.id,
        hasUnsavedChanges: true
      };
      
    case ACTIONS.SET_SELECTED_FIELD:
      return {
        ...state,
        selectedFieldId: action.payload
      };
      
    case ACTIONS.SET_PREVIEW_MODE:
      return {
        ...state,
        isPreviewMode: action.payload,
        selectedFieldId: action.payload ? null : state.selectedFieldId
      };
      
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
      
    case ACTIONS.SET_SAVING:
      return {
        ...state,
        isSaving: action.payload
      };
      
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isSaving: false
      };
      
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case ACTIONS.SET_VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: action.payload,
        isFormValid: Object.keys(action.payload).length === 0
      };
      
    case ACTIONS.CLEAR_VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: {},
        isFormValid: true
      };
      
    case ACTIONS.PUSH_HISTORY:
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(action.payload);
      
      // Limit history size
      const maxHistory = 50;
      if (newHistory.length > maxHistory) {
        newHistory.shift();
      }
      
      return {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        canUndo: newHistory.length > 1,
        canRedo: false
      };
      
    case ACTIONS.UNDO:
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          ...state,
          form: state.history[newIndex],
          historyIndex: newIndex,
          canUndo: newIndex > 0,
          canRedo: true,
          hasUnsavedChanges: true
        };
      }
      return state;
      
    case ACTIONS.REDO:
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          ...state,
          form: state.history[newIndex],
          historyIndex: newIndex,
          canUndo: true,
          canRedo: newIndex < state.history.length - 1,
          hasUnsavedChanges: true
        };
      }
      return state;
      
    case ACTIONS.SET_AUTO_SAVE_STATUS:
      return {
        ...state,
        autoSaveStatus: action.payload
      };
      
    case ACTIONS.UPDATE_LAST_SAVED:
      return {
        ...state,
        lastSaved: action.payload,
        hasUnsavedChanges: false,
        autoSaveStatus: 'saved'
      };
      
    default:
      return state;
  }
};

// Create context
const FormBuilderContext = createContext();

// Provider component
export const FormBuilderProvider = ({ children, initialForm = null, config = {} }) => {
  const [state, dispatch] = useReducer(formBuilderReducer, {
    ...initialState,
    form: initialForm || formUtils.createForm('Untitled Form')
  });
  
  // Configuration options
  const {
    enableAutoSave = true,
    autoSaveInterval = 30000, // 30 seconds
    enableHistory = true,
    maxHistorySize = 50,
    onSave = null,
    onAutoSave = null,
    onError = null
  } = config;
  
  // Auto-save effect
  useEffect(() => {
    if (!enableAutoSave || !state.hasUnsavedChanges || !onAutoSave) return;
    
    const autoSaveTimer = setTimeout(async () => {
      try {
        dispatch({ type: ACTIONS.SET_AUTO_SAVE_STATUS, payload: 'saving' });
        await onAutoSave(state.form);
        dispatch({ type: ACTIONS.UPDATE_LAST_SAVED, payload: new Date().toISOString() });
      } catch (error) {
        dispatch({ type: ACTIONS.SET_AUTO_SAVE_STATUS, payload: 'error' });
        onError?.(error);
      }
    }, autoSaveInterval);
    
    return () => clearTimeout(autoSaveTimer);
  }, [state.hasUnsavedChanges, state.form, enableAutoSave, autoSaveInterval, onAutoSave, onError]);
  
  // History effect
  useEffect(() => {
    if (enableHistory && state.form.fields.length >= 0) {
      dispatch({ 
        type: ACTIONS.PUSH_HISTORY, 
        payload: helpers.deepClone(state.form) 
      });
    }
  }, [state.form.fields.length, enableHistory]);
  
  // Action creators
  const actions = {
    // Form actions
    setForm: useCallback((form) => {
      dispatch({ type: ACTIONS.SET_FORM, payload: form });
    }, []),
    
    updateForm: useCallback((updates) => {
      dispatch({ type: ACTIONS.UPDATE_FORM, payload: updates });
    }, []),
    
    resetForm: useCallback(() => {
      dispatch({ type: ACTIONS.RESET_FORM });
    }, []),
    
    // Field actions
    addField: useCallback((fieldType, fieldData = {}) => {
      dispatch({ 
        type: ACTIONS.ADD_FIELD, 
        payload: { fieldType, fieldData } 
      });
    }, []),
    
    updateField: useCallback((fieldId, updates) => {
      dispatch({ 
        type: ACTIONS.UPDATE_FIELD, 
        payload: { fieldId, updates } 
      });
    }, []),
    
    deleteField: useCallback((fieldId) => {
      dispatch({ 
        type: ACTIONS.DELETE_FIELD, 
        payload: { fieldId } 
      });
    }, []),
    
    reorderFields: useCallback((fromIndex, toIndex) => {
      dispatch({ 
        type: ACTIONS.REORDER_FIELDS, 
        payload: { fromIndex, toIndex } 
      });
    }, []),
    
    duplicateField: useCallback((fieldId) => {
      dispatch({ 
        type: ACTIONS.DUPLICATE_FIELD, 
        payload: { fieldId } 
      });
    }, []),
    
    // UI actions
    selectField: useCallback((fieldId) => {
      dispatch({ type: ACTIONS.SET_SELECTED_FIELD, payload: fieldId });
    }, []),
    
    setPreviewMode: useCallback((isPreview) => {
      dispatch({ type: ACTIONS.SET_PREVIEW_MODE, payload: isPreview });
    }, []),
    
    setLoading: useCallback((isLoading) => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: isLoading });
    }, []),
    
    setSaving: useCallback((isSaving) => {
      dispatch({ type: ACTIONS.SET_SAVING, payload: isSaving });
    }, []),
    
    setError: useCallback((error) => {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error });
      onError?.(error);
    }, [onError]),
    
    clearError: useCallback(() => {
      dispatch({ type: ACTIONS.CLEAR_ERROR });
    }, []),
    
    // Validation actions
    validateForm: useCallback(() => {
      const validation = formUtils.validateFormConfig(state.form);
      dispatch({ 
        type: ACTIONS.SET_VALIDATION_ERRORS, 
        payload: validation.errors.reduce((acc, error) => {
          acc[error.field || 'general'] = error.message;
          return acc;
        }, {})
      });
      return validation.isValid;
    }, [state.form]),
    
    clearValidationErrors: useCallback(() => {
      dispatch({ type: ACTIONS.CLEAR_VALIDATION_ERRORS });
    }, []),
    
    // History actions
    undo: useCallback(() => {
      dispatch({ type: ACTIONS.UNDO });
    }, []),
    
    redo: useCallback(() => {
      dispatch({ type: ACTIONS.REDO });
    }, []),
    
    // Save actions
    saveForm: useCallback(async () => {
      if (!onSave) return;
      
      try {
        actions.setSaving(true);
        actions.clearError();
        
        const isValid = actions.validateForm();
        if (!isValid) {
          throw new Error('Form validation failed');
        }
        
        const savedForm = await onSave(state.form);
        actions.setForm(savedForm);
        dispatch({ type: ACTIONS.UPDATE_LAST_SAVED, payload: new Date().toISOString() });
        
        return savedForm;
      } catch (error) {
        actions.setError(error);
        throw error;
      } finally {
        actions.setSaving(false);
      }
    }, [onSave, state.form])
  };
  
  // Computed values
  const computed = {
    selectedField: fieldTypes.findFieldById(state.form.fields, state.selectedFieldId),
    fieldCount: state.form.fields.length,
    formStats: fieldTypes.getFieldStatistics(state.form.fields),
    hasFields: state.form.fields.length > 0,
    autoSaveStatusText: {
      idle: '',
      saving: 'Auto-saving...',
      saved: 'Auto-saved',
      error: 'Auto-save failed'
    }[state.autoSaveStatus]
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
      enableAutoSave,
      autoSaveInterval,
      enableHistory,
      maxHistorySize
    }
  };
  
  return (
    <FormBuilderContext.Provider value={value}>
      {children}
    </FormBuilderContext.Provider>
  );
};

// Custom hook to use the context
export const useFormBuilder = () => {
  const context = useContext(FormBuilderContext);
  
  if (!context) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }
  
  return context;
};

// Export action types for testing and external use
export { ACTIONS };

export default FormBuilderContext;