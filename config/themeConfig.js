/**
 * Theme Configuration for Form Builder Module
 * Defines colors, typography, spacing, and component styling
 */

// Base Color Palette
export const COLORS = {
  // Primary colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },

  // Secondary colors
  secondary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95'
  },

  // Status colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b'
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },

  info: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63'
  },

  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

// Field Type Color Mappings
export const FIELD_TYPE_COLORS = {
  text: {
    primary: COLORS.primary[500],
    light: COLORS.primary[50],
    border: COLORS.primary[300],
    hover: COLORS.primary[400],
    focus: COLORS.primary[500]
  },
  email: {
    primary: COLORS.success[500],
    light: COLORS.success[50],
    border: COLORS.success[300],
    hover: COLORS.success[400],
    focus: COLORS.success[500]
  },
  number: {
    primary: COLORS.secondary[500],
    light: COLORS.secondary[50],
    border: COLORS.secondary[300],
    hover: COLORS.secondary[400],
    focus: COLORS.secondary[500]
  },
  textarea: {
    primary: COLORS.warning[500],
    light: COLORS.warning[50],
    border: COLORS.warning[300],
    hover: COLORS.warning[400],
    focus: COLORS.warning[500]
  },
  select: {
    primary: COLORS.info[500],
    light: COLORS.info[50],
    border: COLORS.info[300],
    hover: COLORS.info[400],
    focus: COLORS.info[500]
  },
  radio: {
    primary: '#ec4899',
    light: '#fdf2f8',
    border: '#f9a8d4',
    hover: '#f472b6',
    focus: '#ec4899'
  },
  checkbox: {
    primary: '#14b8a6',
    light: '#f0fdfa',
    border: '#7dd3fc',
    hover: '#22d3ee',
    focus: '#14b8a6'
  },
  date: {
    primary: COLORS.error[500],
    light: COLORS.error[50],
    border: COLORS.error[300],
    hover: COLORS.error[400],
    focus: COLORS.error[500]
  },
  file: {
    primary: '#ea580c',
    light: '#fff7ed',
    border: '#fed7aa',
    hover: '#fb923c',
    focus: '#ea580c'
  }
};

// Typography Configuration
export const TYPOGRAPHY = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'Segoe UI Mono', 'monospace']
  },

  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem'   // 60px
  },

  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },

  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
};

// Spacing Configuration
export const SPACING = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  7: '1.75rem',   // 28px
  8: '2rem',      // 32px
  9: '2.25rem',   // 36px
  10: '2.5rem',   // 40px
  11: '2.75rem',  // 44px
  12: '3rem',     // 48px
  14: '3.5rem',   // 56px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  28: '7rem',     // 112px
  32: '8rem',     // 128px
  36: '9rem',     // 144px
  40: '10rem',    // 160px
  44: '11rem',    // 176px
  48: '12rem',    // 192px
  52: '13rem',    // 208px
  56: '14rem',    // 224px
  60: '15rem',    // 240px
  64: '16rem',    // 256px
  72: '18rem',    // 288px
  80: '20rem',    // 320px
  96: '24rem'     // 384px
};

// Border Radius Configuration
export const BORDER_RADIUS = {
  none: '0px',
  sm: '0.125rem',   // 2px
  default: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
};

// Shadow Configuration
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none'
};

// Component-Specific Styling
export const COMPONENT_STYLES = {
  // Form Builder Interface
  formBuilder: {
    background: COLORS.gray[50],
    containerBg: '#ffffff',
    headerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    toolboxBg: '#ffffff',
    canvasBg: '#ffffff'
  },

  // Field Toolbox
  fieldToolbox: {
    width: '280px',
    background: '#ffffff',
    borderRadius: BORDER_RADIUS.xl,
    shadow: SHADOWS.sm,
    padding: SPACING[4]
  },

  // Form Canvas
  formCanvas: {
    background: '#ffffff',
    borderRadius: BORDER_RADIUS.xl,
    shadow: SHADOWS.sm,
    padding: SPACING[6],
    minHeight: '400px'
  },

  // Field Editor
  fieldEditor: {
    background: '#ffffff',
    borderRadius: BORDER_RADIUS.xl,
    shadow: SHADOWS.sm,
    padding: SPACING[6],
    borderWidth: '1px',
    borderStyle: 'solid'
  },

  // Form Preview
  formPreview: {
    background: '#ffffff',
    borderRadius: BORDER_RADIUS.xl,
    shadow: SHADOWS.sm,
    padding: SPACING[8],
    maxWidth: '640px'
  },

  // Input Fields
  input: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: '1px',
    borderColor: COLORS.gray[300],
    padding: `${SPACING[3]} ${SPACING[4]}`,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.sans,
    backgroundColor: '#ffffff',
    focusBorderColor: COLORS.primary[500],
    focusRingColor: `rgba(59, 130, 246, 0.1)`,
    focusRingWidth: '2px'
  },

  // Buttons
  button: {
    primary: {
      backgroundColor: COLORS.primary[600],
      hoverBackgroundColor: COLORS.primary[700],
      textColor: '#ffffff',
      borderRadius: BORDER_RADIUS.lg,
      padding: `${SPACING[3]} ${SPACING[6]}`,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      shadow: SHADOWS.sm,
      transition: 'all 0.2s ease'
    },
    secondary: {
      backgroundColor: COLORS.gray[100],
      hoverBackgroundColor: COLORS.gray[200],
      textColor: COLORS.gray[700],
      borderRadius: BORDER_RADIUS.lg,
      padding: `${SPACING[3]} ${SPACING[6]}`,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      transition: 'all 0.2s ease'
    },
    danger: {
      backgroundColor: COLORS.error[600],
      hoverBackgroundColor: COLORS.error[700],
      textColor: '#ffffff',
      borderRadius: BORDER_RADIUS.lg,
      padding: `${SPACING[3]} ${SPACING[6]}`,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      shadow: SHADOWS.sm,
      transition: 'all 0.2s ease'
    },
    ghost: {
      backgroundColor: 'transparent',
      hoverBackgroundColor: COLORS.gray[100],
      textColor: COLORS.gray[600],
      hoverTextColor: COLORS.gray[900],
      borderRadius: BORDER_RADIUS.lg,
      padding: `${SPACING[2]} ${SPACING[4]}`,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      transition: 'all 0.2s ease'
    }
  },

  // Cards and Containers
  card: {
    backgroundColor: '#ffffff',
    borderRadius: BORDER_RADIUS.xl,
    shadow: SHADOWS.sm,
    borderWidth: '1px',
    borderColor: COLORS.gray[200],
    padding: SPACING[6]
  },

  // Modals and Dialogs
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: BORDER_RADIUS['2xl'],
    shadow: SHADOWS['2xl'],
    backdropColor: 'rgba(0, 0, 0, 0.5)',
    maxWidth: '32rem',
    padding: SPACING[6]
  },

  // Toast Notifications
  toast: {
    backgroundColor: '#ffffff',
    borderRadius: BORDER_RADIUS.lg,
    shadow: SHADOWS.lg,
    padding: SPACING[4],
    borderWidth: '1px',
    borderColor: COLORS.gray[200]
  }
};

// Animation Configuration
export const ANIMATIONS = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },

  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },

  // Predefined animations
  presets: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: '300ms',
      easing: 'ease-out'
    },
    slideUp: {
      from: { transform: 'translateY(10px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
      duration: '300ms',
      easing: 'ease-out'
    },
    scaleIn: {
      from: { transform: 'scale(0.95)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
      duration: '200ms',
      easing: 'ease-out'
    },
    bounce: {
      from: { transform: 'scale(1)' },
      to: { transform: 'scale(1.05)' },
      duration: '150ms',
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  }
};

// Breakpoint Configuration
export const BREAKPOINTS = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Z-Index Configuration
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  toast: 60,
  tooltip: 70
};

// Theme Variants
export const THEME_VARIANTS = {
  default: {
    name: 'Default',
    description: 'Clean and professional theme',
    colors: COLORS,
    isDark: false
  },

  dark: {
    name: 'Dark',
    description: 'Dark mode theme',
    colors: {
      ...COLORS,
      gray: {
        50: '#1f2937',
        100: '#374151',
        200: '#4b5563',
        300: '#6b7280',
        400: '#9ca3af',
        500: '#d1d5db',
        600: '#e5e7eb',
        700: '#f3f4f6',
        800: '#f9fafb',
        900: '#ffffff'
      }
    },
    isDark: true
  },

  minimal: {
    name: 'Minimal',
    description: 'Clean minimal theme with subtle colors',
    colors: {
      ...COLORS,
      primary: COLORS.gray,
      secondary: COLORS.gray
    },
    isDark: false
  },

  vibrant: {
    name: 'Vibrant',
    description: 'Colorful and energetic theme',
    colors: {
      ...COLORS,
      primary: {
        ...COLORS.primary,
        500: '#7c3aed',
        600: '#6d28d9'
      }
    },
    isDark: false
  }
};

// CSS Custom Properties Generator
export const generateCSSVariables = (theme = 'default') => {
  const selectedTheme = THEME_VARIANTS[theme];
  const colors = selectedTheme.colors;

  return {
    // Color variables
    '--color-primary-50': colors.primary[50],
    '--color-primary-100': colors.primary[100],
    '--color-primary-200': colors.primary[200],
    '--color-primary-300': colors.primary[300],
    '--color-primary-400': colors.primary[400],
    '--color-primary-500': colors.primary[500],
    '--color-primary-600': colors.primary[600],
    '--color-primary-700': colors.primary[700],
    '--color-primary-800': colors.primary[800],
    '--color-primary-900': colors.primary[900],

    '--color-gray-50': colors.gray[50],
    '--color-gray-100': colors.gray[100],
    '--color-gray-200': colors.gray[200],
    '--color-gray-300': colors.gray[300],
    '--color-gray-400': colors.gray[400],
    '--color-gray-500': colors.gray[500],
    '--color-gray-600': colors.gray[600],
    '--color-gray-700': colors.gray[700],
    '--color-gray-800': colors.gray[800],
    '--color-gray-900': colors.gray[900],

    // Typography variables
    '--font-family-sans': TYPOGRAPHY.fontFamily.sans.join(', '),
    '--font-family-mono': TYPOGRAPHY.fontFamily.mono.join(', '),

    // Spacing variables
    '--spacing-1': SPACING[1],
    '--spacing-2': SPACING[2],
    '--spacing-3': SPACING[3],
    '--spacing-4': SPACING[4],
    '--spacing-6': SPACING[6],
    '--spacing-8': SPACING[8],

    // Border radius variables
    '--border-radius-sm': BORDER_RADIUS.sm,
    '--border-radius-md': BORDER_RADIUS.md,
    '--border-radius-lg': BORDER_RADIUS.lg,
    '--border-radius-xl': BORDER_RADIUS.xl,

    // Shadow variables
    '--shadow-sm': SHADOWS.sm,
    '--shadow-md': SHADOWS.md,
    '--shadow-lg': SHADOWS.lg,

    // Animation variables
    '--animation-duration-fast': ANIMATIONS.duration.fast,
    '--animation-duration-normal': ANIMATIONS.duration.normal,
    '--animation-duration-slow': ANIMATIONS.duration.slow
  };
};

// Tailwind CSS Class Generators
export const generateTailwindClasses = () => {
  return {
    // Field type color classes
    fieldColors: Object.entries(FIELD_TYPE_COLORS).reduce((acc, [fieldType, colors]) => {
      acc[fieldType] = {
        bg: `bg-gradient-to-r from-${fieldType}-50 to-${fieldType}-100`,
        border: `border-${fieldType}-300`,
        hover: `hover:border-${fieldType}-400`,
        focus: `focus:ring-${fieldType}-500`,
        text: `text-${fieldType}-600`
      };
      return acc;
    }, {}),

    // Button classes
    buttons: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors',
      danger: 'bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors'
    },

    // Input classes
    inputs: {
      default: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
      error: 'w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all',
      success: 'w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
    },

    // Card classes
    cards: {
      default: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6',
      hover: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow',
      elevated: 'bg-white rounded-xl shadow-lg border border-gray-200 p-6'
    }
  };
};

// Theme Utility Functions
export const getThemeColor = (colorPath, theme = 'default') => {
  const parts = colorPath.split('.');
  let color = THEME_VARIANTS[theme].colors;
  
  for (const part of parts) {
    color = color[part];
    if (!color) return null;
  }
  
  return color;
};

export const getFieldTypeColor = (fieldType, variant = 'primary') => {
  return FIELD_TYPE_COLORS[fieldType]?.[variant] || FIELD_TYPE_COLORS.text[variant];
};

export const applyCSSVariables = (element, theme = 'default') => {
  const variables = generateCSSVariables(theme);
  
  Object.entries(variables).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
};

export default {
  COLORS,
  FIELD_TYPE_COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  COMPONENT_STYLES,
  ANIMATIONS,
  BREAKPOINTS,
  Z_INDEX,
  THEME_VARIANTS,
  generateCSSVariables,
  generateTailwindClasses,
  getThemeColor,
  getFieldTypeColor,
  applyCSSVariables
};