import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { THEME_VARIANTS, generateCSSVariables, generateTailwindClasses } from '../config/themeConfig.js';
import { helpers } from '../utils/index.js';

// Action types
const ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_DARK_MODE: 'SET_DARK_MODE',
  SET_CUSTOM_COLORS: 'SET_CUSTOM_COLORS',
  SET_FONT_SIZE: 'SET_FONT_SIZE',
  SET_FONT_FAMILY: 'SET_FONT_FAMILY',
  SET_BORDER_RADIUS: 'SET_BORDER_RADIUS',
  SET_SPACING: 'SET_SPACING',
  RESET_THEME: 'RESET_THEME',
  TOGGLE_HIGH_CONTRAST: 'TOGGLE_HIGH_CONTRAST',
  SET_REDUCED_MOTION: 'SET_REDUCED_MOTION',
  SET_SYSTEM_PREFERENCES: 'SET_SYSTEM_PREFERENCES'
};

// Initial state
const initialState = {
  // Current theme
  currentTheme: 'default',
  isDarkMode: false,
  
  // Custom theme settings
  customColors: {},
  fontSize: 'base', // 'xs', 'sm', 'base', 'lg', 'xl'
  fontFamily: 'sans',
  borderRadius: 'default',
  spacing: 'default',
  
  // Accessibility settings
  highContrast: false,
  reducedMotion: false,
  
  // System preferences
  systemPreferences: {
    prefersDarkMode: false,
    prefersReducedMotion: false,
    prefersHighContrast: false
  },
  
  // Loading state
  isLoading: false,
  
  // Applied styles
  cssVariables: {},
  tailwindClasses: {}
};

// Reducer function
const themeReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_THEME:
      const newTheme = action.payload;
      const themeConfig = THEME_VARIANTS[newTheme] || THEME_VARIANTS.default;
      
      return {
        ...state,
        currentTheme: newTheme,
        isDarkMode: themeConfig.isDark,
        cssVariables: generateCSSVariables(newTheme),
        tailwindClasses: generateTailwindClasses()
      };
      
    case ACTIONS.SET_DARK_MODE:
      const isDark = action.payload;
      const currentThemeConfig = THEME_VARIANTS[state.currentTheme];
      
      // If switching to dark mode and current theme doesn't support it, switch to dark theme
      let newThemeName = state.currentTheme;
      if (isDark && !currentThemeConfig.isDark) {
        newThemeName = 'dark';
      } else if (!isDark && currentThemeConfig.isDark) {
        newThemeName = 'default';
      }
      
      return {
        ...state,
        currentTheme: newThemeName,
        isDarkMode: isDark,
        cssVariables: generateCSSVariables(newThemeName),
        tailwindClasses: generateTailwindClasses()
      };
      
    case ACTIONS.SET_CUSTOM_COLORS:
      return {
        ...state,
        customColors: { ...state.customColors, ...action.payload }
      };
      
    case ACTIONS.SET_FONT_SIZE:
      return {
        ...state,
        fontSize: action.payload
      };
      
    case ACTIONS.SET_FONT_FAMILY:
      return {
        ...state,
        fontFamily: action.payload
      };
      
    case ACTIONS.SET_BORDER_RADIUS:
      return {
        ...state,
        borderRadius: action.payload
      };
      
    case ACTIONS.SET_SPACING:
      return {
        ...state,
        spacing: action.payload
      };
      
    case ACTIONS.RESET_THEME:
      return {
        ...initialState,
        systemPreferences: state.systemPreferences,
        cssVariables: generateCSSVariables('default'),
        tailwindClasses: generateTailwindClasses()
      };
      
    case ACTIONS.TOGGLE_HIGH_CONTRAST:
      return {
        ...state,
        highContrast: !state.highContrast
      };
      
    case ACTIONS.SET_REDUCED_MOTION:
      return {
        ...state,
        reducedMotion: action.payload
      };
      
    case ACTIONS.SET_SYSTEM_PREFERENCES:
      return {
        ...state,
        systemPreferences: { ...state.systemPreferences, ...action.payload }
      };
      
    default:
      return state;
  }
};

// Create context
const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children, config = {} }) => {
  const [state, dispatch] = useReducer(themeReducer, {
    ...initialState,
    cssVariables: generateCSSVariables('default'),
    tailwindClasses: generateTailwindClasses()
  });
  
  // Configuration options
  const {
    enableSystemPreferences = true,
    enableCustomization = true,
    persistTheme = true,
    storageKey = 'formBuilder_theme',
    autoApplyCSSVariables = true
  } = config;
  
  // Detect system preferences
  useEffect(() => {
    if (!enableSystemPreferences) return;
    
    const mediaQueries = {
      darkMode: window.matchMedia('(prefers-color-scheme: dark)'),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)')
    };
    
    const updateSystemPreferences = () => {
      dispatch({
        type: ACTIONS.SET_SYSTEM_PREFERENCES,
        payload: {
          prefersDarkMode: mediaQueries.darkMode.matches,
          prefersReducedMotion: mediaQueries.reducedMotion.matches,
          prefersHighContrast: mediaQueries.highContrast.matches
        }
      });
    };
    
    // Initial check
    updateSystemPreferences();
    
    // Listen for changes
    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updateSystemPreferences);
    });
    
    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updateSystemPreferences);
      });
    };
  }, [enableSystemPreferences]);
  
  // Auto-apply system preferences
  useEffect(() => {
    if (enableSystemPreferences) {
      if (state.systemPreferences.prefersDarkMode !== state.isDarkMode) {
        actions.setDarkMode(state.systemPreferences.prefersDarkMode);
      }
      
      if (state.systemPreferences.prefersReducedMotion !== state.reducedMotion) {
        actions.setReducedMotion(state.systemPreferences.prefersReducedMotion);
      }
      
      if (state.systemPreferences.prefersHighContrast !== state.highContrast) {
        actions.toggleHighContrast();
      }
    }
  }, [state.systemPreferences, enableSystemPreferences]);
  
  // Apply CSS variables to document
  useEffect(() => {
    if (!autoApplyCSSVariables) return;
    
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(state.cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Apply theme classes
    const themeClasses = [
      `theme-${state.currentTheme}`,
      state.isDarkMode ? 'dark' : 'light',
      `font-${state.fontFamily}`,
      `text-${state.fontSize}`,
      `radius-${state.borderRadius}`,
      `spacing-${state.spacing}`
    ];
    
    if (state.highContrast) themeClasses.push('high-contrast');
    if (state.reducedMotion) themeClasses.push('reduced-motion');
    
    // Remove old theme classes
    root.className = root.className.replace(/theme-\w+|dark|light|font-\w+|text-\w+|radius-\w+|spacing-\w+|high-contrast|reduced-motion/g, '');
    
    // Add new theme classes
    root.classList.add(...themeClasses);
    
  }, [state.cssVariables, state.currentTheme, state.isDarkMode, state.fontFamily, state.fontSize, state.borderRadius, state.spacing, state.highContrast, state.reducedMotion, autoApplyCSSVariables]);
  
  // Persist theme to storage
  useEffect(() => {
    if (!persistTheme) return;
    
    const themeData = {
      currentTheme: state.currentTheme,
      isDarkMode: state.isDarkMode,
      customColors: state.customColors,
      fontSize: state.fontSize,
      fontFamily: state.fontFamily,
      borderRadius: state.borderRadius,
      spacing: state.spacing,
      highContrast: state.highContrast,
      reducedMotion: state.reducedMotion
    };
    
    helpers.storage.set(storageKey, themeData);
  }, [
    state.currentTheme,
    state.isDarkMode, 
    state.customColors,
    state.fontSize,
    state.fontFamily,
    state.borderRadius,
    state.spacing,
    state.highContrast,
    state.reducedMotion,
    persistTheme,
    storageKey
  ]);
  
  // Load persisted theme
  useEffect(() => {
    if (!persistTheme) return;
    
    const savedTheme = helpers.storage.get(storageKey);
    if (savedTheme) {
      actions.setTheme(savedTheme.currentTheme || 'default');
      actions.setDarkMode(savedTheme.isDarkMode || false);
      actions.setCustomColors(savedTheme.customColors || {});
      actions.setFontSize(savedTheme.fontSize || 'base');
      actions.setFontFamily(savedTheme.fontFamily || 'sans');
      actions.setBorderRadius(savedTheme.borderRadius || 'default');
      actions.setSpacing(savedTheme.spacing || 'default');
      
      if (savedTheme.highContrast) {
        actions.toggleHighContrast();
      }
      
      if (savedTheme.reducedMotion) {
        actions.setReducedMotion(true);
      }
    }
  }, [persistTheme, storageKey]);
  
  // Action creators
  const actions = {
    setTheme: useCallback((themeName) => {
      dispatch({ type: ACTIONS.SET_THEME, payload: themeName });
    }, []),
    
    setDarkMode: useCallback((isDark) => {
      dispatch({ type: ACTIONS.SET_DARK_MODE, payload: isDark });
    }, []),
    
    toggleDarkMode: useCallback(() => {
      dispatch({ type: ACTIONS.SET_DARK_MODE, payload: !state.isDarkMode });
    }, [state.isDarkMode]),
    
    setCustomColors: useCallback((colors) => {
      dispatch({ type: ACTIONS.SET_CUSTOM_COLORS, payload: colors });
    }, []),
    
    setFontSize: useCallback((size) => {
      dispatch({ type: ACTIONS.SET_FONT_SIZE, payload: size });
    }, []),
    
    setFontFamily: useCallback((family) => {
      dispatch({ type: ACTIONS.SET_FONT_FAMILY, payload: family });
    }, []),
    
    setBorderRadius: useCallback((radius) => {
      dispatch({ type: ACTIONS.SET_BORDER_RADIUS, payload: radius });
    }, []),
    
    setSpacing: useCallback((spacing) => {
      dispatch({ type: ACTIONS.SET_SPACING, payload: spacing });
    }, []),
    
    resetTheme: useCallback(() => {
      dispatch({ type: ACTIONS.RESET_THEME });
    }, []),
    
    toggleHighContrast: useCallback(() => {
      dispatch({ type: ACTIONS.TOGGLE_HIGH_CONTRAST });
    }, []),
    
    setReducedMotion: useCallback((reduced) => {
      dispatch({ type: ACTIONS.SET_REDUCED_MOTION, payload: reduced });
    }, []),
    
    // Convenience methods
    applyPreset: useCallback((presetName) => {
      const presets = {
        minimal: {
          currentTheme: 'minimal',
          fontSize: 'sm',
          borderRadius: 'sm',
          spacing: 'tight'
        },
        modern: {
          currentTheme: 'default',
          fontSize: 'base',
          borderRadius: 'lg',
          spacing: 'default'
        },
        accessible: {
          currentTheme: 'default',
          fontSize: 'lg',
          borderRadius: 'md',
          spacing: 'comfortable',
          highContrast: true
        }
      };
      
      const preset = presets[presetName];
      if (preset) {
        Object.entries(preset).forEach(([key, value]) => {
          switch (key) {
            case 'currentTheme':
              actions.setTheme(value);
              break;
            case 'fontSize':
              actions.setFontSize(value);
              break;
            case 'borderRadius':
              actions.setBorderRadius(value);
              break;
            case 'spacing':
              actions.setSpacing(value);
              break;
            case 'highContrast':
              if (value) actions.toggleHighContrast();
              break;
          }
        });
      }
    }, [])
  };
  
  // Computed values
  const computed = {
    // Current theme data
    themeData: THEME_VARIANTS[state.currentTheme] || THEME_VARIANTS.default,
    
    // Available themes
    availableThemes: Object.keys(THEME_VARIANTS),
    
    // CSS utilities
    getComponentClasses: (component, variant = 'default') => {
      const baseClasses = state.tailwindClasses[component]?.[variant] || '';
      const themeClasses = state.isDarkMode ? 'dark:' : '';
      return `${baseClasses} ${themeClasses}`.trim();
    },
    
    // Color utilities
    getColor: (colorPath) => {
      const themeColors = computed.themeData.colors;
      return helpers.getNestedProperty(themeColors, colorPath) || '#000000';
    },
    
    // Responsive utilities
    getBreakpointClasses: (classes) => {
      return Object.entries(classes).map(([breakpoint, className]) => 
        breakpoint === 'base' ? className : `${breakpoint}:${className}`
      ).join(' ');
    },
    
    // Animation utilities
    getAnimationClasses: () => {
      const baseClasses = 'transition-all duration-200 ease-in-out';
      return state.reducedMotion ? '' : baseClasses;
    },
    
    // Accessibility utilities
    getAccessibilityClasses: () => {
      const classes = [];
      if (state.highContrast) classes.push('contrast-high');
      if (state.reducedMotion) classes.push('motion-reduce');
      return classes.join(' ');
    }
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
      enableSystemPreferences,
      enableCustomization,
      persistTheme,
      autoApplyCSSVariables
    }
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// Utility hooks for specific theme functions
export const useColorScheme = () => {
  const { isDarkMode, toggleDarkMode, systemPreferences } = useTheme();
  
  return {
    isDarkMode,
    toggleDarkMode,
    systemPrefersDarkMode: systemPreferences.prefersDarkMode
  };
};

export const useAccessibility = () => {
  const { 
    highContrast, 
    reducedMotion, 
    toggleHighContrast, 
    setReducedMotion,
    systemPreferences 
  } = useTheme();
  
  return {
    highContrast,
    reducedMotion,
    toggleHighContrast,
    setReducedMotion,
    systemPrefersReducedMotion: systemPreferences.prefersReducedMotion,
    systemPrefersHighContrast: systemPreferences.prefersHighContrast
  };
};

export const useThemeCustomization = () => {
  const {
    currentTheme,
    fontSize,
    fontFamily,
    borderRadius,
    spacing,
    setTheme,
    setFontSize,
    setFontFamily,
    setBorderRadius,
    setSpacing,
    resetTheme,
    applyPreset
  } = useTheme();
  
  return {
    currentTheme,
    fontSize,
    fontFamily,
    borderRadius,
    spacing,
    setTheme,
    setFontSize,
    setFontFamily,
    setBorderRadius,
    setSpacing,
    resetTheme,
    applyPreset
  };
};

// Export action types for testing
export { ACTIONS };

export default ThemeContext;