/**
 * Application-wide constants for the Form Builder module
 */

// Firebase Collection Names
export const COLLECTIONS = {
  FORMS: 'formBuilderForms',
  SUBMISSIONS: 'formBuilderSubmissions',
  USERS: 'formBuilderUsers',
  TEMPLATES: 'formBuilderTemplates'
};

// Form Builder UI Constants
export const UI_CONSTANTS = {
  MAX_FIELDS_PER_FORM: 50,
  MAX_FORM_TITLE_LENGTH: 100,
  MAX_FORM_DESCRIPTION_LENGTH: 500,
  MAX_FIELD_LABEL_LENGTH: 100,
  MAX_FIELD_OPTIONS: 20,
  MIN_FIELD_OPTIONS: 2,
  
  // Drag and Drop
  DRAG_TYPES: {
    FIELD_TYPE: 'fieldType',
    CANVAS_FIELD: 'canvasField',
    FIELD_GROUP: 'fieldGroup'
  },
  
  // Animation Durations
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  
  // Breakpoints (matching Tailwind CSS)
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536
  }
};

// Form Settings and Permissions
export const FORM_SETTINGS = {
  DEFAULT_SUCCESS_MESSAGE: 'Thank you for your submission!',
  DEFAULT_ERROR_MESSAGE: 'There was an error submitting your form. Please try again.',
  
  SUBMISSION_LIMITS: {
    DEFAULT_MAX_SUBMISSIONS: 1000,
    MAX_SUBMISSIONS_PER_USER: 10,
    MAX_SUBMISSIONS_PER_IP: 5,
    RATE_LIMIT_WINDOW: 60 * 60 * 1000 // 1 hour in milliseconds
  },
  
  FORM_STATUS: {
    DRAFT: 'draft',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived'
  },
  
  VISIBILITY: {
    PUBLIC: 'public',
    PRIVATE: 'private',
    LINK_ONLY: 'link_only'
  }
};

// Validation Constants
export const VALIDATION = {
  // Email validation regex (RFC 5322 compliant)
  EMAIL_REGEX: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  // Phone number validation (international format)
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  
  // URL validation
  URL_REGEX: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  
  // Field length limits
  FIELD_LIMITS: {
    TEXT_MIN: 1,
    TEXT_MAX: 1000,
    TEXTAREA_MIN: 1,
    TEXTAREA_MAX: 5000,
    NUMBER_MIN: -999999999,
    NUMBER_MAX: 999999999,
    FILE_SIZE_MAX: 50 * 1024 * 1024, // 50MB in bytes
    OPTIONS_MIN: 1,
    OPTIONS_MAX: 50
  },
  
  // Default validation messages
  MESSAGES: {
    REQUIRED: 'This field is required',
    EMAIL: 'Please enter a valid email address',
    PHONE: 'Please enter a valid phone number',
    URL: 'Please enter a valid URL',
    MIN_LENGTH: 'Minimum length is {min} characters',
    MAX_LENGTH: 'Maximum length is {max} characters',
    MIN_VALUE: 'Minimum value is {min}',
    MAX_VALUE: 'Maximum value is {max}',
    FILE_SIZE: 'File size must be less than {size}',
    FILE_TYPE: 'Invalid file type. Allowed types: {types}',
    MIN_SELECT: 'Please select at least {min} options',
    MAX_SELECT: 'Please select no more than {max} options'
  }
};

// File Upload Constants
export const FILE_UPLOAD = {
  // Maximum file sizes (in bytes)
  MAX_SIZE: {
    IMAGE: 10 * 1024 * 1024, // 10MB
    DOCUMENT: 25 * 1024 * 1024, // 25MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    AUDIO: 50 * 1024 * 1024, // 50MB
    DEFAULT: 10 * 1024 * 1024 // 10MB
  },
  
  // Allowed file types
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    DOCUMENTS: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ],
    VIDEOS: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
    AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    ARCHIVES: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
  },
  
  // File type categories for UI
  TYPE_CATEGORIES: {
    'Images': 'image/*',
    'Documents': '.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx',
    'Videos': 'video/*',
    'Audio': 'audio/*',
    'Archives': '.zip,.rar,.7z',
    'All Files': '*'
  }
};

// Export and Analytics Constants
export const EXPORT = {
  FORMATS: {
    CSV: 'csv',
    EXCEL: 'xlsx',
    JSON: 'json',
    PDF: 'pdf'
  },
  
  // CSV export settings
  CSV_SETTINGS: {
    DELIMITER: ',',
    QUOTE_CHAR: '"',
    ESCAPE_CHAR: '"',
    LINE_ENDING: '\n',
    INCLUDE_HEADERS: true,
    INCLUDE_METADATA: true
  },
  
  // Date formats for exports
  DATE_FORMATS: {
    FULL: 'YYYY-MM-DD HH:mm:ss',
    DATE_ONLY: 'YYYY-MM-DD',
    TIME_ONLY: 'HH:mm:ss',
    ISO: 'toISOString'
  }
};

// Analytics and Dashboard Constants
export const ANALYTICS = {
  // Time ranges for analytics
  TIME_RANGES: {
    LAST_7_DAYS: '7d',
    LAST_30_DAYS: '30d',
    LAST_90_DAYS: '90d',
    LAST_YEAR: '1y',
    ALL_TIME: 'all'
  },
  
  // Chart types
  CHART_TYPES: {
    LINE: 'line',
    BAR: 'bar',
    PIE: 'pie',
    DOUGHNUT: 'doughnut',
    AREA: 'area'
  },
  
  // Metrics to track
  METRICS: {
    TOTAL_SUBMISSIONS: 'total_submissions',
    COMPLETION_RATE: 'completion_rate',
    AVERAGE_TIME: 'average_time',
    BOUNCE_RATE: 'bounce_rate',
    TOP_FIELDS: 'top_fields',
    SUBMISSION_TRENDS: 'submission_trends'
  }
};

// Theme and Styling Constants
export const THEME = {
  // Default theme colors
  COLORS: {
    PRIMARY: '#3B82F6',
    SECONDARY: '#8B5CF6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#06B6D4'
  },
  
  // Component sizes
  SIZES: {
    XS: 'xs',
    SM: 'sm',
    MD: 'md',
    LG: 'lg',
    XL: 'xl'
  },
  
  // Border radius options
  RADIUS: {
    NONE: '0',
    SM: '0.125rem',
    DEFAULT: '0.25rem',
    MD: '0.375rem',
    LG: '0.5rem',
    XL: '0.75rem',
    FULL: '9999px'
  }
};

// Error Messages and Status Codes
export const ERRORS = {
  // Firebase errors
  FIREBASE: {
    PERMISSION_DENIED: 'permission-denied',
    NOT_FOUND: 'not-found',
    ALREADY_EXISTS: 'already-exists',
    RESOURCE_EXHAUSTED: 'resource-exhausted',
    UNAUTHENTICATED: 'unauthenticated'
  },
  
  // Form validation errors
  FORM: {
    INVALID_FIELD_TYPE: 'INVALID_FIELD_TYPE',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
    INVALID_FIELD_CONFIG: 'INVALID_FIELD_CONFIG',
    FORM_NOT_FOUND: 'FORM_NOT_FOUND',
    FORM_INACTIVE: 'FORM_INACTIVE',
    SUBMISSION_LIMIT_REACHED: 'SUBMISSION_LIMIT_REACHED'
  },
  
  // User-friendly error messages
  MESSAGES: {
    GENERIC: 'An unexpected error occurred. Please try again.',
    NETWORK: 'Network error. Please check your connection and try again.',
    PERMISSION: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION: 'Please check your input and try again.',
    RATE_LIMIT: 'Too many requests. Please wait a moment and try again.'
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  FORM_DRAFT: 'formBuilder_draft',
  USER_PREFERENCES: 'formBuilder_preferences',
  RECENT_FORMS: 'formBuilder_recentForms',
  THEME_SETTINGS: 'formBuilder_theme',
  AUTO_SAVE: 'formBuilder_autoSave'
};

// API Endpoints (if using custom backend)
export const API_ENDPOINTS = {
  FORMS: '/api/forms',
  SUBMISSIONS: '/api/submissions',
  UPLOAD: '/api/upload',
  EXPORT: '/api/export',
  ANALYTICS: '/api/analytics'
};

// Feature Flags
export const FEATURES = {
  AUTO_SAVE: true,
  DRAG_AND_DROP: true,
  CONDITIONAL_LOGIC: false, // Future feature
  MULTI_STEP_FORMS: false, // Future feature
  FORM_TEMPLATES: false, // Future feature
  ADVANCED_ANALYTICS: false, // Future feature
  WEBHOOKS: false, // Future feature
  API_INTEGRATIONS: false // Future feature
};

// Performance and Optimization
export const PERFORMANCE = {
  // Debounce delays (milliseconds)
  DEBOUNCE: {
    SEARCH: 300,
    AUTO_SAVE: 1000,
    RESIZE: 100,
    SCROLL: 50
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    FORMS_PER_PAGE: 12,
    SUBMISSIONS_PER_PAGE: 25
  },
  
  // Caching
  CACHE: {
    FORM_CONFIG_TTL: 5 * 60 * 1000, // 5 minutes
    SUBMISSIONS_TTL: 2 * 60 * 1000, // 2 minutes
    USER_DATA_TTL: 10 * 60 * 1000 // 10 minutes
  }
};

export default {
  COLLECTIONS,
  UI_CONSTANTS,
  FORM_SETTINGS,
  VALIDATION,
  FILE_UPLOAD,
  EXPORT,
  ANALYTICS,
  THEME,
  ERRORS,
  STORAGE_KEYS,
  API_ENDPOINTS,
  FEATURES,
  PERFORMANCE
};