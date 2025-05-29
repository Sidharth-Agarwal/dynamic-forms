// hooks/index.js

// Core utility hooks
export { 
  default as useDebounce,
  useDebouncedCallback,
  useDebouncedState,
  useDebouncedSearch
} from './useDebounce';

export {
  default as useLocalStorage,
  useLocalStorageWithExpiry,
  useFormDraft,
  useUserPreferences,
  useRecentItems
} from './useLocalStorage';

// Validation hooks
export {
  default as useFieldValidation,
  useFormValidation,
  useConditionalValidation
} from './useFieldValidation';

// File handling hooks
export {
  default as useFileUpload,
  useFileDropzone,
  useFilePreview
} from './useFileUpload';

// Drag and drop hooks
export {
  default as useDragAndDrop,
  useSortableList,
  useFieldPalette,
  useDropZone
} from './useDragAndDrop';

// Conditional logic hooks
export {
  default as useConditionalLogic,
  useFieldDependencies,
  useConditionalSections
} from './useConditionalLogic';

// Form builder hooks
export { default as useFormBuilder } from './useFormBuilder';

// Form renderer hooks
export {
  default as useFormRenderer,
  useFormSubmissionTracking
} from './useFormRenderer';

// Submissions management hooks
export {
  default as useFormSubmissions,
  useSubmissionDetails
} from './useFormSubmissions';

// Firebase integration hooks
export {
  default as useFirebaseIntegration,
  useFirestoreCollection,
  useFirestoreDocument,
  useFirebaseStorage,
  useFirebaseBatch,
  useFirebaseConnection
} from './useFirebaseIntegration';