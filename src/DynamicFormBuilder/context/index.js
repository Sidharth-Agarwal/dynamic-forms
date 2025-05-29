// context/FormBuilderContext.js
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  generateId, 
  generateFormId, 
  deepClone, 
  validateForm,
  formatFormData 
} from '../utils';
import { FORM_STATUS, FIELD_TYPES } from '../utils';

const FormBuilderContext = createContext();

// Action types
const FORM_BUILDER_ACTIONS = {
  // Form actions
  CREATE_FORM: 'CREATE_FORM',
  UPDATE_FORM: 'UPDATE_FORM',
  DELETE_FORM: 'DELETE_FORM',
  SET_CURRENT_FORM: 'SET_CURRENT_FORM',
  SAVE_FORM: 'SAVE_FORM',
  PUBLISH_FORM: 'PUBLISH_FORM',
  ARCHIVE_FORM: 'ARCHIVE_FORM',
  
  // Field actions
  ADD_FIELD: 'ADD_FIELD',
  UPDATE_FIELD: 'UPDATE_FIELD',
  DELETE_FIELD: 'DELETE_FIELD',
  REORDER_FIELDS: 'REORDER_FIELDS',
  DUPLICATE_FIELD: 'DUPLICATE_FIELD',
  
  // UI state actions
  SET_ACTIVE_VIEW: 'SET_ACTIVE_VIEW',
  SET_SELECTED_FIELD: 'SET_SELECTED_FIELD',
  SET_FORM_PREVIEW: 'SET_FORM_PREVIEW',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Submissions
  ADD_SUBMISSION: 'ADD_SUBMISSION',
  SET_SUBMISSIONS: 'SET_SUBMISSIONS',
  DELETE_SUBMISSION: 'DELETE_SUBMISSION',
  
  // Data management
  SET_FORMS: 'SET_FORMS',
  RESET_STATE: 'RESET_STATE'
};

// Initial state
const initialState = {
  // Forms data
  forms: [],
  currentForm: null,
  submissions: [],
  
  // UI state
  activeView: 'builder', // 'builder', 'renderer', 'admin'
  selectedField: null,
  isPreviewMode: false,
  isLoading: false,
  error: null,
  
  // Form builder state
  draggedField: null,
  isDirty: false, // Has unsaved changes
  
  // Filters and pagination
  filters: {
    status: 'all',
    dateRange: 'all',
    searchTerm: ''
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10
  }
};

// Reducer function
const formBuilderReducer = (state, action) => {
  switch (action.type) {
    case FORM_BUILDER_ACTIONS.CREATE_FORM: {
      const newForm = {
        id: generateFormId(),
        title: action.payload.title || 'Untitled Form',
        description: action.payload.description || '',
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
        status: FORM_STATUS.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: action.payload.userId || 'anonymous',
        submissionCount: 0
      };
      
      return {
        ...state,
        forms: [...state.forms, newForm],
        currentForm: newForm,
        isDirty: false
      };
    }

    case FORM_BUILDER_ACTIONS.UPDATE_FORM: {
      const updatedForm = {
        ...state.currentForm,
        ...action.payload,
        updatedAt: new Date().toISOString()
      };
      
      return {
        ...state,
        currentForm: updatedForm,
        forms: state.forms.map(form => 
          form.id === updatedForm.id ? updatedForm : form
        ),
        isDirty: true
      };
    }

    case FORM_BUILDER_ACTIONS.DELETE_FORM: {
      const formId = action.payload;
      return {
        ...state,
        forms: state.forms.filter(form => form.id !== formId),
        submissions: state.submissions.filter(sub => sub.formId !== formId),
        currentForm: state.currentForm?.id === formId ? null : state.currentForm
      };
    }

    case FORM_BUILDER_ACTIONS.SET_CURRENT_FORM: {
      return {
        ...state,
        currentForm: action.payload,
        selectedField: null,
        isDirty: false
      };
    }

    case FORM_BUILDER_ACTIONS.SAVE_FORM: {
      const savedForm = {
        ...state.currentForm,
        updatedAt: new Date().toISOString()
      };
      
      return {
        ...state,
        currentForm: savedForm,
        forms: state.forms.map(form => 
          form.id === savedForm.id ? savedForm : form
        ),
        isDirty: false
      };
    }

    case FORM_BUILDER_ACTIONS.PUBLISH_FORM: {
      const publishedForm = {
        ...state.currentForm,
        status: FORM_STATUS.PUBLISHED,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return {
        ...state,
        currentForm: publishedForm,
        forms: state.forms.map(form => 
          form.id === publishedForm.id ? publishedForm : form
        ),
        isDirty: false
      };
    }

    case FORM_BUILDER_ACTIONS.ADD_FIELD: {
      if (!state.currentForm) return state;
      
      const newField = {
        id: generateId(),
        name: action.payload.name || `field_${Date.now()}`,
        type: action.payload.type,
        label: action.payload.label || 'New Field',
        placeholder: action.payload.placeholder || '',
        required: action.payload.required || false,
        validation: action.payload.validation || {},
        options: action.payload.options || [],
        ...action.payload
      };

      const updatedForm = {
        ...state.currentForm,
        fields: [...state.currentForm.fields, newField],
        updatedAt: new Date().toISOString()
      };

      return {
        ...state,
        currentForm: updatedForm,
        selectedField: newField,
        isDirty: true
      };
    }

    case FORM_BUILDER_ACTIONS.UPDATE_FIELD: {
      if (!state.currentForm) return state;
      
      const { fieldId, updates } = action.payload;
      const updatedFields = state.currentForm.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      );

      const updatedForm = {
        ...state.currentForm,
        fields: updatedFields,
        updatedAt: new Date().toISOString()
      };

      return {
        ...state,
        currentForm: updatedForm,
        selectedField: state.selectedField?.id === fieldId 
          ? { ...state.selectedField, ...updates }
          : state.selectedField,
        isDirty: true
      };
    }

    case FORM_BUILDER_ACTIONS.DELETE_FIELD: {
      if (!state.currentForm) return state;
      
      const fieldId = action.payload;
      const updatedFields = state.currentForm.fields.filter(field => field.id !== fieldId);

      const updatedForm = {
        ...state.currentForm,
        fields: updatedFields,
        updatedAt: new Date().toISOString()
      };

      return {
        ...state,
        currentForm: updatedForm,
        selectedField: state.selectedField?.id === fieldId ? null : state.selectedField,
        isDirty: true
      };
    }

    case FORM_BUILDER_ACTIONS.REORDER_FIELDS: {
      if (!state.currentForm) return state;
      
      const { fromIndex, toIndex } = action.payload;
      const fields = [...state.currentForm.fields];
      const [movedField] = fields.splice(fromIndex, 1);
      fields.splice(toIndex, 0, movedField);

      const updatedForm = {
        ...state.currentForm,
        fields,
        updatedAt: new Date().toISOString()
      };

      return {
        ...state,
        currentForm: updatedForm,
        isDirty: true
      };
    }

    case FORM_BUILDER_ACTIONS.DUPLICATE_FIELD: {
      if (!state.currentForm) return state;
      
      const fieldId = action.payload;
      const fieldToDuplicate = state.currentForm.fields.find(field => field.id === fieldId);
      
      if (!fieldToDuplicate) return state;

      const duplicatedField = {
        ...deepClone(fieldToDuplicate),
        id: generateId(),
        name: `${fieldToDuplicate.name}_copy`,
        label: `${fieldToDuplicate.label} (Copy)`
      };

      const fieldIndex = state.currentForm.fields.findIndex(field => field.id === fieldId);
      const updatedFields = [...state.currentForm.fields];
      updatedFields.splice(fieldIndex + 1, 0, duplicatedField);

      const updatedForm = {
        ...state.currentForm,
        fields: updatedFields,
        updatedAt: new Date().toISOString()
      };

      return {
        ...state,
        currentForm: updatedForm,
        selectedField: duplicatedField,
        isDirty: true
      };
    }

    case FORM_BUILDER_ACTIONS.SET_ACTIVE_VIEW:
      return {
        ...state,
        activeView: action.payload
      };

    case FORM_BUILDER_ACTIONS.SET_SELECTED_FIELD:
      return {
        ...state,
        selectedField: action.payload
      };

    case FORM_BUILDER_ACTIONS.SET_FORM_PREVIEW:
      return {
        ...state,
        isPreviewMode: action.payload
      };

    case FORM_BUILDER_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case FORM_BUILDER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case FORM_BUILDER_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case FORM_BUILDER_ACTIONS.ADD_SUBMISSION: {
      const newSubmission = {
        id: generateId(),
        formId: action.payload.formId,
        data: action.payload.data,
        submittedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ipAddress: 'hidden', // Would be set by backend
        status: 'completed'
      };

      // Update form submission count
      const updatedForms = state.forms.map(form =>
        form.id === action.payload.formId
          ? { ...form, submissionCount: (form.submissionCount || 0) + 1 }
          : form
      );

      return {
        ...state,
        submissions: [...state.submissions, newSubmission],
        forms: updatedForms,
        currentForm: state.currentForm?.id === action.payload.formId
          ? { ...state.currentForm, submissionCount: (state.currentForm.submissionCount || 0) + 1 }
          : state.currentForm
      };
    }

    case FORM_BUILDER_ACTIONS.SET_SUBMISSIONS:
      return {
        ...state,
        submissions: action.payload
      };

    case FORM_BUILDER_ACTIONS.DELETE_SUBMISSION: {
      const submissionId = action.payload;
      const submission = state.submissions.find(sub => sub.id === submissionId);
      
      if (!submission) return state;

      // Update form submission count
      const updatedForms = state.forms.map(form =>
        form.id === submission.formId
          ? { ...form, submissionCount: Math.max((form.submissionCount || 1) - 1, 0) }
          : form
      );

      return {
        ...state,
        submissions: state.submissions.filter(sub => sub.id !== submissionId),
        forms: updatedForms,
        currentForm: state.currentForm?.id === submission.formId
          ? { ...state.currentForm, submissionCount: Math.max((state.currentForm.submissionCount || 1) - 1, 0) }
          : state.currentForm
      };
    }

    case FORM_BUILDER_ACTIONS.SET_FORMS:
      return {
        ...state,
        forms: action.payload
      };

    case FORM_BUILDER_ACTIONS.RESET_STATE:
      return {
        ...initialState,
        ...action.payload
      };

    default:
      return state;
  }
};

// Provider component
export const FormBuilderProvider = ({ children, initialData = {} }) => {
  const [state, dispatch] = useReducer(formBuilderReducer, {
    ...initialState,
    ...initialData
  });

  // Action creators
  const actions = {
    // Form actions
    createForm: useCallback((formData) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.CREATE_FORM, payload: formData });
    }, []),

    updateForm: useCallback((updates) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.UPDATE_FORM, payload: updates });
    }, []),

    deleteForm: useCallback((formId) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.DELETE_FORM, payload: formId });
    }, []),

    setCurrentForm: useCallback((form) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.SET_CURRENT_FORM, payload: form });
    }, []),

    saveForm: useCallback(() => {
      dispatch({ type: FORM_BUILDER_ACTIONS.SAVE_FORM });
    }, []),

    publishForm: useCallback(() => {
      dispatch({ type: FORM_BUILDER_ACTIONS.PUBLISH_FORM });
    }, []),

    // Field actions
    addField: useCallback((fieldData) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.ADD_FIELD, payload: fieldData });
    }, []),

    updateField: useCallback((fieldId, updates) => {
      dispatch({ 
        type: FORM_BUILDER_ACTIONS.UPDATE_FIELD, 
        payload: { fieldId, updates } 
      });
    }, []),

    deleteField: useCallback((fieldId) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.DELETE_FIELD, payload: fieldId });
    }, []),

    reorderFields: useCallback((fromIndex, toIndex) => {
      dispatch({ 
        type: FORM_BUILDER_ACTIONS.REORDER_FIELDS, 
        payload: { fromIndex, toIndex } 
      });
    }, []),

    duplicateField: useCallback((fieldId) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.DUPLICATE_FIELD, payload: fieldId });
    }, []),

    // UI actions
    setActiveView: useCallback((view) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.SET_ACTIVE_VIEW, payload: view });
    }, []),

    setSelectedField: useCallback((field) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.SET_SELECTED_FIELD, payload: field });
    }, []),

    setFormPreview: useCallback((isPreview) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.SET_FORM_PREVIEW, payload: isPreview });
    }, []),

    setLoading: useCallback((loading) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.SET_LOADING, payload: loading });
    }, []),

    setError: useCallback((error) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.SET_ERROR, payload: error });
    }, []),

    clearError: useCallback(() => {
      dispatch({ type: FORM_BUILDER_ACTIONS.CLEAR_ERROR });
    }, []),

    // Submission actions
    addSubmission: useCallback((formId, data) => {
      dispatch({ 
        type: FORM_BUILDER_ACTIONS.ADD_SUBMISSION, 
        payload: { formId, data } 
      });
    }, []),

    setSubmissions: useCallback((submissions) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.SET_SUBMISSIONS, payload: submissions });
    }, []),

    deleteSubmission: useCallback((submissionId) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.DELETE_SUBMISSION, payload: submissionId });
    }, []),

    // Data actions
    setForms: useCallback((forms) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.SET_FORMS, payload: forms });
    }, []),

    resetState: useCallback((newState = {}) => {
      dispatch({ type: FORM_BUILDER_ACTIONS.RESET_STATE, payload: newState });
    }, [])
  };

  // Computed values
  const computed = {
    // Get forms with filters applied
    getFilteredForms: useCallback(() => {
      let filtered = [...state.forms];
      
      if (state.filters.status !== 'all') {
        filtered = filtered.filter(form => form.status === state.filters.status);
      }
      
      if (state.filters.searchTerm) {
        const searchTerm = state.filters.searchTerm.toLowerCase();
        filtered = filtered.filter(form => 
          form.title.toLowerCase().includes(searchTerm) ||
          form.description.toLowerCase().includes(searchTerm)
        );
      }
      
      return filtered;
    }, [state.forms, state.filters]),

    // Get submissions for current form
    getCurrentFormSubmissions: useCallback(() => {
      if (!state.currentForm) return [];
      return state.submissions.filter(sub => sub.formId === state.currentForm.id);
    }, [state.submissions, state.currentForm]),

    // Validate current form
    validateCurrentForm: useCallback(() => {
      if (!state.currentForm) return { isValid: false, errors: ['No form selected'] };
      
      const errors = [];
      
      if (!state.currentForm.title?.trim()) {
        errors.push('Form title is required');
      }
      
      if (state.currentForm.fields.length === 0) {
        errors.push('Form must have at least one field');
      }
      
      // Check for duplicate field names
      const fieldNames = state.currentForm.fields.map(field => field.name);
      const duplicateNames = fieldNames.filter((name, index) => 
        fieldNames.indexOf(name) !== index
      );
      
      if (duplicateNames.length > 0) {
        errors.push(`Duplicate field names: ${[...new Set(duplicateNames)].join(', ')}`);
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    }, [state.currentForm]),

    // Check if form can be published
    canPublishForm: useCallback(() => {
      const validation = computed.validateCurrentForm();
      return validation.isValid && state.currentForm?.status !== FORM_STATUS.PUBLISHED;
    }, [computed.validateCurrentForm, state.currentForm])
  };

  const contextValue = {
    // State
    ...state,
    
    // Actions
    ...actions,
    
    // Computed values
    ...computed
  };

  return (
    <FormBuilderContext.Provider value={contextValue}>
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

// context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEMES = {
  light: {
    name: 'light',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      secondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#ffffff',
      surface: '#f9fafb',
      border: '#e5e7eb',
      text: '#111827',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      secondary: '#9ca3af',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#111827',
      surface: '#1f2937',
      border: '#374151',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      textMuted: '#9ca3af'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)'
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem'
    }
  }
};

export const ThemeProvider = ({ children, defaultTheme = 'light' }) => {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  const [customThemes, setCustomThemes] = useState({});

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('form-builder-theme');
    if (savedTheme && (THEMES[savedTheme] || customThemes[savedTheme])) {
      setCurrentTheme(savedTheme);
    }
  }, [customThemes]);

  // Apply theme to document root
  useEffect(() => {
    const theme = getTheme(currentTheme);
    if (theme) {
      applyThemeToRoot(theme);
    }
  }, [currentTheme, customThemes]);

  const getTheme = (themeName) => {
    return THEMES[themeName] || customThemes[themeName] || THEMES.light;
  };

  const applyThemeToRoot = (theme) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });

    // Add theme class to body
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .concat(` theme-${theme.name}`)
      .trim();
  };

  const switchTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem('form-builder-theme', themeName);
  };

  const addCustomTheme = (name, themeConfig) => {
    const customTheme = {
      name,
      ...themeConfig
    };
    
    setCustomThemes(prev => ({
      ...prev,
      [name]: customTheme
    }));
    
    // Save to localStorage
    const savedCustomThemes = JSON.parse(
      localStorage.getItem('form-builder-custom-themes') || '{}'
    );
    savedCustomThemes[name] = customTheme;
    localStorage.setItem('form-builder-custom-themes', JSON.stringify(savedCustomThemes));
  };

  const removeCustomTheme = (name) => {
    setCustomThemes(prev => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
    
    // Update localStorage
    const savedCustomThemes = JSON.parse(
      localStorage.getItem('form-builder-custom-themes') || '{}'
    );
    delete savedCustomThemes[name];
    localStorage.setItem('form-builder-custom-themes', JSON.stringify(savedCustomThemes));
    
    // Switch to default theme if current theme was removed
    if (currentTheme === name) {
      switchTheme('light');
    }
  };

  const getAvailableThemes = () => {
    return {
      ...THEMES,
      ...customThemes
    };
  };

  const contextValue = {
    currentTheme,
    theme: getTheme(currentTheme),
    availableThemes: getAvailableThemes(),
    switchTheme,
    addCustomTheme,
    removeCustomTheme,
    getTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// context/NotificationContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

const NOTIFICATION_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center'
};

export const NotificationProvider = ({ 
  children, 
  position = NOTIFICATION_POSITIONS.TOP_RIGHT,
  maxNotifications = 5,
  defaultDuration = 5000
}) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: NOTIFICATION_TYPES.INFO,
      duration: defaultDuration,
      dismissible: true,
      ...notification,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => {
      const updated = [...prev, newNotification];
      // Keep only the latest maxNotifications
      return updated.slice(-maxNotifications);
    });

    // Auto dismiss if duration is set
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, [defaultDuration, maxNotifications]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title: 'Success',
      message,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title: 'Error',
      message,
      duration: 0, // Don't auto-dismiss errors
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title: 'Warning',
      message,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title: 'Info',
      message,
      ...options
    });
  }, [addNotification]);

  // Convenience method for API errors
  const showApiError = useCallback((error, defaultMessage = 'An error occurred') => {
    const message = error?.response?.data?.message || 
                   error?.message || 
                   defaultMessage;
    
    return showError(message, {
      title: 'API Error',
      details: error?.response?.status ? `Status: ${error.response.status}` : undefined
    });
  }, [showError]);

  const contextValue = {
    notifications,
    position,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showApiError,
    NOTIFICATION_TYPES,
    NOTIFICATION_POSITIONS
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Notification component for rendering
export const NotificationContainer = () => {
  const { notifications, position, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50'
  };

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconStyles = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ⓘ'
  };

  return (
    <div className={positionClasses[position]}>
      <div className="space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out
              ${typeStyles[notification.type]}
            `}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-lg font-semibold">
                  {iconStyles[notification.type]}
                </span>
              </div>
              <div className="ml-3 flex-1">
                {notification.title && (
                  <h3 className="text-sm font-medium mb-1">
                    {notification.title}
                  </h3>
                )}
                <p className="text-sm">{notification.message}</p>
                {notification.details && (
                  <p className="text-xs mt-1 opacity-75">
                    {notification.details}
                  </p>
                )}
              </div>
              {notification.dismissible && (
                <div className="ml-4 flex-shrink-0">
                  <button
                    className="text-sm font-medium opacity-75 hover:opacity-100"
                    onClick={() => removeNotification(notification.id)}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// context/index.js - Main export file
export { FormBuilderProvider, useFormBuilder } from './FormBuilderContext';
export { ThemeProvider, useTheme } from './ThemeContext';
export { 
  NotificationProvider, 
  useNotification, 
  NotificationContainer 
} from './NotificationContext';