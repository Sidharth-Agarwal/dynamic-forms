// services/ValidationService.js
import { validateField, validateForm as utilValidateForm } from '../utils/validators';

class ValidationService {
  /**
   * Validate a single field
   */
  validateField(value, fieldConfig) {
    return validateField(value, fieldConfig);
  }

  /**
   * Validate entire form
   */
  validateForm(formData, formConfig) {
    return utilValidateForm(formData, formConfig);
  }

  /**
   * Validate form configuration
   */
  validateFormConfig(formConfig) {
    const errors = [];

    if (!formConfig.title?.trim()) {
      errors.push('Form title is required');
    }

    if (!formConfig.fields || formConfig.fields.length === 0) {
      errors.push('Form must have at least one field');
    }

    // Check for duplicate field names
    if (formConfig.fields) {
      const fieldNames = formConfig.fields.map(field => field.name);
      const duplicates = fieldNames.filter((name, index) => 
        fieldNames.indexOf(name) !== index
      );
      
      if (duplicates.length > 0) {
        errors.push(`Duplicate field names: ${[...new Set(duplicates)].join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get validation rules for field type
   */
  getFieldValidationRules(fieldType) {
    const rules = {
      text: ['required', 'minLength', 'maxLength', 'pattern'],
      textarea: ['required', 'minLength', 'maxLength'],
      email: ['required', 'email'],
      number: ['required', 'minValue', 'maxValue'],
      select: ['required'],
      radio: ['required'],
      checkbox: ['required', 'minSelections', 'maxSelections'],
      file: ['required', 'fileSize', 'fileType'],
      date: ['required', 'minDate', 'maxDate'],
      url: ['required', 'url'],
      phone: ['required', 'phone']
    };

    return rules[fieldType] || ['required'];
  }
}

const validationService = new ValidationService();
export default validationService;