// hooks/useFormBuilder.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useFormBuilder as useFormBuilderContext } from '../context/FormBuilderContext';
import { useNotification } from '../context/NotificationContext';
import { formService } from '../services';
import { generateId, deepClone, sanitizeFieldName } from '../utils';
import { FIELD_TYPE_DEFINITIONS } from '../utils/fieldTypes';
import { useLocalStorage } from './useLocalStorage';
import { useDebouncedCallback } from './useDebounce';

/**
 * Hook for form builder functionality
 * @param {string} formId - ID of form being edited (optional for new forms)
 * @param {Object} options - Configuration options
 * @returns {Object} - Form builder state and functions
 */
export const useFormBuilder = (formId = null, options = {}) => {
  const {
    autoSave = true,
    autoSaveDelay = 2000,
    enableUndo = true,
    maxUndoSteps = 20
  } = options;

  // Context and services
  const formBuilderContext = useFormBuilderContext();
  const { showSuccess, showError, showWarning } = useNotification();

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Local storage for drafts
  const [localDraft, setLocalDraft] = useLocalStorage(`form-draft-${formId || 'new'}`, null);

  // Refs
  const currentFormRef = useRef(null);
  const lastSavedFormRef = useRef(null);

  // Get current form from context
  const currentForm = formBuilderContext.currentForm;

  // Debounced auto-save
  const [debouncedAutoSave] = useDebouncedCallback(
    async (form) => {
      if (autoSave && form && isDirty) {
        await saveForm(form, false); // Silent save
      }
    },
    autoSaveDelay,
    [autoSave, isDirty]
  );

  // Initialize form
  useEffect(() => {
    if (formId && !currentForm) {
      loadForm(formId);
    } else if (!formId && !currentForm) {
      createNewForm();
    }
  }, [formId, currentForm]);

  // Track form changes for undo/redo
  useEffect(() => {
    if (currentForm && enableUndo) {
      currentFormRef.current = currentForm;
    }
  }, [currentForm, enableUndo]);

  // Auto-save when form changes
  useEffect(() => {
    if (currentForm && isDirty && autoSave) {
      debouncedAutoSave(currentForm);
    }
  }, [currentForm, isDirty, autoSave, debouncedAutoSave]);

  // Load existing form
  const loadForm = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const form = await formService.getForm(id);
      if (form) {
        formBuilderContext.setCurrentForm(form);
        lastSavedFormRef.current = deepClone(form);
        setIsDirty(false);
        
        // Clear any existing draft
        setLocalDraft(null);
      } else {
        showError('Form not found');
      }
    } catch (error) {
      console.error('Error loading form:', error);
      showError('Failed to load form');
    } finally {
      setIsLoading(false);
    }
  }, [formBuilderContext, showError, setLocalDraft]);

  // Create new form
  const createNewForm = useCallback(() => {
    const newForm = {
      id: generateId(),
      title: 'Untitled Form',
      description: '',
      fields: [],
      settings: {
        allowAnonymous: true,
        requireLogin: false,
        showProgressBar: false,
        allowMultipleSubmissions: true,
        collectEmail: false,
        sendConfirmationEmail: false,
        redirectUrl: '',
        customCSS: '',
        theme: 'light'
      },
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    formBuilderContext.setCurrentForm(newForm);
    setIsDirty(true);
  }, [formBuilderContext]);

  // Save form
  const saveForm = useCallback(async (form = currentForm, showNotification = true) => {
    if (!form) return false;

    setIsSaving(true);
    try {
      let savedForm;
      
      if (form.id && lastSavedFormRef.current?.id === form.id) {
        // Update existing form
        savedForm = await formService.updateForm(form.id, form);
      } else {
        // Create new form
        savedForm = await formService.createForm(form);
      }

      formBuilderContext.setCurrentForm(savedForm);
      lastSavedFormRef.current = deepClone(savedForm);
      setIsDirty(false);
      
      // Clear draft
      setLocalDraft(null);

      if (showNotification) {
        showSuccess('Form saved successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving form:', error);
      if (showNotification) {
        showError('Failed to save form');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [currentForm, formBuilderContext, showSuccess, showError, setLocalDraft]);

  // Update form properties
  const updateForm = useCallback((updates) => {
    if (!currentForm) return;

    const updatedForm = {
      ...currentForm,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Add to undo stack
    if (enableUndo) {
      addToUndoStack(currentForm);
    }

    formBuilderContext.setCurrentForm(updatedForm);
    setIsDirty(true);

    // Save draft
    setLocalDraft(updatedForm);
  }, [currentForm, formBuilderContext, enableUndo, setLocalDraft]);

  // Add field to form
  const addField = useCallback((fieldType, position = -1) => {
    if (!currentForm) return;

    const fieldDefinition = FIELD_TYPE_DEFINITIONS[fieldType];
    if (!fieldDefinition) {
      showError(`Unknown field type: ${fieldType}`);
      return;
    }

    const newField = {
      id: generateId(),
      name: sanitizeFieldName(`${fieldType}_${Date.now()}`),
      type: fieldType,
      ...deepClone(fieldDefinition.defaultProps),
      validation: deepClone(fieldDefinition.defaultProps.validation || {})
    };

    const newFields = [...currentForm.fields];
    
    if (position >= 0 && position < newFields.length) {
      newFields.splice(position, 0, newField);
    } else {
      newFields.push(newField);
    }

    updateForm({ fields: newFields });
    setSelectedFieldId(newField.id);
    
    return newField;
  }, [currentForm, updateForm, showError]);

  // Update field
  const updateField = useCallback((fieldId, updates) => {
    if (!currentForm) return;

    const updatedFields = currentForm.fields.map(field => 
      field.id === fieldId 
        ? { ...field, ...updates }
        : field
    );

    updateForm({ fields: updatedFields });
  }, [currentForm, updateForm]);

  // Remove field
  const removeField = useCallback((fieldId) => {
    if (!currentForm) return;

    const updatedFields = currentForm.fields.filter(field => field.id !== fieldId);
    updateForm({ fields: updatedFields });

    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  }, [currentForm, updateForm, selectedFieldId]);

  // Duplicate field
  const duplicateField = useCallback((fieldId) => {
    if (!currentForm) return;

    const fieldIndex = currentForm.fields.findIndex(field => field.id === fieldId);
    if (fieldIndex === -1) return;

    const originalField = currentForm.fields[fieldIndex];
    const duplicatedField = {
      ...deepClone(originalField),
      id: generateId(),
      name: `${originalField.name}_copy`,
      label: `${originalField.label} (Copy)`
    };

    const newFields = [...currentForm.fields];
    newFields.splice(fieldIndex + 1, 0, duplicatedField);

    updateForm({ fields: newFields });
    setSelectedFieldId(duplicatedField.id);
    
    return duplicatedField;
  }, [currentForm, updateForm]);

  // Reorder fields
  const reorderFields = useCallback((fromIndex, toIndex) => {
    if (!currentForm || fromIndex === toIndex) return;

    const newFields = [...currentForm.fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);

    updateForm({ fields: newFields });
  }, [currentForm, updateForm]);

  // Undo/Redo functionality
  const addToUndoStack = useCallback((formState) => {
    setUndoStack(prev => {
      const newStack = [deepClone(formState), ...prev];
      return newStack.slice(0, maxUndoSteps);
    });
    setRedoStack([]); // Clear redo stack when new action is performed
  }, [maxUndoSteps]);

  const undo = useCallback(() => {
    if (undoStack.length === 0 || !currentForm) return;

    const [previousState, ...remainingUndo] = undoStack;
    
    setRedoStack(prev => [deepClone(currentForm), ...prev]);
    setUndoStack(remainingUndo);
    
    formBuilderContext.setCurrentForm(previousState);
    setIsDirty(true);
  }, [undoStack, currentForm, formBuilderContext]);

  const redo = useCallback(() => {
    if (redoStack.length === 0 || !currentForm) return;

    const [nextState, ...remainingRedo] = redoStack;
    
    setUndoStack(prev => [deepClone(currentForm), ...prev]);
    setRedoStack(remainingRedo);
    
    formBuilderContext.setCurrentForm(nextState);
    setIsDirty(true);
  }, [redoStack, currentForm, formBuilderContext]);

  // Publish form
  const publishForm = useCallback(async () => {
    if (!currentForm) return false;

    // Validate form before publishing
    const validation = validateForm();
    if (!validation.isValid) {
      showWarning(`Cannot publish form: ${validation.errors.join(', ')}`);
      return false;
    }

    try {
      const publishedForm = await formService.publishForm(currentForm.id);
      formBuilderContext.setCurrentForm(publishedForm);
      lastSavedFormRef.current = deepClone(publishedForm);
      setIsDirty(false);
      
      showSuccess('Form published successfully');
      return true;
    } catch (error) {
      console.error('Error publishing form:', error);
      showError('Failed to publish form');
      return false;
    }
  }, [currentForm, formBuilderContext, showSuccess, showError, showWarning]);

  // Validate form
  const validateForm = useCallback(() => {
    if (!currentForm) {
      return { isValid: false, errors: ['No form to validate'] };
    }

    const errors = [];

    // Check basic form properties
    if (!currentForm.title?.trim()) {
      errors.push('Form title is required');
    }

    if (currentForm.fields.length === 0) {
      errors.push('Form must have at least one field');
    }

    // Check for duplicate field names
    const fieldNames = currentForm.fields.map(field => field.name);
    const duplicateNames = fieldNames.filter((name, index) => 
      fieldNames.indexOf(name) !== index
    );

    if (duplicateNames.length > 0) {
      errors.push(`Duplicate field names: ${[...new Set(duplicateNames)].join(', ')}`);
    }

    // Validate individual fields
    currentForm.fields.forEach((field, index) => {
      if (!field.name?.trim()) {
        errors.push(`Field ${index + 1}: name is required`);
      }

      if (!field.label?.trim()) {
        errors.push(`Field ${index + 1}: label is required`);
      }

      if (!field.type) {
        errors.push(`Field ${index + 1}: type is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [currentForm]);

  // Get selected field
  const getSelectedField = useCallback(() => {
    if (!selectedFieldId || !currentForm) return null;
    return currentForm.fields.find(field => field.id === selectedFieldId);
  }, [selectedFieldId, currentForm]);

  // Preview mode toggle
  const togglePreview = useCallback(() => {
    setPreviewMode(prev => !prev);
  }, []);

  // Reset form to last saved state
  const resetForm = useCallback(() => {
    if (lastSavedFormRef.current) {
      formBuilderContext.setCurrentForm(deepClone(lastSavedFormRef.current));
      setIsDirty(false);
      setSelectedFieldId(null);
    }
  }, [formBuilderContext]);

  // Export form configuration
  const exportForm = useCallback(() => {
    if (!currentForm) return null;

    const exportData = {
      title: currentForm.title,
      description: currentForm.description,
      fields: currentForm.fields,
      settings: currentForm.settings,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    return exportData;
  }, [currentForm]);

  return {
    // State
    currentForm,
    isLoading,
    isSaving,
    isDirty,
    selectedFieldId,
    previewMode,
    
    // Form operations
    createNewForm,
    loadForm,
    saveForm,
    updateForm,
    publishForm,
    resetForm,
    validateForm,
    exportForm,
    
    // Field operations
    addField,
    updateField,
    removeField,
    duplicateField,
    reorderFields,
    getSelectedField,
    setSelectedFieldId,
    
    // UI operations
    togglePreview,
    
    // Undo/Redo
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    
    // Utilities
    validation: validateForm()
  };
};

export default useFormBuilder;