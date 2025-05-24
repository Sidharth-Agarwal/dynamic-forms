/**
 * Field Type Definitions
 * This configuration defines all available field types, their properties,
 * validation rules, and UI settings
 */

export const FIELD_TYPES = {
  text: {
    type: 'text',
    label: 'Text Input',
    icon: '📝',
    color: 'blue',
    category: 'input',
    description: 'Single line text input',
    defaultProps: {
      placeholder: 'Enter text here...',
      required: false,
      maxLength: 255,
      minLength: 0
    },
    validationRules: {
      supportedValidations: ['required', 'minLength', 'maxLength', 'pattern'],
      defaultValidation: {
        required: false,
        minLength: null,
        maxLength: null,
        pattern: null,
        message: ''
      }
    },
    configOptions: {
      hasPlaceholder: true,
      hasOptions: false,
      hasValidation: true,
      hasDefaultValue: true,
      supportedAttributes: ['placeholder', 'maxLength', 'minLength', 'pattern']
    }
  },

  email: {
    type: 'email',
    label: 'Email',
    icon: '📧',
    color: 'green',
    category: 'input',
    description: 'Email input with validation',
    defaultProps: {
      placeholder: 'your.email@example.com',
      required: false
    },
    validationRules: {
      supportedValidations: ['required', 'email'],
      defaultValidation: {
        required: false,
        email: true,
        message: 'Please enter a valid email address'
      }
    },
    configOptions: {
      hasPlaceholder: true,
      hasOptions: false,
      hasValidation: true,
      hasDefaultValue: true,
      supportedAttributes: ['placeholder']
    }
  },

  number: {
    type: 'number',
    label: 'Number',
    icon: '🔢',
    color: 'purple',
    category: 'input',
    description: 'Numeric input field',
    defaultProps: {
      placeholder: 'Enter a number...',
      required: false,
      min: null,
      max: null,
      step: 1
    },
    validationRules: {
      supportedValidations: ['required', 'min', 'max', 'integer'],
      defaultValidation: {
        required: false,
        min: null,
        max: null,
        integer: false,
        message: ''
      }
    },
    configOptions: {
      hasPlaceholder: true,
      hasOptions: false,
      hasValidation: true,
      hasDefaultValue: true,
      supportedAttributes: ['placeholder', 'min', 'max', 'step']
    }
  },

  textarea: {
    type: 'textarea',
    label: 'Textarea',
    icon: '📄',
    color: 'yellow',
    category: 'input',
    description: 'Multi-line text input',
    defaultProps: {
      placeholder: 'Enter your message here...',
      required: false,
      rows: 4,
      maxLength: 1000,
      minLength: 0
    },
    validationRules: {
      supportedValidations: ['required', 'minLength', 'maxLength'],
      defaultValidation: {
        required: false,
        minLength: null,
        maxLength: null,
        message: ''
      }
    },
    configOptions: {
      hasPlaceholder: true,
      hasOptions: false,
      hasValidation: true,
      hasDefaultValue: true,
      supportedAttributes: ['placeholder', 'rows', 'maxLength', 'minLength']
    }
  },

  select: {
    type: 'select',
    label: 'Dropdown',
    icon: '📋',
    color: 'indigo',
    category: 'choice',
    description: 'Dropdown selection',
    defaultProps: {
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
      placeholder: 'Select an option...'
    },
    validationRules: {
      supportedValidations: ['required'],
      defaultValidation: {
        required: false,
        message: 'Please select an option'
      }
    },
    configOptions: {
      hasPlaceholder: true,
      hasOptions: true,
      hasValidation: true,
      hasDefaultValue: true,
      supportedAttributes: ['options', 'placeholder'],
      optionsConfig: {
        allowOther: true,
        allowMultiple: false,
        sortable: true
      }
    }
  },

  radio: {
    type: 'radio',
    label: 'Radio Buttons',
    icon: '⚪',
    color: 'pink',
    category: 'choice',
    description: 'Single choice selection',
    defaultProps: {
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
      layout: 'vertical' // 'vertical' | 'horizontal'
    },
    validationRules: {
      supportedValidations: ['required'],
      defaultValidation: {
        required: false,
        message: 'Please select an option'
      }
    },
    configOptions: {
      hasPlaceholder: false,
      hasOptions: true,
      hasValidation: true,
      hasDefaultValue: true,
      supportedAttributes: ['options', 'layout'],
      optionsConfig: {
        allowOther: true,
        allowMultiple: false,
        sortable: true,
        layoutOptions: ['vertical', 'horizontal', 'grid']
      }
    }
  },

  checkbox: {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: '☑️',
    color: 'teal',
    category: 'choice',
    description: 'Multiple choice selection',
    defaultProps: {
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
      layout: 'vertical',
      minSelect: 0,
      maxSelect: null
    },
    validationRules: {
      supportedValidations: ['required', 'minSelect', 'maxSelect'],
      defaultValidation: {
        required: false,
        minSelect: null,
        maxSelect: null,
        message: ''
      }
    },
    configOptions: {
      hasPlaceholder: false,
      hasOptions: true,
      hasValidation: true,
      hasDefaultValue: true,
      supportedAttributes: ['options', 'layout', 'minSelect', 'maxSelect'],
      optionsConfig: {
        allowOther: true,
        allowMultiple: true,
        sortable: true,
        layoutOptions: ['vertical', 'horizontal', 'grid']
      }
    }
  },

  date: {
    type: 'date',
    label: 'Date',
    icon: '📅',
    color: 'red',
    category: 'input',
    description: 'Date picker input',
    defaultProps: {
      required: false,
      includeTime: false,
      minDate: null,
      maxDate: null,
      format: 'YYYY-MM-DD'
    },
    validationRules: {
      supportedValidations: ['required', 'minDate', 'maxDate'],
      defaultValidation: {
        required: false,
        minDate: null,
        maxDate: null,
        message: 'Please enter a valid date'
      }
    },
    configOptions: {
      hasPlaceholder: false,
      hasOptions: false,
      hasValidation: true,
      hasDefaultValue: true,
      supportedAttributes: ['includeTime', 'minDate', 'maxDate', 'format'],
      dateConfig: {
        formatOptions: ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY'],
        includeTimeOptions: [false, true]
      }
    }
  },

  file: {
    type: 'file',
    label: 'File Upload',
    icon: '📎',
    color: 'orange',
    category: 'upload',
    description: 'File attachment input',
    defaultProps: {
      required: false,
      multiple: false,
      maxSize: 10, // MB
      allowedTypes: ['image/*', 'application/pdf', '.doc,.docx']
    },
    validationRules: {
      supportedValidations: ['required', 'fileSize', 'fileType'],
      defaultValidation: {
        required: false,
        maxSize: 10,
        allowedTypes: [],
        message: 'Please upload a valid file'
      }
    },
    configOptions: {
      hasPlaceholder: false,
      hasOptions: false,
      hasValidation: true,
      hasDefaultValue: false,
      supportedAttributes: ['multiple', 'maxSize', 'allowedTypes'],
      fileConfig: {
        commonTypes: {
          'Images': ['image/*'],
          'Documents': ['application/pdf', '.doc', '.docx', '.txt'],
          'Spreadsheets': ['.xls', '.xlsx', '.csv'],
          'Archives': ['.zip', '.rar', '.7z'],
          'All Files': ['*']
        },
        maxSizeOptions: [1, 5, 10, 25, 50, 100] // MB
      }
    }
  }
};

/**
 * Field Categories for Toolbox Organization
 */
export const FIELD_CATEGORIES = {
  input: {
    label: 'Input Fields',
    description: 'Basic input fields for text, numbers, etc.',
    icon: '📝',
    color: 'blue'
  },
  choice: {
    label: 'Choice Fields',
    description: 'Selection fields like dropdowns and checkboxes',
    icon: '☑️',
    color: 'green'
  },
  upload: {
    label: 'File Upload',
    description: 'File and media upload fields',
    icon: '📎',
    color: 'orange'
  }
};

/**
 * Color Theme Configuration
 */
export const FIELD_COLORS = {
  blue: {
    light: 'from-blue-50 to-blue-100',
    border: 'border-blue-300',
    hover: 'hover:border-blue-400',
    focus: 'focus:ring-blue-500',
    text: 'text-blue-600'
  },
  green: {
    light: 'from-green-50 to-green-100',
    border: 'border-green-300',
    hover: 'hover:border-green-400',
    focus: 'focus:ring-green-500',
    text: 'text-green-600'
  },
  purple: {
    light: 'from-purple-50 to-purple-100',
    border: 'border-purple-300',
    hover: 'hover:border-purple-400',
    focus: 'focus:ring-purple-500',
    text: 'text-purple-600'
  },
  yellow: {
    light: 'from-yellow-50 to-yellow-100',
    border: 'border-yellow-300',
    hover: 'hover:border-yellow-400',
    focus: 'focus:ring-yellow-500',
    text: 'text-yellow-600'
  },
  indigo: {
    light: 'from-indigo-50 to-indigo-100',
    border: 'border-indigo-300',
    hover: 'hover:border-indigo-400',
    focus: 'focus:ring-indigo-500',
    text: 'text-indigo-600'
  },
  pink: {
    light: 'from-pink-50 to-pink-100',
    border: 'border-pink-300',
    hover: 'hover:border-pink-400',
    focus: 'focus:ring-pink-500',
    text: 'text-pink-600'
  },
  teal: {
    light: 'from-teal-50 to-teal-100',
    border: 'border-teal-300',
    hover: 'hover:border-teal-400',
    focus: 'focus:ring-teal-500',
    text: 'text-teal-600'
  },
  red: {
    light: 'from-red-50 to-red-100',
    border: 'border-red-300',
    hover: 'hover:border-red-400',
    focus: 'focus:ring-red-500',
    text: 'text-red-600'
  },
  orange: {
    light: 'from-orange-50 to-orange-100',
    border: 'border-orange-300',
    hover: 'hover:border-orange-400',
    focus: 'focus:ring-orange-500',
    text: 'text-orange-600'
  }
};

/**
 * Helper Functions for Field Configuration
 */

/**
 * Get field type configuration
 * @param {string} fieldType - The field type
 * @returns {object} Field configuration
 */
export const getFieldConfig = (fieldType) => {
  return FIELD_TYPES[fieldType] || null;
};

/**
 * Get all field types for a specific category
 * @param {string} category - The category name
 * @returns {array} Array of field types
 */
export const getFieldTypesByCategory = (category) => {
  return Object.values(FIELD_TYPES).filter(field => field.category === category);
};

/**
 * Get color classes for a field type
 * @param {string} fieldType - The field type
 * @returns {object} Color classes
 */
export const getFieldColors = (fieldType) => {
  const config = getFieldConfig(fieldType);
  return config ? FIELD_COLORS[config.color] : FIELD_COLORS.blue;
};

/**
 * Create a new field instance with default values
 * @param {string} fieldType - The field type
 * @param {object} overrides - Override default properties
 * @returns {object} New field instance
 */
export const createFieldInstance = (fieldType, overrides = {}) => {
  const config = getFieldConfig(fieldType);
  if (!config) {
    throw new Error(`Unknown field type: ${fieldType}`);
  }

  return {
    id: generateFieldId(),
    type: fieldType,
    label: overrides.label || `New ${config.label}`,
    ...config.defaultProps,
    validation: { ...config.validationRules.defaultValidation },
    ...overrides,
    order: overrides.order || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Generate unique field ID
 * @returns {string} Unique field ID
 */
export const generateFieldId = () => {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate field configuration
 * @param {object} field - Field object to validate
 * @returns {object} Validation result with errors
 */
export const validateFieldConfig = (field) => {
  const errors = [];
  const config = getFieldConfig(field.type);

  if (!config) {
    errors.push(`Invalid field type: ${field.type}`);
    return { isValid: false, errors };
  }

  // Validate required properties
  if (!field.label || field.label.trim() === '') {
    errors.push('Field label is required');
  }

  // Validate field-specific properties
  if (config.configOptions.hasOptions && (!field.options || field.options.length === 0)) {
    errors.push('Field options are required for this field type');
  }

  // Validate validation rules
  if (field.validation) {
    if (field.validation.minLength && field.validation.maxLength) {
      if (field.validation.minLength > field.validation.maxLength) {
        errors.push('Minimum length cannot be greater than maximum length');
      }
    }

    if (field.validation.min && field.validation.max) {
      if (field.validation.min > field.validation.max) {
        errors.push('Minimum value cannot be greater than maximum value');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default FIELD_TYPES;