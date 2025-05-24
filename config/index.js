/**
 * Main configuration entry point for Form Builder Module
 * Exports all configuration objects and utility functions
 */

// Import all configuration modules
import fieldConfig from './fieldConfig.js';
import validationConfig from './validationConfig.js';
import themeConfig from './themeConfig.js';
import exportConfig from './exportConfig.js';

// Re-export individual configurations
export * from './fieldConfig.js';
export * from './validationConfig.js';
export * from './themeConfig.js';
export * from './exportConfig.js';

// Default configuration object
export const DEFAULT_CONFIG = {
  // Form Builder Settings
  formBuilder: {
    maxFieldsPerForm: 50,
    maxFormsPerUser: 100,
    autoSaveInterval: 30000, // 30 seconds
    enableDragDrop: true,
    enablePreview: true,
    enableFieldValidation: true,
    enableFieldConditionals: false, // Future feature
    enableMultiStep: false, // Future feature
    enableTemplates: false, // Future feature
    theme: 'default'
  },

  // Form Renderer Settings
  formRenderer: {
    enableClientValidation: true,
    enableProgressBar: false,
    enableAutoSave: false,
    submitButtonText: 'Submit',
    loadingText: 'Submitting...',
    successMessage: 'Thank you for your submission!',
    errorMessage: 'There was an error submitting your form. Please try again.',
    theme: 'default',
    responsive: true
  },

  // Admin Dashboard Settings
  adminDashboard: {
    itemsPerPage: 20,
    enableExport: true,
    enableAnalytics: true,
    enableBulkActions: true,
    defaultView: 'grid', // 'grid' | 'list'
    refreshInterval: 300000, // 5 minutes
    theme: 'default'
  },

  // Validation Settings
  validation: {
    enableRealTimeValidation: true,
    showValidationMessages: true,
    validationTrigger: 'blur', // 'blur' | 'change' | 'submit'
    customValidationRules: {},
    strictMode: false
  },

  // File Upload Settings
  fileUpload: {
    enabled: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/*', 'application/pdf', '.doc', '.docx'],
    uploadPath: '/uploads/form-builder',
    enableImagePreview: true,
    enableMultipleFiles: true,
    enableDragDrop: true
  },

  // Export Settings
  export: {
    enableScheduledExports: false,
    defaultFormat: 'csv',
    includeMetadata: true,
    includeTimestamps: true,
    maxRecordsPerExport: 10000,
    enableEmailDelivery: false
  },

  // Security Settings
  security: {
    enableRateLimiting: true,
    maxSubmissionsPerHour: 100,
    enableCaptcha: false,
    enableCSRFProtection: true,
    enableXSSProtection: true,
    enableInputSanitization: true,
    requireHttps: false
  },

  // Performance Settings
  performance: {
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutes
    enableLazyLoading: true,
    enableVirtualization: false,
    debounceDelay: 300,
    enableCompression: false
  },

  // Analytics Settings
  analytics: {
    enabled: false,
    trackSubmissions: true,
    trackFieldInteractions: false,
    trackUserBehavior: false,
    provider: null, // 'google' | 'custom' | null
    customEvents: []
  },

  // Localization Settings
  localization: {
    defaultLanguage: 'en',
    supportedLanguages: ['en'],
    enableRTL: false,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h', // '12h' | '24h'
    numberFormat: 'en-US',
    currency: 'USD'
  }
};

// Environment-specific configurations
export const ENVIRONMENT_CONFIGS = {
  development: {
    ...DEFAULT_CONFIG,
    formBuilder: {
      ...DEFAULT_CONFIG.formBuilder,
      autoSaveInterval: 10000 // 10 seconds for faster testing
    },
    security: {
      ...DEFAULT_CONFIG.security,
      requireHttps: false,
      enableRateLimiting: false
    },
    performance: {
      ...DEFAULT_CONFIG.performance,
      enableCaching: false
    }
  },

  staging: {
    ...DEFAULT_CONFIG,
    security: {
      ...DEFAULT_CONFIG.security,
      enableRateLimiting: true,
      maxSubmissionsPerHour: 200
    },
    analytics: {
      ...DEFAULT_CONFIG.analytics,
      enabled: true,
      trackSubmissions: true
    }
  },

  production: {
    ...DEFAULT_CONFIG,
    security: {
      ...DEFAULT_CONFIG.security,
      requireHttps: true,
      enableRateLimiting: true,
      enableCaptcha: true,
      maxSubmissionsPerHour: 50
    },
    performance: {
      ...DEFAULT_CONFIG.performance,
      enableCaching: true,
      enableCompression: true
    },
    analytics: {
      ...DEFAULT_CONFIG.analytics,
      enabled: true,
      trackSubmissions: true,
      trackFieldInteractions: true
    }
  }
};

// Feature flags for progressive enhancement
export const FEATURE_FLAGS = {
  // Core features (always enabled)
  FORM_BUILDER: true,
  FORM_RENDERER: true,
  ADMIN_DASHBOARD: true,
  FIELD_VALIDATION: true,
  FILE_UPLOAD: true,
  BASIC_EXPORT: true,

  // Advanced features (configurable)
  DRAG_AND_DROP: true,
  REAL_TIME_VALIDATION: true,
  AUTO_SAVE: true,
  ADVANCED_EXPORT: true,
  BULK_ACTIONS: true,
  FORM_ANALYTICS: false,

  // Future features (disabled by default)
  CONDITIONAL_LOGIC: false,
  MULTI_STEP_FORMS: false,
  FORM_TEMPLATES: false,
  ADVANCED_ANALYTICS: false,
  WEBHOOKS: false,
  API_INTEGRATIONS: false,
  FORM_VERSIONING: false,
  COLLABORATION: false,
  CUSTOM_THEMES: false,
  PAYMENT_INTEGRATION: false,

  // Experimental features
  AI_FORM_GENERATION: false,
  VOICE_INPUT: false,
  OFFLINE_SUPPORT: false,
  REAL_TIME_COLLABORATION: false
};

// Configuration validation schema
export const CONFIG_SCHEMA = {
  formBuilder: {
    maxFieldsPerForm: { type: 'number', min: 1, max: 100, required: true },
    maxFormsPerUser: { type: 'number', min: 1, max: 1000, required: true },
    autoSaveInterval: { type: 'number', min: 5000, max: 300000, required: true },
    enableDragDrop: { type: 'boolean', required: true },
    theme: { type: 'string', enum: ['default', 'dark', 'minimal', 'vibrant'], required: true }
  },
  
  formRenderer: {
    enableClientValidation: { type: 'boolean', required: true },
    submitButtonText: { type: 'string', minLength: 1, maxLength: 50, required: true },
    theme: { type: 'string', enum: ['default', 'dark', 'minimal', 'vibrant'], required: true }
  },

  security: {
    maxSubmissionsPerHour: { type: 'number', min: 1, max: 10000, required: true },
    enableRateLimiting: { type: 'boolean', required: true }
  },

  fileUpload: {
    maxFileSize: { type: 'number', min: 1024, max: 100 * 1024 * 1024, required: true },
    allowedTypes: { type: 'array', required: true }
  }
};

// Configuration management utilities
export const configUtils = {
  /**
   * Validate configuration object against schema
   */
  validateConfig: (config, schema = CONFIG_SCHEMA) => {
    const errors = [];
    
    for (const [section, rules] of Object.entries(schema)) {
      if (!config[section]) {
        errors.push(`Missing configuration section: ${section}`);
        continue;
      }

      for (const [key, rule] of Object.entries(rules)) {
        const value = config[section][key];

        if (rule.required && (value === undefined || value === null)) {
          errors.push(`Missing required config: ${section}.${key}`);
          continue;
        }

        if (value !== undefined) {
          if (rule.type === 'number' && typeof value !== 'number') {
            errors.push(`Invalid type for ${section}.${key}: expected number`);
          }
          
          if (rule.type === 'string' && typeof value !== 'string') {
            errors.push(`Invalid type for ${section}.${key}: expected string`);
          }
          
          if (rule.type === 'boolean' && typeof value !== 'boolean') {
            errors.push(`Invalid type for ${section}.${key}: expected boolean`);
          }

          if (rule.min !== undefined && value < rule.min) {
            errors.push(`Value for ${section}.${key} is below minimum: ${rule.min}`);
          }

          if (rule.max !== undefined && value > rule.max) {
            errors.push(`Value for ${section}.${key} is above maximum: ${rule.max}`);
          }

          if (rule.enum && !rule.enum.includes(value)) {
            errors.push(`Invalid value for ${section}.${key}: must be one of ${rule.enum.join(', ')}`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Merge configuration objects with defaults
   */
  mergeConfig: (userConfig = {}, defaultConfig = DEFAULT_CONFIG) => {
    const merged = { ...defaultConfig };

    for (const [section, values] of Object.entries(userConfig)) {
      if (merged[section] && typeof merged[section] === 'object') {
        merged[section] = { ...merged[section], ...values };
      } else {
        merged[section] = values;
      }
    }

    return merged;
  },

  /**
   * Get configuration for specific environment
   */
  getEnvironmentConfig: (environment = 'production') => {
    return ENVIRONMENT_CONFIGS[environment] || ENVIRONMENT_CONFIGS.production;
  },

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled: (featureName) => {
    return FEATURE_FLAGS[featureName] || false;
  },

  /**
   * Get theme configuration
   */
  getThemeConfig: (themeName = 'default') => {
    return themeConfig.THEME_VARIANTS[themeName] || themeConfig.THEME_VARIANTS.default;
  },

  /**
   * Get field type configuration
   */
  getFieldTypeConfig: (fieldType) => {
    return fieldConfig.FIELD_TYPES[fieldType] || null;
  },

  /**
   * Get validation rules for field type
   */
  getValidationRules: (fieldType) => {
    return validationConfig.FIELD_VALIDATION_CONFIG[fieldType] || null;
  },

  /**
   * Get export format configuration
   */
  getExportConfig: (format) => {
    return exportConfig.EXPORT_FORMATS[format] || null;
  }
};

// Main configuration object that combines everything
export const FORM_BUILDER_CONFIG = {
  // Core configurations
  fields: fieldConfig,
  validation: validationConfig,
  theme: themeConfig,
  export: exportConfig,

  // Settings
  default: DEFAULT_CONFIG,
  environments: ENVIRONMENT_CONFIGS,
  features: FEATURE_FLAGS,
  schema: CONFIG_SCHEMA,

  // Utilities
  utils: configUtils
};

// Export default configuration
export default FORM_BUILDER_CONFIG;