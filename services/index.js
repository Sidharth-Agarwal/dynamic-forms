/**
 * Services Index
 * Exports all service modules for the Form Builder
 */

// Import all services
import firebaseService from './firebaseService.js';
import validationService from './validationService.js';
import exportService from './exportService.js';
import fileUploadService from './fileUploadService.js';
import emailService from './emailService.js';
import analyticsService from './analyticsService.js';

// Re-export individual services
export {
  firebaseService,
  validationService,
  exportService,
  fileUploadService,
  emailService,
  analyticsService
};

// Service registry for dependency injection or service locator pattern
export const serviceRegistry = {
  firebase: firebaseService,
  validation: validationService,
  export: exportService,
  fileUpload: fileUploadService,
  email: emailService,
  analytics: analyticsService
};

/**
 * Get service by name
 * @param {string} serviceName - Name of the service
 * @returns {object|null} Service instance
 */
export const getService = (serviceName) => {
  return serviceRegistry[serviceName] || null;
};

/**
 * Initialize all services
 * @param {object} config - Global configuration
 * @returns {Promise<object>} Initialization result
 */
export const initializeServices = async (config = {}) => {
  const initResults = {
    success: [],
    failed: [],
    warnings: []
  };

  try {
    // Initialize Firebase service
    if (config.firebase?.enabled !== false) {
      try {
        // Firebase is initialized in config.js, so just verify connection
        initResults.success.push('firebase');
      } catch (error) {
        initResults.failed.push({ service: 'firebase', error: error.message });
      }
    }

    // Initialize validation service
    try {
      if (config.validation?.customRules) {
        // Add custom validation rules if provided
        Object.entries(config.validation.customRules).forEach(([name, rule]) => {
          validationService.addCustomRule(name, rule);
        });
      }
      initResults.success.push('validation');
    } catch (error) {
      initResults.failed.push({ service: 'validation', error: error.message });
    }

    // Initialize export service
    try {
      if (config.export?.templates) {
        // Register custom export templates
        Object.entries(config.export.templates).forEach(([id, template]) => {
          exportService.registerTemplate(id, template);
        });
      }
      initResults.success.push('export');
    } catch (error) {
      initResults.failed.push({ service: 'export', error: error.message });
    }

    // Initialize file upload service
    try {
      if (config.fileUpload?.constraints) {
        fileUploadService.defaultConstraints = {
          ...fileUploadService.defaultConstraints,
          ...config.fileUpload.constraints
        };
      }
      initResults.success.push('fileUpload');
    } catch (error) {
      initResults.failed.push({ service: 'fileUpload', error: error.message });
    }

    // Initialize email service
    try {
      if (config.email?.defaultConfig) {
        emailService.defaultConfig = {
          ...emailService.defaultConfig,
          ...config.email.defaultConfig
        };
      }
      
      if (config.email?.templates) {
        Object.entries(config.email.templates).forEach(([id, template]) => {
          emailService.registerTemplate(id, template);
        });
      }
      initResults.success.push('email');
    } catch (error) {
      initResults.failed.push({ service: 'email', error: error.message });
    }

    // Initialize analytics service
    try {
      if (config.analytics?.cacheTimeout) {
        analyticsService.cacheTimeout = config.analytics.cacheTimeout;
      }
      initResults.success.push('analytics');
    } catch (error) {
      initResults.failed.push({ service: 'analytics', error: error.message });
    }

    return {
      success: initResults.failed.length === 0,
      initialized: initResults.success,
      failed: initResults.failed,
      warnings: initResults.warnings
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      initialized: initResults.success,
      failed: initResults.failed
    };
  }
};

/**
 * Health check for all services
 * @returns {Promise<object>} Health check result
 */
export const healthCheck = async () => {
  const healthStatus = {
    overall: 'healthy',
    services: {},
    timestamp: new Date().toISOString()
  };

  try {
    // Check Firebase service
    try {
      // Simple check - could ping Firestore or check auth state
      healthStatus.services.firebase = {
        status: 'healthy',
        latency: 0 // Could measure actual latency
      };
    } catch (error) {
      healthStatus.services.firebase = {
        status: 'unhealthy',
        error: error.message
      };
      healthStatus.overall = 'degraded';
    }

    // Check validation service
    try {
      // Test validation
      const testResult = validationService.validateField('test@example.com', {
        type: 'email',
        validation: { email: true }
      });
      
      healthStatus.services.validation = {
        status: testResult.isValid ? 'healthy' : 'degraded'
      };
    } catch (error) {
      healthStatus.services.validation = {
        status: 'unhealthy',
        error: error.message
      };
      healthStatus.overall = 'degraded';
    }

    // Check export service
    try {
      const templates = exportService.getAllTemplates();
      healthStatus.services.export = {
        status: 'healthy',
        templateCount: templates.length
      };
    } catch (error) {
      healthStatus.services.export = {
        status: 'unhealthy',
        error: error.message
      };
      healthStatus.overall = 'degraded';
    }

    // Check file upload service
    try {
      const activeUploads = fileUploadService.getActiveUploads();
      healthStatus.services.fileUpload = {
        status: 'healthy',
        activeUploads: activeUploads.length
      };
    } catch (error) {
      healthStatus.services.fileUpload = {
        status: 'unhealthy',
        error: error.message
      };
      healthStatus.overall = 'degraded';
    }

    // Check email service
    try {
      const templates = emailService.getAllTemplates();
      healthStatus.services.email = {
        status: 'healthy',
        templateCount: templates.length
      };
    } catch (error) {
      healthStatus.services.email = {
        status: 'unhealthy',
        error: error.message
      };
      healthStatus.overall = 'degraded';
    }

    // Check analytics service
    try {
      const cacheStats = analyticsService.getCacheStats();
      healthStatus.services.analytics = {
        status: 'healthy',
        cacheSize: cacheStats.size
      };
    } catch (error) {
      healthStatus.services.analytics = {
        status: 'unhealthy',
        error: error.message
      };
      healthStatus.overall = 'degraded';
    }

  } catch (error) {
    healthStatus.overall = 'unhealthy';
    healthStatus.error = error.message;
  }

  return healthStatus;
};

/**
 * Cleanup all services
 * @returns {Promise<object>} Cleanup result
 */
export const cleanup = async () => {
  const cleanupResults = {
    success: [],
    failed: []
  };

  try {
    // Cleanup validation service cache
    try {
      validationService.clearCache();
      cleanupResults.success.push('validation');
    } catch (error) {
      cleanupResults.failed.push({ service: 'validation', error: error.message });
    }

    // Cleanup export service history
    try {
      exportService.clearExportHistory({ olderThan: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) });
      cleanupResults.success.push('export');
    } catch (error) {
      cleanupResults.failed.push({ service: 'export', error: error.message });
    }

    // Cleanup file upload service
    try {
      fileUploadService.clearUploadHistory({ olderThan: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) });
      cleanupResults.success.push('fileUpload');
    } catch (error) {
      cleanupResults.failed.push({ service: 'fileUpload', error: error.message });
    }

    // Cleanup email service
    try {
      emailService.clearEmailHistory({ olderThan: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) });
      cleanupResults.success.push('email');
    } catch (error) {
      cleanupResults.failed.push({ service: 'email', error: error.message });
    }

    // Cleanup analytics service cache
    try {
      analyticsService.clearCache();
      cleanupResults.success.push('analytics');
    } catch (error) {
      cleanupResults.failed.push({ service: 'analytics', error: error.message });
    }

    return {
      success: cleanupResults.failed.length === 0,
      cleaned: cleanupResults.success,
      failed: cleanupResults.failed
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      cleaned: cleanupResults.success,
      failed: cleanupResults.failed
    };
  }
};

/**
 * Service configuration utilities
 */
export const serviceUtils = {
  /**
   * Get service configuration
   * @param {string} serviceName - Service name
   * @returns {object} Service configuration
   */
  getServiceConfig: (serviceName) => {
    const service = getService(serviceName);
    if (!service) return null;

    // Return configuration based on service type
    switch (serviceName) {
      case 'validation':
        return {
          cacheSize: service.getCacheStats().size,
          customRules: Object.keys(service.customRules || {}),
          debouncedValidators: service.debouncedValidators.size
        };

      case 'export':
        return {
          supportedFormats: Object.keys(service.EXPORT_FORMATS || {}),
          activeExports: service.activeExports.size,
          historySize: service.exportHistory.length
        };

      case 'fileUpload':
        return {
          activeUploads: service.getActiveUploads().length,
          defaultConstraints: service.defaultConstraints,
          supportedTypes: service.defaultConstraints.allowedTypes
        };

      case 'email':
        return {
          templates: service.getAllTemplates().length,
          defaultConfig: service.defaultConfig,
          historySize: service.emailHistory.length
        };

      case 'analytics':
        return {
          cacheSize: service.getCacheStats().size,
          cacheTimeout: service.cacheTimeout
        };

      default:
        return {};
    }
  },

  /**
   * Update service configuration
   * @param {string} serviceName - Service name
   * @param {object} config - New configuration
   * @returns {boolean} Success status
   */
  updateServiceConfig: (serviceName, config) => {
    const service = getService(serviceName);
    if (!service) return false;

    try {
      switch (serviceName) {
        case 'validation':
          if (config.cacheTimeout) service.cacheTimeout = config.cacheTimeout;
          break;

        case 'fileUpload':
          if (config.defaultConstraints) {
            service.defaultConstraints = { ...service.defaultConstraints, ...config.defaultConstraints };
          }
          break;

        case 'email':
          if (config.defaultConfig) {
            service.defaultConfig = { ...service.defaultConfig, ...config.defaultConfig };
          }
          break;

        case 'analytics':
          if (config.cacheTimeout) service.cacheTimeout = config.cacheTimeout;
          break;
      }

      return true;
    } catch (error) {
      console.error(`Failed to update ${serviceName} config:`, error);
      return false;
    }
  },

  /**
   * Reset service to default state
   * @param {string} serviceName - Service name
   * @returns {boolean} Success status
   */
  resetService: (serviceName) => {
    const service = getService(serviceName);
    if (!service) return false;

    try {
      switch (serviceName) {
        case 'validation':
          service.clearCache();
          service.debouncedValidators.clear();
          service.asyncValidators.clear();
          break;

        case 'export':
          service.activeExports.clear();
          service.exportHistory = [];
          break;

        case 'fileUpload':
          service.activeUploads.clear();
          service.uploadHistory = [];
          break;

        case 'email':
          service.emailHistory = [];
          break;

        case 'analytics':
          service.clearCache();
          break;
      }

      return true;
    } catch (error) {
      console.error(`Failed to reset ${serviceName}:`, error);
      return false;
    }
  }
};

/**
 * Service monitoring utilities
 */
export const serviceMonitor = {
  /**
   * Get service metrics
   * @returns {object} Service metrics
   */
  getMetrics: () => {
    const metrics = {
      timestamp: new Date().toISOString(),
      services: {}
    };

    Object.entries(serviceRegistry).forEach(([name, service]) => {
      try {
        switch (name) {
          case 'validation':
            metrics.services[name] = {
              cacheSize: service.getCacheStats().size,
              cacheHitRate: service.cacheHitRate || 0,
              validationsPerformed: service.validationCount || 0
            };
            break;

          case 'export':
            const exportStats = service.getExportStats();
            metrics.services[name] = {
              totalExports: exportStats.totalExports,
              activeExports: service.activeExports.size,
              averageFileSize: exportStats.averageFileSize
            };
            break;

          case 'fileUpload':
            const uploadStats = service.getUploadStats();
            metrics.services[name] = {
              totalUploads: uploadStats.totalUploads,
              successfulUploads: uploadStats.successfulUploads,
              activeUploads: service.getActiveUploads().length,
              totalSize: uploadStats.totalSize
            };
            break;

          case 'email':
            const emailStats = service.getEmailStats();
            metrics.services[name] = {
              totalEmails: emailStats.totalEmails,
              templates: service.getAllTemplates().length,
              recentEmails: emailStats.recentEmails.length
            };
            break;

          case 'analytics':
            metrics.services[name] = {
              cacheSize: service.getCacheStats().size,
              cacheTimeout: service.cacheTimeout
            };
            break;

          case 'firebase':
            metrics.services[name] = {
              connected: true, // Would check actual connection status
              lastActivity: new Date().toISOString()
            };
            break;
        }
      } catch (error) {
        metrics.services[name] = {
          error: error.message,
          status: 'error'
        };
      }
    });

    return metrics;
  },

  /**
   * Start monitoring services
   * @param {function} callback - Callback for metrics updates
   * @param {number} interval - Monitoring interval in milliseconds
   * @returns {function} Stop monitoring function
   */
  startMonitoring: (callback, interval = 60000) => {
    const intervalId = setInterval(() => {
      const metrics = serviceMonitor.getMetrics();
      callback(metrics);
    }, interval);

    return () => clearInterval(intervalId);
  }
};

/**
 * Service event emitter for cross-service communication
 */
class ServiceEventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to service events
   * @param {string} event - Event name
   * @param {function} callback - Event callback
   * @returns {function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event).add(callback);
    
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Emit service event
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    this.listeners.clear();
  }
}

// Create global service event emitter
export const serviceEvents = new ServiceEventEmitter();

// Default export - all services and utilities
export default {
  // Individual services
  firebaseService,
  validationService,
  exportService,
  fileUploadService,
  emailService,
  analyticsService,
  
  // Service management
  serviceRegistry,
  getService,
  initializeServices,
  healthCheck,
  cleanup,
  
  // Utilities
  serviceUtils,
  serviceMonitor,
  serviceEvents
};