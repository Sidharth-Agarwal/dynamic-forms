/**
 * Main context exports for Form Builder Module
 * Provides centralized access to all context providers and hooks
 */

// Import all contexts and their providers/hooks
import FormBuilderContext, { 
  FormBuilderProvider, 
  useFormBuilder,
  ACTIONS as FORM_BUILDER_ACTIONS 
} from './FormBuilderContext.js';

import FormRendererContext, { 
  FormRendererProvider, 
  useFormRenderer,
  ACTIONS as FORM_RENDERER_ACTIONS 
} from './FormRendererContext.js';

// context/index.js

/**
 * Main context exports for Form Builder Module
 * Provides centralized access to all context providers and hooks
 */

// Import all contexts and their providers/hooks
import FormBuilderContext, { 
  FormBuilderProvider, 
  useFormBuilder,
  ACTIONS as FORM_BUILDER_ACTIONS 
} from './FormBuilderContext.js';

import FormRendererContext, { 
  FormRendererProvider, 
  useFormRenderer,
  ACTIONS as FORM_RENDERER_ACTIONS 
} from './FormRendererContext.js';

import AdminContext, { 
  AdminProvider, 
  useAdmin,
  useFormManagement,
  useSubmissionManagement,
  useAnalytics,
  useBulkOperations,
  ACTIONS as ADMIN_ACTIONS 
} from './AdminContext.js';

import ThemeContext, { 
  ThemeProvider, 
  useTheme,
  useColorScheme,
  useAccessibility,
  useThemeCustomization,
  ACTIONS as THEME_ACTIONS 
} from './ThemeContext.js';

// Re-export individual contexts
export {
  FormBuilderContext,
  FormRendererContext,
  AdminContext,
  ThemeContext
};

// Re-export providers
export {
  FormBuilderProvider,
  FormRendererProvider,
  AdminProvider,
  ThemeProvider
};

// Re-export hooks
export {
  useFormBuilder,
  useFormRenderer,
  useAdmin,
  useTheme
};

// Re-export specialized hooks
export {
  useFormManagement,
  useSubmissionManagement,
  useAnalytics,
  useBulkOperations,
  useColorScheme,
  useAccessibility,
  useThemeCustomization
};

// Re-export action types
export {
  FORM_BUILDER_ACTIONS,
  FORM_RENDERER_ACTIONS,
  ADMIN_ACTIONS,
  THEME_ACTIONS
};

/**
 * Combined Provider Component
 * Wraps all context providers in the correct order
 */
export const FormBuilderContextProvider = ({ 
  children, 
  formBuilderConfig = {},
  formRendererConfig = {},
  adminConfig = {},
  themeConfig = {}
}) => {
  return (
    <ThemeProvider {...themeConfig}>
      <AdminProvider {...adminConfig}>
        <FormBuilderProvider {...formBuilderConfig}>
          <FormRendererProvider {...formRendererConfig}>
            {children}
          </FormRendererProvider>
        </FormBuilderProvider>
      </AdminProvider>
    </ThemeProvider>
  );
};

/**
 * Hook to access all contexts at once
 * Useful for components that need multiple contexts
 */
export const useFormBuilderContexts = () => {
  const formBuilder = useFormBuilder();
  const formRenderer = useFormRenderer();
  const admin = useAdmin();
  const theme = useTheme();
  
  return {
    formBuilder,
    formRenderer,
    admin,
    theme
  };
};

/**
 * Context configuration utilities
 */
export const contextUtils = {
  /**
   * Create default configuration for all contexts
   */
  createDefaultConfig: () => ({
    formBuilderConfig: {
      enableAutoSave: true,
      autoSaveInterval: 30000,
      enableHistory: true,
      maxHistorySize: 50
    },
    formRendererConfig: {
      validationMode: 'onBlur',
      enableProgressTracking: true,
      enableAutoSave: false
    },
    adminConfig: {
      enableRealTimeUpdates: false,
      refreshInterval: 30000
    },
    themeConfig: {
      enableSystemPreferences: true,
      enableCustomization: true,
      persistTheme: true,
      autoApplyCSSVariables: true
    }
  }),

  /**
   * Create configuration for different app modes
   */
  createConfigForMode: (mode) => {
    const baseConfig = contextUtils.createDefaultConfig();
    
    switch (mode) {
      case 'builder':
        return {
          ...baseConfig,
          formBuilderConfig: {
            ...baseConfig.formBuilderConfig,
            enableAutoSave: true,
            enableHistory: true
          }
        };
        
      case 'renderer':
        return {
          ...baseConfig,
          formRendererConfig: {
            ...baseConfig.formRendererConfig,
            enableProgressTracking: true,
            validationMode: 'onBlur'
          }
        };
        
      case 'admin':
        return {
          ...baseConfig,
          adminConfig: {
            ...baseConfig.adminConfig,
            enableRealTimeUpdates: true
          }
        };
        
      case 'embedded':
        return {
          ...baseConfig,
          themeConfig: {
            ...baseConfig.themeConfig,
            enableSystemPreferences: false,
            enableCustomization: false
          }
        };
        
      default:
        return baseConfig;
    }
  },

  /**
   * Validate context configuration
   */
  validateConfig: (config) => {
    const errors = [];
    
    // Validate FormBuilder config
    if (config.formBuilderConfig) {
      const { autoSaveInterval, maxHistorySize } = config.formBuilderConfig;
      
      if (autoSaveInterval && (autoSaveInterval < 5000 || autoSaveInterval > 300000)) {
        errors.push('FormBuilder autoSaveInterval must be between 5000ms and 300000ms');
      }
      
      if (maxHistorySize && (maxHistorySize < 1 || maxHistorySize > 100)) {
        errors.push('FormBuilder maxHistorySize must be between 1 and 100');
      }
    }
    
    // Validate FormRenderer config
    if (config.formRendererConfig) {
      const { validationMode } = config.formRendererConfig;
      
      if (validationMode && !['onChange', 'onBlur', 'onSubmit'].includes(validationMode)) {
        errors.push('FormRenderer validationMode must be onChange, onBlur, or onSubmit');
      }
    }
    
    // Validate Admin config
    if (config.adminConfig) {
      const { refreshInterval } = config.adminConfig;
      
      if (refreshInterval && (refreshInterval < 5000 || refreshInterval > 600000)) {
        errors.push('Admin refreshInterval must be between 5000ms and 600000ms');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * HOC to provide all contexts to a component
 */
export const withFormBuilderContexts = (Component) => {
  return function WrappedComponent(props) {
    return (
      <FormBuilderContextProvider>
        <Component {...props} />
      </FormBuilderContextProvider>
    );
  };
};

/**
 * Context debugging utilities (for development)
 */
export const contextDebug = {
  /**
   * Log all context states
   */
  logAllStates: () => {
    try {
      const formBuilder = useFormBuilder();
      const formRenderer = useFormRenderer();
      const admin = useAdmin();
      const theme = useTheme();
      
      console.group('🔧 Form Builder Context States');
      console.log('📝 Form Builder:', formBuilder);
      console.log('🖥️ Form Renderer:', formRenderer);
      console.log('👨‍💼 Admin:', admin);
      console.log('🎨 Theme:', theme);
      console.groupEnd();
    } catch (error) {
      console.warn('Context debug failed - make sure you are inside a provider:', error);
    }
  },

  /**
   * Monitor context changes
   */
  createStateMonitor: (contextName) => {
    const prevState = { current: null };
    
    return (newState) => {
      if (prevState.current) {
        const changes = {};
        
        Object.keys(newState).forEach(key => {
          if (JSON.stringify(prevState.current[key]) !== JSON.stringify(newState[key])) {
            changes[key] = {
              from: prevState.current[key],
              to: newState[key]
            };
          }
        });
        
        if (Object.keys(changes).length > 0) {
          console.log(`📊 ${contextName} Context Changes:`, changes);
        }
      }
      
      prevState.current = { ...newState };
    };
  }
};

/**
 * Performance monitoring utilities
 */
export const contextPerformance = {
  /**
   * Measure context provider render time
   */
  measureProviderPerformance: (ProviderComponent, displayName) => {
    return function PerformanceWrapper(props) {
      const startTime = performance.now();
      
      React.useEffect(() => {
        const endTime = performance.now();
        console.log(`⚡ ${displayName} Provider render time: ${endTime - startTime}ms`);
      });
      
      return React.createElement(ProviderComponent, props);
    };
  },

  /**
   * Monitor hook performance
   */
  measureHookPerformance: (hook, hookName) => {
    return function PerformanceHook(...args) {
      const startTime = performance.now();
      const result = hook(...args);
      const endTime = performance.now();
      
      React.useEffect(() => {
        console.log(`🎣 ${hookName} hook execution time: ${endTime - startTime}ms`);
      });
      
      return result;
    };
  }
};

/**
 * Default export with all utilities
 */
export default {
  // Contexts
  FormBuilderContext,
  FormRendererContext,
  AdminContext,
  ThemeContext,
  
  // Providers
  FormBuilderProvider,
  FormRendererProvider,
  AdminProvider,
  ThemeProvider,
  FormBuilderContextProvider,
  
  // Hooks
  useFormBuilder,
  useFormRenderer,
  useAdmin,
  useTheme,
  useFormBuilderContexts,
  
  // Specialized hooks
  useFormManagement,
  useSubmissionManagement,
  useAnalytics,
  useBulkOperations,
  useColorScheme,
  useAccessibility,
  useThemeCustomization,
  
  // Utilities
  contextUtils,
  contextDebug,
  contextPerformance,
  
  // HOCs
  withFormBuilderContexts,
  
  // Action types
  ACTIONS: {
    FORM_BUILDER: FORM_BUILDER_ACTIONS,
    FORM_RENDERER: FORM_RENDERER_ACTIONS,
    ADMIN: ADMIN_ACTIONS,
    THEME: THEME_ACTIONS
  }
};