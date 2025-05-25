// Import all individual hooks
import { 
  useDebounce, 
  useAdvancedDebounce, 
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
  useSmartDebounce,
  useBatchDebounce,
  useDebouncedState,
  useRAFDebounce,
  useDebounceWithLoading,
  useMultipleDebounce,
  useConditionalDebounce,
  useDebounceWithHistory,
  useAsyncDebounce,
  useDebounceMetrics
} from './useDebounce.js';

import {
  useDragDrop,
  useDragDropKeyboard,
  useTouchDragDrop,
  useDragDropAnalytics
} from './useDragDrop.js';

import {
  useFirebaseForm,
  useFirebaseForms,
  useFormSubmissions,
  useFormAnalytics,
  useFirebaseConnection
} from './useFirebaseForm.js';

import {
  useFormBuilder,
  useFormBuilderEnhanced,
  useFormValidation,
  useFieldManager,
  useFormPreview
} from './useFormBuilder.js';

import {
  useFormRenderer,
  useMultiStepForm
} from './useFormRenderer.js';

import {
  useFieldValidation,
  useFormValidation as useValidationFormValidation,
  useAsyncValidation,
  useValidationRules,
  useValidationMetrics
} from './useValidation.js';

import {
  useLocalStorage,
  useLocalStorageWithExpiry,
  useMultipleLocalStorage,
  useLocalStorageSync,
  useLocalStorageWithValidation,
  useLocalStorageWithSizeLimit,
  useLocalStorageWithCompression
} from './useLocalStorage.js';

// Re-export all hooks by category
export const debounceHooks = {
  useDebounce,
  useAdvancedDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
  useSmartDebounce,
  useBatchDebounce,
  useDebouncedState,
  useRAFDebounce,
  useDebounceWithLoading,
  useMultipleDebounce,
  useConditionalDebounce,
  useDebounceWithHistory,
  useAsyncDebounce,
  useDebounceMetrics
};

export const dragDropHooks = {
  useDragDrop,
  useDragDropKeyboard,
  useTouchDragDrop,
  useDragDropAnalytics
};

export const firebaseHooks = {
  useFirebaseForm,
  useFirebaseForms,
  useFormSubmissions,
  useFormAnalytics,
  useFirebaseConnection
};

export const formBuilderHooks = {
  useFormBuilder,
  useFormBuilderEnhanced,
  useFormValidation,
  useFieldManager,
  useFormPreview
};

export const formRendererHooks = {
  useFormRenderer,
  useMultiStepForm
};

export const validationHooks = {
  useFieldValidation,
  useFormValidation: useValidationFormValidation,
  useAsyncValidation,
  useValidationRules,
  useValidationMetrics
};

export const storageHooks = {
  useLocalStorage,
  useLocalStorageWithExpiry,
  useMultipleLocalStorage,
  useLocalStorageSync,
  useLocalStorageWithValidation,
  useLocalStorageWithSizeLimit,
  useLocalStorageWithCompression
};

// Re-export individual hooks
export {
  // Debounce hooks
  useDebounce,
  useAdvancedDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
  useSmartDebounce,
  useBatchDebounce,
  useDebouncedState,
  useRAFDebounce,
  useDebounceWithLoading,
  useMultipleDebounce,
  useConditionalDebounce,
  useDebounceWithHistory,
  useAsyncDebounce,
  useDebounceMetrics,
  
  // Drag & Drop hooks
  useDragDrop,
  useDragDropKeyboard,
  useTouchDragDrop,
  useDragDropAnalytics,
  
  // Firebase hooks
  useFirebaseForm,
  useFirebaseForms,
  useFormSubmissions,
  useFormAnalytics,
  useFirebaseConnection,
  
  // Form Builder hooks
  useFormBuilder,
  useFormBuilderEnhanced,
  useFormValidation,
  useFieldManager,
  useFormPreview,
  
  // Form Renderer hooks
  useFormRenderer,
  useMultiStepForm,
  
  // Validation hooks
  useFieldValidation,
  useValidationFormValidation as useFormValidationAdvanced,
  useAsyncValidation,
  useValidationRules,
  useValidationMetrics,
  
  // Storage hooks
  useLocalStorage,
  useLocalStorageWithExpiry,
  useMultipleLocalStorage,
  useLocalStorageSync,
  useLocalStorageWithValidation,
  useLocalStorageWithSizeLimit,
  useLocalStorageWithCompression
};

// Export all hooks in a single object for convenience
export const allHooks = {
  // Debounce
  ...debounceHooks,
  
  // Drag & Drop
  ...dragDropHooks,
  
  // Firebase
  ...firebaseHooks,
  
  // Form Builder
  ...formBuilderHooks,
  
  // Form Renderer
  ...formRendererHooks,
  
  // Validation
  ...validationHooks,
  
  // Storage
  ...storageHooks
};

// Hook categories for documentation and type checking
export const hookCategories = {
  DEBOUNCE: 'debounce',
  DRAG_DROP: 'dragDrop',
  FIREBASE: 'firebase',
  FORM_BUILDER: 'formBuilder',
  FORM_RENDERER: 'formRenderer',
  VALIDATION: 'validation',
  STORAGE: 'storage'
};

// Utility function to get hooks by category
export const getHooksByCategory = (category) => {
  switch (category) {
    case hookCategories.DEBOUNCE:
      return debounceHooks;
    case hookCategories.DRAG_DROP:
      return dragDropHooks;
    case hookCategories.FIREBASE:
      return firebaseHooks;
    case hookCategories.FORM_BUILDER:
      return formBuilderHooks;
    case hookCategories.FORM_RENDERER:
      return formRendererHooks;
    case hookCategories.VALIDATION:
      return validationHooks;
    case hookCategories.STORAGE:
      return storageHooks;
    default:
      return {};
  }
};

// Hook metadata for documentation
export const hookMetadata = {
  [hookCategories.DEBOUNCE]: {
    title: 'Debounce & Performance Hooks',
    description: 'Hooks for optimizing performance through debouncing, throttling, and smart timing controls',
    hooks: Object.keys(debounceHooks)
  },
  [hookCategories.DRAG_DROP]: {
    title: 'Drag & Drop Hooks',
    description: 'Comprehensive drag and drop functionality with touch support and accessibility features',
    hooks: Object.keys(dragDropHooks)
  },
  [hookCategories.FIREBASE]: {
    title: 'Firebase Integration Hooks',
    description: 'Real-time database operations, form management, and connection monitoring',
    hooks: Object.keys(firebaseHooks)
  },
  [hookCategories.FORM_BUILDER]: {
    title: 'Form Builder Hooks',
    description: 'Core form building functionality with field management and preview capabilities',
    hooks: Object.keys(formBuilderHooks)
  },
  [hookCategories.FORM_RENDERER]: {
    title: 'Form Renderer Hooks',
    description: 'Dynamic form rendering with multi-step support and submission handling',
    hooks: Object.keys(formRendererHooks)
  },
  [hookCategories.VALIDATION]: {
    title: 'Validation Hooks',
    description: 'Comprehensive form and field validation with async support and custom rules',
    hooks: Object.keys(validationHooks)
  },
  [hookCategories.STORAGE]: {
    title: 'Storage Hooks',
    description: 'Enhanced localStorage functionality with expiration, sync, and validation',
    hooks: Object.keys(storageHooks)
  }
};

// Common hook combinations for specific use cases
export const hookCombinations = {
  // For building forms
  formBuilding: [
    'useFormBuilder',
    'useFieldManager',
    'useDragDrop',
    'useDebounce',
    'useFirebaseForm'
  ],
  
  // For rendering forms
  formRendering: [
    'useFormRenderer',
    'useFieldValidation',
    'useLocalStorage',
    'useDebounce'
  ],
  
  // For multi-step forms
  multiStepForms: [
    'useMultiStepForm',
    'useFormValidation',
    'useLocalStorage',
    'useDebounceWithLoading'
  ],
  
  // For real-time collaboration
  collaboration: [
    'useFirebaseForms',
    'useFirebaseConnection',
    'useDragDrop',
    'useLocalStorageSync'
  ],
  
  // For performance-critical forms
  performance: [
    'useDebounce',
    'useThrottle',
    'useRAFDebounce',
    'useBatchDebounce',
    'useValidationMetrics'
  ]
};

// Export default as the main hook collection
export default allHooks;