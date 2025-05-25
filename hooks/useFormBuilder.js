import { useState, useEffect, useCallback, useRef } from 'react';
import { useFormBuilder as useFormBuilderContext } from '../context/FormBuilderContext.js';
import { firebaseService } from '../services/firebaseService.js';
import { validationService } from '../services/validationService.js';
import { 
  createFieldInstance, 
  validateFieldConfig, 
  reorderFields,
  findFieldById 
} from '../utils/fieldTypes.js';
import { formUtils } from '../utils/index.js';
import { debounce } from '../utils/helpers.js';

/**
 * Custom hook for form building functionality
 * Provides state management and operations for the form builder interface
 */
export const useFormBuilder = () => {
  const context = useFormBuilderContext();
  
  if (!context) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }

  return context;
};

/**
 * Enhanced form builder hook with additional functionality
 * @param {object} options - Configuration options
 * @returns {object} Form builder state and methods
 */
export const useFormBuilderEnhanced = (options = {}) => {
  const {
    autoSave = true,
    autoSaveDelay = 2000,
    enableHistory = true,
    maxHistorySize = 50,
    onSave = null,
    onError = null
  } = options;

  const formBuilderContext = useFormBuilder();
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);

  // Debounced auto-save function
  const debouncedAutoSave = useCallback(
    debounce(async (form) => {
      if (!autoSave || !onSave) return;

      try {
        setIsAutoSaving(true);
        setSaveError(null);
        
        await onSave(form);
        setLastSaved(new Date());
      } catch (error) {
        setSaveError(error.message);
        onError?.(error);
      } finally {
        setIsAutoSaving(false);
      }
    }, autoSaveDelay),
    [autoSave, autoSaveDelay, onSave, onError]
  );

  // Auto-save effect
  useEffect(() => {
    if (formBuilderContext.hasUnsavedChanges && autoSave) {
      debouncedAutoSave(formBuilderContext.form);
    }
  }, [formBuilderContext.hasUnsavedChanges, formBuilderContext.form, debouncedAutoSave, autoSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...formBuilderContext,
    
    // Enhanced state
    isAutoSaving,
    saveError,
    lastSaved,
    
    // Enhanced methods
    clearSaveError: () => setSaveError(null),
    forceSave: async () => {
      if (onSave) {
        try {
          setIsAutoSaving(true);
          await onSave(formBuilderContext.form);
          setLastSaved(new Date());
        } catch (error) {
          setSaveError(error.message);
          throw error;
        } finally {
          setIsAutoSaving(false);
        }
      }
    }
  };
};

/**
 * Hook for Firebase form operations
 * @param {string} formId - Form ID (optional for new forms)
 * @returns {object} Firebase form operations
 */
export const useFirebaseForm = (formId = null) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load form from Firebase
  const loadForm = useCallback(async (id = formId) => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      
      const formData = await firebaseService.getForm(id);
      setForm(formData);
      
      return formData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formId]);

  // Save form to Firebase
  const saveForm = useCallback(async (formData) => {
    try {
      setSaving(true);
      setError(null);

      let savedForm;
      if (formData.id) {
        // Update existing form
        await firebaseService.updateForm(formData.id, formData);
        savedForm = { ...formData, updatedAt: new Date().toISOString() };
      } else {
        // Create new form
        const newFormId = await firebaseService.createForm(formData);
        savedForm = { ...formData, id: newFormId, createdAt: new Date().toISOString() };
      }

      setForm(savedForm);
      return savedForm;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // Delete form from Firebase
  const deleteForm = useCallback(async (id = formId) => {
    if (!id) throw new Error('Form ID is required');

    try {
      setLoading(true);
      setError(null);
      
      await firebaseService.deleteForm(id);
      setForm(null);
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formId]);

  // Load form on mount if formId provided
  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
  }, [formId, loadForm]);

  return {
    form,
    loading,
    saving,
    error,
    loadForm,
    saveForm,
    deleteForm,
    clearError: () => setError(null)
  };
};

/**
 * Hook for form validation operations
 * @param {object} options - Validation options
 * @returns {object} Validation state and methods
 */
export const useFormValidation = (options = {}) => {
  const {
    debounceDelay = 300,
    validateOnChange = false,
    validateOnBlur = true
  } = options;

  const [validationErrors, setValidationErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [touchedFields, setTouchedFields] = useState(new Set());

  // Debounced validation function
  const debouncedValidate = useCallback(
    debounce(async (fieldId, value, field, allValues) => {
      try {
        setIsValidating(true);
        
        const result = await validationService.validateField(value, field, allValues);
        
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          if (result.isValid) {
            delete newErrors[fieldId];
          } else {
            newErrors[fieldId] = result.errors[0]?.message || 'Invalid value';
          }
          return newErrors;
        });
      } catch (error) {
        console.error('Validation error:', error);
      } finally {
        setIsValidating(false);
      }
    }, debounceDelay),
    [debounceDelay]
  );

  // Validate single field
  const validateField = useCallback(async (fieldId, value, field, allValues = {}) => {
    if (validateOnChange) {
      await debouncedValidate(fieldId, value, field, allValues);
    }
  }, [debouncedValidate, validateOnChange]);

  // Validate field on blur
  const validateFieldOnBlur = useCallback(async (fieldId, value, field, allValues = {}) => {
    if (validateOnBlur) {
      setTouchedFields(prev => new Set([...prev, fieldId]));
      await debouncedValidate(fieldId, value, field, allValues);
    }
  }, [debouncedValidate, validateOnBlur]);

  // Validate entire form
  const validateForm = useCallback(async (formData, fields) => {
    try {
      setIsValidating(true);
      
      const result = await validationService.validateForm(formData, fields);
      
      const errors = {};
      result.errors.forEach(error => {
        if (error.fieldId) {
          errors[error.fieldId] = error.message;
        }
      });
      
      setValidationErrors(errors);
      return result;
    } catch (error) {
      console.error('Form validation error:', error);
      return { isValid: false, errors: [{ message: 'Validation failed' }] };
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Clear validation errors
  const clearErrors = useCallback((fieldId = null) => {
    if (fieldId) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    } else {
      setValidationErrors({});
      setTouchedFields(new Set());
    }
  }, []);

  // Get field error
  const getFieldError = useCallback((fieldId) => {
    return validationErrors[fieldId] || null;
  }, [validationErrors]);

  // Check if field is touched
  const isFieldTouched = useCallback((fieldId) => {
    return touchedFields.has(fieldId);
  }, [touchedFields]);

  // Check if field should show error
  const shouldShowError = useCallback((fieldId) => {
    return isFieldTouched(fieldId) && getFieldError(fieldId);
  }, [isFieldTouched, getFieldError]);

  return {
    validationErrors,
    isValidating,
    touchedFields: Array.from(touchedFields),
    validateField,
    validateFieldOnBlur,
    validateForm,
    clearErrors,
    getFieldError,
    isFieldTouched,
    shouldShowError
  };
};

/**
 * Hook for field management operations
 * @returns {object} Field management methods
 */
export const useFieldManager = () => {
  const { form, updateForm, addField, updateField, deleteField, reorderFields } = useFormBuilder();

  // Add field with validation
  const addFieldWithValidation = useCallback(async (fieldType, fieldData = {}) => {
    try {
      // Create field instance
      const field = createFieldInstance(fieldType, fieldData);
      
      // Validate field configuration
      const validation = validateFieldConfig(field);
      if (!validation.isValid) {
        throw new Error(`Invalid field configuration: ${validation.errors.join(', ')}`);
      }

      // Add field to form
      addField(fieldType, fieldData);
      
      return field;
    } catch (error) {
      console.error('Error adding field:', error);
      throw error;
    }
  }, [addField]);

  // Update field with validation
  const updateFieldWithValidation = useCallback(async (fieldId, updates) => {
    try {
      const currentField = findFieldById(form.fields, fieldId);
      if (!currentField) {
        throw new Error(`Field not found: ${fieldId}`);
      }

      const updatedField = { ...currentField, ...updates };
      
      // Validate updated field
      const validation = validateFieldConfig(updatedField);
      if (!validation.isValid) {
        throw new Error(`Invalid field configuration: ${validation.errors.join(', ')}`);
      }

      // Update field
      updateField(fieldId, updates);
      
      return updatedField;
    } catch (error) {
      console.error('Error updating field:', error);
      throw error;
    }
  }, [form.fields, updateField]);

  // Duplicate field
  const duplicateField = useCallback((fieldId) => {
    try {
      const sourceField = findFieldById(form.fields, fieldId);
      if (!sourceField) {
        throw new Error(`Field not found: ${fieldId}`);
      }

      // Create duplicate with new ID and modified label
      const duplicateData = {
        ...sourceField,
        label: `Copy of ${sourceField.label}`,
        order: form.fields.length
      };

      return addFieldWithValidation(sourceField.type, duplicateData);
    } catch (error) {
      console.error('Error duplicating field:', error);
      throw error;
    }
  }, [form.fields, addFieldWithValidation]);

  // Move field up in order
  const moveFieldUp = useCallback((fieldId) => {
    const fieldIndex = form.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex > 0) {
      reorderFields(fieldIndex, fieldIndex - 1);
    }
  }, [form.fields, reorderFields]);

  // Move field down in order
  const moveFieldDown = useCallback((fieldId) => {
    const fieldIndex = form.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex < form.fields.length - 1) {
      reorderFields(fieldIndex, fieldIndex + 1);
    }
  }, [form.fields, reorderFields]);

  // Get field by ID
  const getField = useCallback((fieldId) => {
    return findFieldById(form.fields, fieldId);
  }, [form.fields]);

  // Get field statistics
  const getFieldStats = useCallback(() => {
    const stats = {
      total: form.fields.length,
      byType: {},
      required: 0,
      optional: 0
    };

    form.fields.forEach(field => {
      // Count by type
      stats.byType[field.type] = (stats.byType[field.type] || 0) + 1;
      
      // Count required/optional
      if (field.required) {
        stats.required++;
      } else {
        stats.optional++;
      }
    });

    return stats;
  }, [form.fields]);

  return {
    fields: form.fields,
    addField: addFieldWithValidation,
    updateField: updateFieldWithValidation,
    deleteField,
    duplicateField,
    reorderFields,
    moveFieldUp,
    moveFieldDown,
    getField,
    getFieldStats
  };
};

/**
 * Hook for form preview functionality
 * @returns {object} Preview state and methods
 */
export const useFormPreview = () => {
  const { form, isPreviewMode, setPreviewMode } = useFormBuilder();
  const [previewData, setPreviewData] = useState({});
  const [previewErrors, setPreviewErrors] = useState({});

  // Toggle preview mode
  const togglePreview = useCallback(() => {
    setPreviewMode(!isPreviewMode);
    if (!isPreviewMode) {
      // Clear preview data when entering preview mode
      setPreviewData({});
      setPreviewErrors({});
    }
  }, [isPreviewMode, setPreviewMode]);

  // Update preview field value
  const updatePreviewField = useCallback((fieldId, value) => {
    setPreviewData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  }, []);

  // Validate preview form
  const validatePreview = useCallback(async () => {
    try {
      const result = await validationService.validateForm(previewData, form.fields);
      
      const errors = {};
      result.errors.forEach(error => {
        if (error.fieldId) {
          errors[error.fieldId] = error.message;
        }
      });
      
      setPreviewErrors(errors);
      return result;
    } catch (error) {
      console.error('Preview validation error:', error);
      return { isValid: false, errors: [] };
    }
  }, [previewData, form.fields]);

  // Reset preview
  const resetPreview = useCallback(() => {
    setPreviewData({});
    setPreviewErrors({});
  }, []);

  return {
    isPreviewMode,
    previewData,
    previewErrors,
    togglePreview,
    updatePreviewField,
    validatePreview,
    resetPreview,
    exitPreview: () => setPreviewMode(false),
    enterPreview: () => setPreviewMode(true)
  };
};

export default useFormBuilder;