import { FIELD_TYPES } from '../config/fieldConfig.js';

/**
 * Field type utility functions
 * These utilities help with field type operations, validation, and management
 */

/**
 * Get all available field types
 * @returns {object} All field type configurations
 */
export const getAllFieldTypes = () => {
  return FIELD_TYPES;
};

/**
 * Get field type configuration by type
 * @param {string} fieldType - The field type
 * @returns {object|null} Field type configuration
 */
export const getFieldTypeConfig = (fieldType) => {
  return FIELD_TYPES[fieldType] || null;
};

/**
 * Get field types by category
 * @param {string} category - The category (input, choice, upload)
 * @returns {array} Array of field types in the category
 */
export const getFieldTypesByCategory = (category) => {
  return Object.values(FIELD_TYPES).filter(field => field.category === category);
};

/**
 * Get all field categories
 * @returns {array} Array of unique categories
 */
export const getFieldCategories = () => {
  const categories = new Set();
  Object.values(FIELD_TYPES).forEach(field => {
    categories.add(field.category);
  });
  return Array.from(categories);
};

/**
 * Check if field type exists
 * @param {string} fieldType - The field type to check
 * @returns {boolean} True if field type exists
 */
export const isValidFieldType = (fieldType) => {
  return fieldType in FIELD_TYPES;
};

/**
 * Get field type icon
 * @param {string} fieldType - The field type
 * @returns {string} Field type icon
 */
export const getFieldTypeIcon = (fieldType) => {
  const config = getFieldTypeConfig(fieldType);
  return config ? config.icon : '📝';
};

/**
 * Get field type color
 * @param {string} fieldType - The field type
 * @returns {string} Field type color
 */
export const getFieldTypeColor = (fieldType) => {
  const config = getFieldTypeConfig(fieldType);
  return config ? config.color : 'blue';
};

/**
 * Get field type label
 * @param {string} fieldType - The field type
 * @returns {string} Field type label
 */
export const getFieldTypeLabel = (fieldType) => {
  const config = getFieldTypeConfig(fieldType);
  return config ? config.label : fieldType;
};

/**
 * Check if field type supports options
 * @param {string} fieldType - The field type
 * @returns {boolean} True if field type supports options
 */
export const fieldTypeSupportsOptions = (fieldType) => {
  const config = getFieldTypeConfig(fieldType);
  return config ? config.configOptions.hasOptions : false;
};

/**
 * Check if field type supports placeholder
 * @param {string} fieldType - The field type
 * @returns {boolean} True if field type supports placeholder
 */
export const fieldTypeSupportsPlaceholder = (fieldType) => {
  const config = getFieldTypeConfig(fieldType);
  return config ? config.configOptions.hasPlaceholder : false;
};

/**
 * Check if field type supports validation
 * @param {string} fieldType - The field type
 * @returns {boolean} True if field type supports validation
 */
export const fieldTypeSupportsValidation = (fieldType) => {
  const config = getFieldTypeConfig(fieldType);
  return config ? config.configOptions.hasValidation : false;
};

/**
 * Get supported validation rules for field type
 * @param {string} fieldType - The field type
 * @returns {array} Array of supported validation rules
 */
export const getSupportedValidationRules = (fieldType) => {
  const config = getFieldTypeConfig(fieldType);
  return config ? config.validationRules.supportedValidations : [];
};

/**
 * Get default validation for field type
 * @param {string} fieldType - The field type
 * @returns {object} Default validation configuration
 */
export const getDefaultValidation = (fieldType) => {
  const config = getFieldTypeConfig(fieldType);
  return config ? { ...config.validationRules.defaultValidation } : {};
};

/**
 * Get default props for field type
 * @param {string} fieldType - The field type
 * @returns {object} Default props for the field type
 */
export const getDefaultProps = (fieldType) => {
  const config = getFieldTypeConfig(fieldType);
  return config ? { ...config.defaultProps } : {};
};

/**
 * Create a new field instance
 * @param {string} fieldType - The field type
 * @param {object} overrides - Properties to override
 * @returns {object} New field instance
 */
export const createFieldInstance = (fieldType, overrides = {}) => {
  const config = getFieldTypeConfig(fieldType);
  
  if (!config) {
    throw new Error(`Unknown field type: ${fieldType}`);
  }
  
  const fieldId = generateFieldId(fieldType);
  
  return {
    id: fieldId,
    type: fieldType,
    label: overrides.label || `New ${config.label}`,
    ...config.defaultProps,
    validation: { ...config.validationRules.defaultValidation },
    order: overrides.order || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
};

/**
 * Generate unique field ID
 * @param {string} fieldType - The field type
 * @returns {string} Unique field ID
 */
export const generateFieldId = (fieldType = 'field') => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  return `${fieldType}_${timestamp}_${randomPart}`;
};

/**
 * Validate field configuration
 * @param {object} field - Field configuration to validate
 * @returns {object} Validation result
 */
export const validateFieldConfig = (field) => {
  const errors = [];
  const warnings = [];
  
  if (!field || typeof field !== 'object') {
    errors.push('Field configuration is required');
    return { isValid: false, errors, warnings };
  }
  
  // Check required properties
  if (!field.type) {
    errors.push('Field type is required');
  } else if (!isValidFieldType(field.type)) {
    errors.push(`Invalid field type: ${field.type}`);
  }
  
  if (!field.label || typeof field.label !== 'string' || field.label.trim() === '') {
    errors.push('Field label is required');
  }
  
  if (!field.id || typeof field.id !== 'string' || field.id.trim() === '') {
    errors.push('Field ID is required');
  }
  
  // Validate field type specific requirements
  if (field.type && isValidFieldType(field.type)) {
    const config = getFieldTypeConfig(field.type);
    
    // Check if options are required
    if (config.configOptions.hasOptions && (!field.options || !Array.isArray(field.options) || field.options.length === 0)) {
      errors.push('Options are required for this field type');
    }
    
    // Validate options if present
    if (field.options && Array.isArray(field.options)) {
      if (field.options.some(option => !option || typeof option !== 'string' || option.trim() === '')) {
        errors.push('All options must be non-empty strings');
      }
      
      if (field.options.length > 20) {
        warnings.push('Large number of options may impact performance');
      }
    }
    
    // Validate validation rules
    if (field.validation && typeof field.validation === 'object') {
      const supportedRules = getSupportedValidationRules(field.type);
      
      Object.keys(field.validation).forEach(rule => {
        if (!supportedRules.includes(rule)) {
          warnings.push(`Validation rule '${rule}' is not supported for field type '${field.type}'`);
        }
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Clone field configuration
 * @param {object} field - Field to clone
 * @param {object} overrides - Properties to override in clone
 * @returns {object} Cloned field
 */
export const cloneField = (field, overrides = {}) => {
  if (!field) return null;
  
  const cloned = {
    ...field,
    id: generateFieldId(field.type),
    label: `Copy of ${field.label}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
  
  // Deep clone arrays and objects
  if (field.options) {
    cloned.options = [...field.options];
  }
  
  if (field.validation) {
    cloned.validation = { ...field.validation };
  }
  
  return cloned;
};

/**
 * Update field configuration
 * @param {object} field - Original field
 * @param {object} updates - Updates to apply
 * @returns {object} Updated field
 */
export const updateField = (field, updates) => {
  if (!field) return null;
  
  return {
    ...field,
    ...updates,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Get field rendering props
 * @param {object} field - Field configuration
 * @returns {object} Props for rendering the field
 */
export const getFieldRenderProps = (field) => {
  if (!field) return {};
  
  const config = getFieldTypeConfig(field.type);
  if (!config) return {};
  
  const props = {
    id: field.id,
    name: field.id,
    type: field.type,
    required: field.required || false,
    'aria-label': field.label,
    'aria-describedby': field.description ? `${field.id}-description` : undefined
  };
  
  // Add type-specific props
  switch (field.type) {
    case 'text':
    case 'email':
    case 'textarea':
      if (field.placeholder) props.placeholder = field.placeholder;
      if (field.maxLength) props.maxLength = field.maxLength;
      if (field.minLength) props.minLength = field.minLength;
      break;
      
    case 'number':
      if (field.placeholder) props.placeholder = field.placeholder;
      if (field.min !== undefined) props.min = field.min;
      if (field.max !== undefined) props.max = field.max;
      if (field.step !== undefined) props.step = field.step;
      break;
      
    case 'date':
      if (field.minDate) props.min = field.minDate;
      if (field.maxDate) props.max = field.maxDate;
      break;
      
    case 'file':
      if (field.multiple) props.multiple = field.multiple;
      if (field.allowedTypes) props.accept = field.allowedTypes.join(',');
      break;
      
    case 'textarea':
      if (field.rows) props.rows = field.rows;
      break;
  }
  
  return props;
};

/**
 * Sort fields by order
 * @param {array} fields - Array of fields
 * @returns {array} Sorted fields
 */
export const sortFieldsByOrder = (fields) => {
  if (!Array.isArray(fields)) return [];
  
  return [...fields].sort((a, b) => {
    const orderA = a.order || 0;
    const orderB = b.order || 0;
    return orderA - orderB;
  });
};

/**
 * Reorder fields
 * @param {array} fields - Array of fields
 * @param {number} fromIndex - Source index
 * @param {number} toIndex - Target index
 * @returns {array} Reordered fields
 */
export const reorderFields = (fields, fromIndex, toIndex) => {
  if (!Array.isArray(fields)) return [];
  if (fromIndex === toIndex) return fields;
  
  const reordered = [...fields];
  const [movedField] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, movedField);
  
  // Update order property
  return reordered.map((field, index) => ({
    ...field,
    order: index,
    updatedAt: new Date().toISOString()
  }));
};

/**
 * Find field by ID
 * @param {array} fields - Array of fields
 * @param {string} fieldId - Field ID to find
 * @returns {object|null} Found field or null
 */
export const findFieldById = (fields, fieldId) => {
  if (!Array.isArray(fields)) return null;
  return fields.find(field => field.id === fieldId) || null;
};

/**
 * Get field statistics
 * @param {array} fields - Array of fields
 * @returns {object} Field statistics
 */
export const getFieldStatistics = (fields) => {
  if (!Array.isArray(fields)) {
    return {
      total: 0,
      byType: {},
      byCategory: {},
      required: 0,
      optional: 0
    };
  }
  
  const stats = {
    total: fields.length,
    byType: {},
    byCategory: {},
    required: 0,
    optional: 0
  };
  
  fields.forEach(field => {
    // Count by type
    stats.byType[field.type] = (stats.byType[field.type] || 0) + 1;
    
    // Count by category
    const config = getFieldTypeConfig(field.type);
    if (config) {
      const category = config.category;
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    }
    
    // Count required/optional
    if (field.required) {
      stats.required++;
    } else {
      stats.optional++;
    }
  });
  
  return stats;
};

/**
 * Export field definitions for external use
 * @param {array} fields - Array of fields
 * @param {string} format - Export format ('json', 'schema')
 * @returns {string|object} Exported field definitions
 */
export const exportFieldDefinitions = (fields, format = 'json') => {
  if (!Array.isArray(fields)) return null;
  
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    fields: fields.map(field => ({
      id: field.id,
      type: field.type,
      label: field.label,
      required: field.required,
      order: field.order,
      options: field.options,
      validation: field.validation,
      placeholder: field.placeholder
    }))
  };
  
  if (format === 'json') {
    return JSON.stringify(exportData, null, 2);
  }
  
  if (format === 'schema') {
    return {
      type: 'object',
      properties: fields.reduce((schema, field) => {
        schema[field.id] = {
          type: getJsonSchemaType(field.type),
          title: field.label,
          description: field.description
        };
        
        if (field.required) {
          schema.required = schema.required || [];
          schema.required.push(field.id);
        }
        
        return schema;
      }, {})
    };
  }
  
  return exportData;
};

/**
 * Get JSON Schema type for field type
 * @param {string} fieldType - Field type
 * @returns {string} JSON Schema type
 */
const getJsonSchemaType = (fieldType) => {
  const typeMap = {
    text: 'string',
    email: 'string',
    textarea: 'string',
    number: 'number',
    date: 'string',
    checkbox: 'array',
    radio: 'string',
    select: 'string',
    file: 'string'
  };
  
  return typeMap[fieldType] || 'string';
};

export default {
  getAllFieldTypes,
  getFieldTypeConfig,
  getFieldTypesByCategory,
  getFieldCategories,
  isValidFieldType,
  getFieldTypeIcon,
  getFieldTypeColor,
  getFieldTypeLabel,
  fieldTypeSupportsOptions,
  fieldTypeSupportsPlaceholder,
  fieldTypeSupportsValidation,
  getSupportedValidationRules,
  getDefaultValidation,
  getDefaultProps,
  createFieldInstance,
  generateFieldId,
  validateFieldConfig,
  cloneField,
  updateField,
  getFieldRenderProps,
  sortFieldsByOrder,
  reorderFields,
  findFieldById,
  getFieldStatistics,
  exportFieldDefinitions
};