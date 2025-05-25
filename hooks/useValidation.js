import { useState, useCallback, useRef, useEffect } from 'react';
import { validationService } from '../services/validationService.js';
import { debounce } from '../utils/helpers.js';

/**
 * Hook for field-level validation
 * Provides real-time validation with debouncing and caching
 */
export const useFieldValidation = (field, options = {}) => {
  const {
    debounceDelay = 300,
    validateOnChange = false,
    validateOnBlur = true,
    validateOnMount = false
  } = options;

  const [error, setError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [isTouched, setIsTouched] = useState(false);
  const lastValueRef = useRef();

  // Debounced validation function
  const debouncedValidate = useCallback(
    debounce(async (value, allValues = {}) => {
      if (!field) return;

      try {
        setIsValidating(true);
        
        const result = await validationService.validateField(value, field, allValues);
        
        if (result.isValid) {
          setError(null);
          setIsValid(true);
        } else {
          const errorMessage = result.errors[0]?.message || 'Invalid value';
          setError(errorMessage);
          setIsValid(false);
        }
      } catch (err) {
        setError('Validation failed');
        setIsValid(false);
        console.error('Validation error:', err);
      } finally {
        setIsValidating(false);
      }
    }, debounceDelay),
    [field, debounceDelay]
  );

  // Immediate validation (for onBlur)
  const validateImmediate = useCallback(async (value, allValues = {}) => {
    if (!field) return { isValid: true };

    try {
      setIsValidating(true);
      
      const result = await validationService.validateField(value, field, allValues);
      
      if (result.isValid) {
        setError(null);
        setIsValid(true);
      } else {
        const errorMessage = result.errors[0]?.message || 'Invalid value';
        setError(errorMessage);
        setIsValid(false);
      }
      
      return result;
    } catch (err) {
      setError('Validation failed');
      setIsValid(false);
      console.error('Validation error:', err);
      return { isValid: false, errors: [{ message: 'Validation failed' }] };
    } finally {
      setIsValidating(false);
    }
  }, [field]);

  // Validate on change
  const validateOnChangeHandler = useCallback((value, allValues = {}) => {
    lastValueRef.current = value;
    
    if (validateOnChange) {
      debouncedValidate(value, allValues);
    }
  }, [validateOnChange, debouncedValidate]);

  // Validate on blur
  const validateOnBlurHandler = useCallback(async (value, allValues = {}) => {
    setIsTouched(true);
    
    if (validateOnBlur) {
      await validateImmediate(value, allValues);
    }
  }, [validateOnBlur, validateImmediate]);

  // Clear validation state
  const clearValidation = useCallback(() => {
    setError(null);
    setIsValid(true);
    setIsTouched(false);
    setIsValidating(false);
  }, []);

  // Force validation
  const forceValidate = useCallback(async (value, allValues = {}) => {
    return await validateImmediate(value, allValues);
  }, [validateImmediate]);

  // Validate on mount if required
  useEffect(() => {
    if (validateOnMount && lastValueRef.current !== undefined) {
      validateImmediate(lastValueRef.current);
    }
  }, [validateOnMount, validateImmediate]);

  return {
    error,
    isValidating,
    isValid,
    isTouched,
    validateOnChange: validateOnChangeHandler,
    validateOnBlur: validateOnBlurHandler,
    clearValidation,
    forceValidate,
    shouldShowError: isTouched && error
  };
};

/**
 * Hook for form-level validation
 * Handles validation of entire forms with field dependencies
 */
export const useFormValidation = (fields = [], options = {}) => {
  const {
    validateOnSubmit = true,
    enableCrossFieldValidation = true,
    stopOnFirstError = false
  } = options;

  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [touchedFields, setTouchedFields] = useState(new Set());
  const [validationSummary, setValidationSummary] = useState(null);

  // Validate entire form
  const validateForm = useCallback(async (formData) => {
    try {
      setIsValidating(true);
      
      const result = await validationService.validateForm(
        formData, 
        fields, 
        { enableCrossFieldValidation }
      );
      
      // Process validation results
      const newErrors = {};
      let hasErrors = false;

      result.errors.forEach(error => {
        if (error.fieldId) {
          newErrors[error.fieldId] = error.message;
          hasErrors = true;
          
          // Stop on first error if configured
          if (stopOnFirstError && !hasErrors) {
            return;
          }
        }
      });

      setErrors(newErrors);
      setIsValid(!hasErrors);
      setValidationSummary(result.summary);
      
      return result;
    } catch (err) {
      console.error('Form validation error:', err);
      setIsValid(false);
      return { isValid: false, errors: [], summary: null };
    } finally {
      setIsValidating(false);
    }
  }, [fields, enableCrossFieldValidation, stopOnFirstError]);

  // Validate single field within form context
  const validateField = useCallback(async (fieldId, value, formData = {}) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return { isValid: true };

    try {
      const result = await validationService.validateField(value, field, formData);
      
      setErrors(prev => {
        const newErrors = { ...prev };
        if (result.isValid) {
          delete newErrors[fieldId];
        } else {
          newErrors[fieldId] = result.errors[0]?.message || 'Invalid value';
        }
        return newErrors;
      });
      
      return result;
    } catch (err) {
      console.error('Field validation error:', err);
      return { isValid: false, errors: [{ message: 'Validation failed' }] };
    }
  }, [fields]);

  // Mark field as touched
  const touchField = useCallback((fieldId) => {
    setTouchedFields(prev => new Set([...prev, fieldId]));
  }, []);

  // Clear field error
  const clearFieldError = useCallback((fieldId) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors({});
    setIsValid(true);
    setTouchedFields(new Set());
    setValidationSummary(null);
  }, []);

  // Get field error
  const getFieldError = useCallback((fieldId) => {
    return errors[fieldId] || null;
  }, [errors]);

  // Check if field is touched
  const isFieldTouched = useCallback((fieldId) => {
    return touchedFields.has(fieldId);
  }, [touchedFields]);

  // Check if field should show error
  const shouldShowFieldError = useCallback((fieldId) => {
    return isFieldTouched(fieldId) && getFieldError(fieldId);
  }, [isFieldTouched, getFieldError]);

  // Validate on submit handler
  const handleSubmit = useCallback(async (formData, onSubmit) => {
    if (!validateOnSubmit) {
      return onSubmit?.(formData);
    }

    // Mark all fields as touched
    const allFieldIds = fields.map(f => f.id);
    setTouchedFields(new Set(allFieldIds));

    // Validate form
    const result = await validateForm(formData);
    
    if (result.isValid) {
      return onSubmit?.(formData);
    } else {
      // Focus first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.focus();
      }
      
      throw new Error('Form validation failed');
    }
  }, [validateOnSubmit, fields, validateForm, errors]);

  return {
    errors,
    isValidating,
    isValid,
    touchedFields: Array.from(touchedFields),
    validationSummary,
    validateForm,
    validateField,
    touchField,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    isFieldTouched,
    shouldShowFieldError,
    handleSubmit
  };
};

/**
 * Hook for async validation
 * Handles validation that requires server calls or external APIs
 */
export const useAsyncValidation = (validationFn, options = {}) => {
  const {
    debounceDelay = 500,
    timeout = 5000,
    retryAttempts = 2
  } = options;

  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Debounced async validation
  const debouncedValidate = useCallback(
    debounce(async (value, ...args) => {
      // Cancel previous validation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      try {
        setIsValidating(true);
        setError(null);

        // Add timeout
        const timeoutId = setTimeout(() => {
          abortControllerRef.current?.abort();
        }, timeout);

        // Perform validation with retry logic
        let lastError;
        for (let attempt = 0; attempt <= retryAttempts; attempt++) {
          try {
            if (signal.aborted) return;

            const validationResult = await validationFn(value, ...args);
            
            clearTimeout(timeoutId);
            setResult(validationResult);
            return validationResult;
          } catch (err) {
            lastError = err;
            if (attempt < retryAttempts && !signal.aborted) {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
          }
        }

        // All attempts failed
        throw lastError;

      } catch (err) {
        if (!signal.aborted) {
          setError(err.message);
          setResult({ isValid: false, errors: [{ message: err.message }] });
        }
      } finally {
        if (!signal.aborted) {
          setIsValidating(false);
        }
      }
    }, debounceDelay),
    [validationFn, debounceDelay, timeout, retryAttempts]
  );

  // Cancel validation
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsValidating(false);
    }
  }, []);

  // Clear result
  const clear = useCallback(() => {
    setResult(null);
    setError(null);
    setIsValidating(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    validate: debouncedValidate,
    isValidating,
    result,
    error,
    cancel,
    clear
  };
};

/**
 * Hook for validation rules management
 * Allows dynamic addition and management of custom validation rules
 */
export const useValidationRules = () => {
  const [customRules, setCustomRules] = useState(new Map());

  // Add custom validation rule
  const addRule = useCallback((name, validator, message, options = {}) => {
    const rule = {
      name,
      validator,
      message,
      ...options
    };

    setCustomRules(prev => new Map(prev).set(name, rule));
    
    // Register with validation service
    if (validationService.addCustomRule) {
      validationService.addCustomRule(name, rule);
    }
  }, []);

  // Remove custom rule
  const removeRule = useCallback((name) => {
    setCustomRules(prev => {
      const newRules = new Map(prev);
      newRules.delete(name);
      return newRules;
    });

    // Remove from validation service
    if (validationService.removeCustomRule) {
      validationService.removeCustomRule(name);
    }
  }, []);

  // Get rule
  const getRule = useCallback((name) => {
    return customRules.get(name) || null;
  }, [customRules]);

  // Get all rules
  const getAllRules = useCallback(() => {
    return Array.from(customRules.values());
  }, [customRules]);

  // Clear all custom rules
  const clearRules = useCallback(() => {
    setCustomRules(new Map());
  }, []);

  return {
    customRules: Array.from(customRules.values()),
    addRule,
    removeRule,
    getRule,
    getAllRules,
    clearRules
  };
};

/**
 * Hook for validation performance monitoring
 * Tracks validation performance and provides metrics
 */
export const useValidationMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalValidations: 0,
    averageTime: 0,
    errorRate: 0,
    cacheHitRate: 0
  });
  const validationTimes = useRef([]);
  const errorCount = useRef(0);
  const cacheHits = useRef(0);
  const cacheMisses = useRef(0);

  // Record validation performance
  const recordValidation = useCallback((startTime, isError = false, isCacheHit = false) => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Update metrics
    validationTimes.current.push(duration);
    if (isError) errorCount.current++;
    if (isCacheHit) cacheHits.current++;
    else cacheMisses.current++;

    // Keep only last 100 measurements
    if (validationTimes.current.length > 100) {
      validationTimes.current = validationTimes.current.slice(-100);
    }

    // Calculate new metrics
    const totalValidations = validationTimes.current.length;
    const averageTime = validationTimes.current.reduce((sum, time) => sum + time, 0) / totalValidations;
    const errorRate = (errorCount.current / totalValidations) * 100;
    const totalCacheAttempts = cacheHits.current + cacheMisses.current;
    const cacheHitRate = totalCacheAttempts > 0 ? (cacheHits.current / totalCacheAttempts) * 100 : 0;

    setMetrics({
      totalValidations,
      averageTime: Math.round(averageTime * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100
    });
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    validationTimes.current = [];
    errorCount.current = 0;
    cacheHits.current = 0;
    cacheMisses.current = 0;
    setMetrics({
      totalValidations: 0,
      averageTime: 0,
      errorRate: 0,
      cacheHitRate: 0
    });
  }, []);

  return {
    metrics,
    recordValidation,
    resetMetrics
  };
};

export default {
  useFieldValidation,
  useFormValidation,
  useAsyncValidation,
  useValidationRules,
  useValidationMetrics
};