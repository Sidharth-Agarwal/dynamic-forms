// hooks/useConditionalLogic.js
import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook for managing conditional field logic
 * @param {Array} fields - Form fields with conditions
 * @param {Object} formData - Current form values
 * @param {Object} options - Configuration options
 * @returns {Object} - Conditional logic state and functions
 */
export const useConditionalLogic = (fields = [], formData = {}, options = {}) => {
  const { debug = false } = options;

  const [visibleFields, setVisibleFields] = useState(new Set());
  const [requiredFields, setRequiredFields] = useState(new Set());
  const [fieldModifications, setFieldModifications] = useState({});

  // Evaluate a single condition
  const evaluateCondition = useCallback((condition, data) => {
    if (!condition || !condition.field) return false;

    const { field: fieldName, operator, value: expectedValue, logicalOperator = 'AND' } = condition;
    const fieldValue = data[fieldName];

    // Handle array of conditions with logical operators
    if (Array.isArray(condition.conditions)) {
      const results = condition.conditions.map(subCondition => 
        evaluateCondition(subCondition, data)
      );

      return logicalOperator === 'OR' 
        ? results.some(result => result)
        : results.every(result => result);
    }

    // Evaluate single condition
    switch (operator) {
      case 'equals':
        return fieldValue === expectedValue;
      
      case 'not_equals':
        return fieldValue !== expectedValue;
      
      case 'contains':
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(expectedValue);
        }
        return String(fieldValue || '').toLowerCase().includes(String(expectedValue || '').toLowerCase());
      
      case 'not_contains':
        if (Array.isArray(fieldValue)) {
          return !fieldValue.includes(expectedValue);
        }
        return !String(fieldValue || '').toLowerCase().includes(String(expectedValue || '').toLowerCase());
      
      case 'is_empty':
        return !fieldValue || 
               (Array.isArray(fieldValue) && fieldValue.length === 0) ||
               String(fieldValue).trim() === '';
      
      case 'is_not_empty':
        return !!fieldValue && 
               (!Array.isArray(fieldValue) || fieldValue.length > 0) &&
               String(fieldValue).trim() !== '';
      
      case 'greater_than':
        return Number(fieldValue) > Number(expectedValue);
      
      case 'less_than':
        return Number(fieldValue) < Number(expectedValue);
      
      case 'greater_than_or_equal':
        return Number(fieldValue) >= Number(expectedValue);
      
      case 'less_than_or_equal':
        return Number(fieldValue) <= Number(expectedValue);
      
      case 'starts_with':
        return String(fieldValue || '').toLowerCase().startsWith(String(expectedValue || '').toLowerCase());
      
      case 'ends_with':
        return String(fieldValue || '').toLowerCase().endsWith(String(expectedValue || '').toLowerCase());
      
      case 'in_list':
        return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
      
      case 'not_in_list':
        return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue);
      
      case 'matches_pattern':
        try {
          const regex = new RegExp(expectedValue);
          return regex.test(String(fieldValue || ''));
        } catch {
          return false;
        }
      
      default:
        if (debug) {
          console.warn(`Unknown operator: ${operator}`);
        }
        return false;
    }
  }, [debug]);

  // Process all conditional rules for current form data
  const processConditionalRules = useCallback(() => {
    const newVisibleFields = new Set();
    const newRequiredFields = new Set();
    const newFieldModifications = {};

    fields.forEach(field => {
      const fieldName = field.name;
      let isVisible = true;
      let isRequired = field.required || false;
      let modifications = {};

      // Process visibility conditions
      if (field.conditions?.visibility) {
        isVisible = evaluateCondition(field.conditions.visibility, formData);
      }

      // Process required conditions
      if (field.conditions?.required) {
        const conditionallyRequired = evaluateCondition(field.conditions.required, formData);
        isRequired = field.required || conditionallyRequired;
      }

      // Process other conditional modifications
      if (field.conditions?.modifications) {
        field.conditions.modifications.forEach(modification => {
          if (evaluateCondition(modification.condition, formData)) {
            modifications = { ...modifications, ...modification.changes };
          }
        });
      }

      // Apply results
      if (isVisible) {
        newVisibleFields.add(fieldName);
      }

      if (isRequired) {
        newRequiredFields.add(fieldName);
      }

      if (Object.keys(modifications).length > 0) {
        newFieldModifications[fieldName] = modifications;
      }

      if (debug) {
        console.log(`Field ${fieldName}: visible=${isVisible}, required=${isRequired}`, modifications);
      }
    });

    setVisibleFields(newVisibleFields);
    setRequiredFields(newRequiredFields);
    setFieldModifications(newFieldModifications);
  }, [fields, formData, evaluateCondition, debug]);

  // Re-evaluate when form data or fields change
  useEffect(() => {
    processConditionalRules();
  }, [processConditionalRules]);

  // Get visibility status for a field
  const isFieldVisible = useCallback((fieldName) => {
    return visibleFields.has(fieldName);
  }, [visibleFields]);

  // Get required status for a field
  const isFieldRequired = useCallback((fieldName) => {
    return requiredFields.has(fieldName);
  }, [requiredFields]);

  // Get modifications for a field
  const getFieldModifications = useCallback((fieldName) => {
    return fieldModifications[fieldName] || {};
  }, [fieldModifications]);

  // Get modified field configuration
  const getModifiedField = useCallback((field) => {
    const fieldName = field.name;
    const modifications = getFieldModifications(fieldName);
    
    return {
      ...field,
      required: isFieldRequired(fieldName),
      visible: isFieldVisible(fieldName),
      ...modifications
    };
  }, [getFieldModifications, isFieldRequired, isFieldVisible]);

  // Get all visible fields
  const getVisibleFields = useCallback(() => {
    return fields.filter(field => isFieldVisible(field.name));
  }, [fields, isFieldVisible]);

  // Get all required fields
  const getRequiredFields = useCallback(() => {
    return fields.filter(field => isFieldRequired(field.name));
  }, [fields, isFieldRequired]);

  // Validate conditional dependencies
  const validateDependencies = useCallback(() => {
    const errors = [];
    const processedFields = new Set();

    const checkCircularDependency = (field, path = []) => {
      if (path.includes(field.name)) {
        errors.push(`Circular dependency detected: ${path.join(' -> ')} -> ${field.name}`);
        return;
      }

      if (processedFields.has(field.name)) {
        return;
      }

      processedFields.add(field.name);

      // Check all conditions for dependent fields
      const conditions = [
        field.conditions?.visibility,
        field.conditions?.required,
        ...(field.conditions?.modifications?.map(mod => mod.condition) || [])
      ].filter(Boolean);

      conditions.forEach(condition => {
        const dependentFields = extractFieldNames(condition);
        dependentFields.forEach(depFieldName => {
          const depField = fields.find(f => f.name === depFieldName);
          if (depField) {
            checkCircularDependency(depField, [...path, field.name]);
          }
        });
      });
    };

    fields.forEach(field => {
      if (field.conditions) {
        checkCircularDependency(field);
      }
    });

    return errors;
  }, [fields]);

  // Extract field names from conditions
  const extractFieldNames = useCallback((condition) => {
    const fieldNames = [];

    if (condition?.field) {
      fieldNames.push(condition.field);
    }

    if (condition?.conditions && Array.isArray(condition.conditions)) {
      condition.conditions.forEach(subCondition => {
        fieldNames.push(...extractFieldNames(subCondition));
      });
    }

    return fieldNames;
  }, []);

  // Get dependency map
  const getDependencyMap = useMemo(() => {
    const dependencyMap = {};

    fields.forEach(field => {
      const dependencies = [];

      if (field.conditions) {
        const conditions = [
          field.conditions.visibility,
          field.conditions.required,
          ...(field.conditions.modifications?.map(mod => mod.condition) || [])
        ].filter(Boolean);

        conditions.forEach(condition => {
          dependencies.push(...extractFieldNames(condition));
        });
      }

      if (dependencies.length > 0) {
        dependencyMap[field.name] = [...new Set(dependencies)];
      }
    });

    return dependencyMap;
  }, [fields, extractFieldNames]);

  return {
    // State
    visibleFields: Array.from(visibleFields),
    requiredFields: Array.from(requiredFields),
    fieldModifications,
    
    // Functions
    isFieldVisible,
    isFieldRequired,
    getFieldModifications,
    getModifiedField,
    getVisibleFields,
    getRequiredFields,
    evaluateCondition,
    processConditionalRules,
    
    // Utilities
    validateDependencies,
    getDependencyMap
  };
};

/**
 * Hook for managing field dependencies and cascading updates
 * @param {Array} fields - Form fields
 * @param {Object} formData - Current form data
 * @param {Function} updateFormData - Function to update form data
 * @returns {Object} - Dependency management functions
 */
export const useFieldDependencies = (fields, formData, updateFormData) => {
  const [dependentUpdates, setDependentUpdates] = useState({});

  // Get fields that depend on a specific field
  const getDependentFields = useCallback((fieldName) => {
    return fields.filter(field => {
      if (!field.conditions) return false;

      const allConditions = [
        field.conditions.visibility,
        field.conditions.required,
        ...(field.conditions.modifications?.map(mod => mod.condition) || [])
      ].filter(Boolean);

      return allConditions.some(condition => {
        const dependencyFields = extractFieldDependencies(condition);
        return dependencyFields.includes(fieldName);
      });
    });
  }, [fields]);

  // Extract field dependencies from a condition
  const extractFieldDependencies = useCallback((condition) => {
    const dependencies = [];

    if (condition?.field) {
      dependencies.push(condition.field);
    }

    if (condition?.conditions && Array.isArray(condition.conditions)) {
      condition.conditions.forEach(subCondition => {
        dependencies.push(...extractFieldDependencies(subCondition));
      });
    }

    return dependencies;
  }, []);

  // Handle cascading updates when a field value changes
  const handleFieldChange = useCallback((fieldName, newValue) => {
    const dependentFields = getDependentFields(fieldName);
    const updates = {};

    dependentFields.forEach(field => {
      // If a field becomes invisible, clear its value
      if (field.conditions?.visibility) {
        const testData = { ...formData, [fieldName]: newValue };
        // This would need the conditional logic evaluation
        // For now, we'll just track that an update is needed
        updates[field.name] = { needsUpdate: true, reason: 'visibility_change' };
      }

      // Handle other dependency scenarios
      if (field.conditions?.required) {
        updates[field.name] = { 
          ...updates[field.name], 
          needsUpdate: true, 
          reason: 'required_change' 
        };
      }
    });

    setDependentUpdates(updates);

    // Apply any necessary data updates
    const dataUpdates = {};
    Object.keys(updates).forEach(dependentFieldName => {
      const update = updates[dependentFieldName];
      if (update.reason === 'visibility_change') {
        // Clear value if field becomes invisible
        dataUpdates[dependentFieldName] = null;
      }
    });

    if (Object.keys(dataUpdates).length > 0) {
      updateFormData(prev => ({ ...prev, ...dataUpdates }));
    }
  }, [getDependentFields, formData, updateFormData]);

  return {
    dependentUpdates,
    getDependentFields,
    handleFieldChange
  };
};

/**
 * Hook for conditional field groups and sections
 * @param {Array} sections - Form sections with conditions
 * @param {Object} formData - Current form data
 * @returns {Object} - Section visibility state
 */
export const useConditionalSections = (sections = [], formData = {}) => {
  const [visibleSections, setVisibleSections] = useState(new Set());

  const { evaluateCondition } = useConditionalLogic([], formData);

  // Process section visibility
  useEffect(() => {
    const newVisibleSections = new Set();

    sections.forEach(section => {
      let isVisible = true;

      if (section.conditions?.visibility) {
        isVisible = evaluateCondition(section.conditions.visibility, formData);
      }

      if (isVisible) {
        newVisibleSections.add(section.id);
      }
    });

    setVisibleSections(newVisibleSections);
  }, [sections, formData, evaluateCondition]);

  const isSectionVisible = useCallback((sectionId) => {
    return visibleSections.has(sectionId);
  }, [visibleSections]);

  const getVisibleSections = useCallback(() => {
    return sections.filter(section => isSectionVisible(section.id));
  }, [sections, isSectionVisible]);

  return {
    visibleSections: Array.from(visibleSections),
    isSectionVisible,
    getVisibleSections
  };
};

export default useConditionalLogic;