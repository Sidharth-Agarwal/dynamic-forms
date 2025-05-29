// hooks/useFieldValidation.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { validateField, validateForm } from '../utils/validators';
import { useDebounce } from './useDebounce';

/**
 * Hook for validating individual fields
 * @param {Object} field - Field configuration
 * @param {any} value - Field value
 * @param {Object} options - Validation options
 * @returns {Object} - Validation state and functions
 */
export const useFieldValidation = (field, value, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    showErrorsImmediately = false
  } = options;

  const [errors, setErrors] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const debouncedValue = useDebounce(value, debounceMs);
  const lastValidatedValue = useRef(value);

  // Validation function
  const validateFieldValue = useCallback(
    async (valueToValidate, showErrors = true) => {
      if (!field) return { isValid: true, errors: [] };

      setIsValidating(true);

      try {
        const validationErrors = validateField(valueToValidate, field);
        const isFieldValid = validationErrors.length === 0;

        if (showErrors || showErrorsImmediately || hasBeenTouched) {
          setErrors(validationErrors);
          setIsValid(isFieldValid);
        }

        setIsValidating(false);
        lastValidatedValue.current = valueToValidate;

        return {
          isValid: isFieldValid,
          errors: validationErrors
        };
      } catch (error) {
        console.error('Field validation error:', error);
        setIsValidating(false);
        
        const errorMessage = 'Validation error occurred';
        setErrors([errorMessage]);
        setIsValid(false);

        return {
          isValid: false,
          errors: [errorMessage]
        };
      }
    },
    [field, hasBeenTouched, showErrorsImmediately]
  );

  // Validate on debounced value change
  useEffect(() => {
    if (validateOnChange && hasBeenTouched && debouncedValue !== lastValidatedValue.current) {
      validateFieldValue(debouncedValue);
    }
  }, [debouncedValue, validateOnChange, hasBeenTouched, validateFieldValue]);

  // Handle field touch (focus/blur events)
  const handleTouch = useCallback(() => {
    setHasBeenTouched(true);
    
    if (validateOnBlur) {
      validateFieldValue(value);
    }
  }, [value, validateOnBlur, validateFieldValue]);

  // Manual validation trigger
  const validate = useCallback(
    (valueToValidate = value) => {
      setHasBeenTouched(true);
      return validateFieldValue(valueToValidate, true);
    },
    [value, validateFieldValue]
  );

  // Clear validation state
  const clearValidation = useCallback(() => {
    setErrors([]);
    setIsValid(true);
    setHasBeenTouched(false);
    setIsValidating(false);
  }, []);

  // Reset validation for new field
  useEffect(() => {
    if (field?.id !== lastValidatedValue.current?.fieldId) {
      clearValidation();
      lastValidatedValue.current = { fieldId: field?.id, value };
    }
  }, [field?.id, value, clearValidation]);

  return {
    errors,
    isValid,
    isValidating,
    hasBeenTouched,
    validate,
    handleTouch,
    clearValidation
  };
};

/**
 * Hook for validating entire forms
 * @param {Object} formConfig - Form configuration
 * @param {Object} formData - Form data
 * @param {Object} options - Validation options
 * @returns {Object} - Form validation state and functions
 */
export const useFormValidation = (formConfig, formData, options = {}) => {
  const {
    validateOnChange = false,
    debounceMs = 500,
    validateOnSubmit = true
  } = options;

  const [fieldErrors, setFieldErrors] = useState({});
  const [isValid, setIsValid] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [touchedFields, setTouchedFields] = useState(new Set());

  const debouncedFormData = useDebounce(formData, debounceMs);

  // Validate entire form
  const validateFormData = useCallback(
    async (dataToValidate = formData, showAllErrors = false) => {
      if (!formConfig || !formConfig.fields) {
        return { isValid: true, errors: {} };
      }

      setIsValidating(true);

      try {
        const validation = validateForm(dataToValidate, formConfig);
        
        // Only show errors for touched fields unless showAllErrors is true
        let errorsToShow = {};
        
        if (showAllErrors) {
          errorsToShow = validation.errors;
        } else {
          Object.keys(validation.errors).forEach(fieldName => {
            if (touchedFields.has(fieldName)) {
              errorsToShow[fieldName] = validation.errors[fieldName];
            }
          });
        }

        setFieldErrors(errorsToShow);
        setIsValid(validation.isValid);
        setIsValidating(false);

        return {
          isValid: validation.isValid,
          errors: validation.errors,
          visibleErrors: errorsToShow
        };
      } catch (error) {
        console.error('Form validation error:', error);
        setIsValidating(false);
        
        const errorMessage = { _form: ['Form validation error occurred'] };
        setFieldErrors(errorMessage);
        setIsValid(false);

        return {
          isValid: false,
          errors: errorMessage,
          visibleErrors: errorMessage
        };
      }
    },
    [formConfig, formData, touchedFields]
  );

  // Validate on form data change
  useEffect(() => {
    if (validateOnChange && touchedFields.size > 0) {
      validateFormData(debouncedFormData);
    }
  }, [debouncedFormData, validateOnChange, touchedFields.size, validateFormData]);

  // Touch a field
  const touchField = useCallback((fieldName) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));
  }, []);

  // Touch multiple fields
  const touchFields = useCallback((fieldNames) => {
    setTouchedFields(prev => new Set([...prev, ...fieldNames]));
  }, []);

  // Validate specific field
  const validateField = useCallback(
    async (fieldName, fieldValue) => {
      const field = formConfig?.fields?.find(f => f.name === fieldName);
      if (!field) return { isValid: true, errors: [] };

      touchField(fieldName);

      try {
        const fieldValidation = validateField(fieldValue, field);
        const isFieldValid = fieldValidation.length === 0;

        setFieldErrors(prev => ({
          ...prev,
          [fieldName]: isFieldValid ? undefined : fieldValidation
        }));

        return {
          isValid: isFieldValid,
          errors: fieldValidation
        };
      } catch (error) {
        console.error(`Field validation error for ${fieldName}:`, error);
        return {
          isValid: false,
          errors: ['Validation error occurred']
        };
      }
    },
    [formConfig, touchField]
  );

  // Validate for form submission
  const validateForSubmit = useCallback(
    async (dataToValidate = formData) => {
      // Touch all fields
      const allFieldNames = formConfig?.fields?.map(f => f.name) || [];
      touchFields(allFieldNames);

      return await validateFormData(dataToValidate, true);
    },
    [formData, formConfig, touchFields, validateFormData]
  );

  // Clear validation state
  const clearValidation = useCallback(() => {
    setFieldErrors({});
    setIsValid(true);
    setIsValidating(false);
    setTouchedFields(new Set());
  }, []);

  // Clear validation for specific field
  const clearFieldValidation = useCallback((fieldName) => {
    setFieldErrors(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
    
    setTouchedFields(prev => {
      const updated = new Set(prev);
      updated.delete(fieldName);
      return updated;
    });
  }, []);

  // Get validation state for specific field
  const getFieldValidation = useCallback((fieldName) => {
    return {
      errors: fieldErrors[fieldName] || [],
      isValid: !fieldErrors[fieldName] || fieldErrors[fieldName].length === 0,
      isTouched: touchedFields.has(fieldName)
    };
  }, [fieldErrors, touchedFields]);

  // Check if form has any errors
  const hasErrors = Object.keys(fieldErrors).some(
    key => fieldErrors[key] && fieldErrors[key].length > 0
  );

  return {
    fieldErrors,
    isValid: isValid && !hasErrors,
    isValidating,
    touchedFields: Array.from(touchedFields),
    validateFormData,
    validateField,
    validateForSubmit,
    touchField,
    touchFields,
    clearValidation,
    clearFieldValidation,
    getFieldValidation,
    hasErrors
  };
};

/**
 * Hook for conditional validation based on other field values
 * @param {Object} field - Field configuration
 * @param {any} value - Current field value
 * @param {Object} formData - All form data
 * @param {Array} conditions - Validation conditions
 * @returns {Object} - Conditional validation result
 */
export const useConditionalValidation = (field, value, formData, conditions = []) => {
  const [conditionalRules, setConditionalRules] = useState([]);
  const [isConditionallyRequired, setIsConditionallyRequired] = useState(false);

  // Evaluate conditions
  useEffect(() => {
    if (!conditions.length) {
      setConditionalRules([]);
      setIsConditionallyRequired(false);
      return;
    }

    const applicableRules = conditions.filter(condition => {
      return evaluateCondition(condition.condition, formData);
    });

    setConditionalRules(applicableRules);
    
    // Check if any rule makes the field required
    const hasRequiredRule = applicableRules.some(rule => rule.action?.required === true);
    setIsConditionallyRequired(hasRequiredRule);

  }, [conditions, formData]);

  // Create modified field config with conditional rules
  const getModifiedField = useCallback(() => {
    if (!conditionalRules.length) return field;

    let modifiedField = { ...field };

    conditionalRules.forEach(rule => {
      if (rule.action) {
        // Apply conditional modifications
        if (rule.action.required !== undefined) {
          modifiedField.required = rule.action.required;
        }
        if (rule.action.validation) {
          modifiedField.validation = {
            ...modifiedField.validation,
            ...rule.action.validation
          };
        }
        if (rule.action.visible !== undefined) {
          modifiedField.visible = rule.action.visible;
        }
      }
    });

    return modifiedField;
  }, [field, conditionalRules]);

  return {
    modifiedField: getModifiedField(),
    conditionalRules,
    isConditionallyRequired
  };
};

// Helper function to evaluate conditions
const evaluateCondition = (condition, formData) => {
  if (!condition) return false;

  const { field: fieldName, operator, value: conditionValue } = condition;
  const fieldValue = formData[fieldName];

  switch (operator) {
    case 'equals':
      return fieldValue === conditionValue;
    case 'not_equals':
      return fieldValue !== conditionValue;
    case 'contains':
      return Array.isArray(fieldValue) 
        ? fieldValue.includes(conditionValue)
        : String(fieldValue || '').includes(conditionValue);
    case 'not_contains':
      return Array.isArray(fieldValue)
        ? !fieldValue.includes(conditionValue)
        : !String(fieldValue || '').includes(conditionValue);
    case 'is_empty':
      return !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0);
    case 'is_not_empty':
      return !!fieldValue && (!Array.isArray(fieldValue) || fieldValue.length > 0);
    case 'greater_than':
      return Number(fieldValue) > Number(conditionValue);
    case 'less_than':
      return Number(fieldValue) < Number(conditionValue);
    default:
      return false;
  }
};

export default useFieldValidation;