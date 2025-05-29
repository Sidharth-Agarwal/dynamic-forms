// components/Renderer/ConditionalRenderer.jsx
import React, { useMemo } from 'react';
import { AnimatedFormField } from './FormField';

const ConditionalRenderer = ({
  fields = [],
  formData = {},
  conditionalLogic = null,
  renderField,
  animateTransitions = true,
  groupBySection = false,
  className = ''
}) => {
  // Process fields with conditional logic
  const processedFields = useMemo(() => {
    if (!conditionalLogic) {
      return fields.map(field => ({ ...field, visible: true }));
    }

    return fields.map(field => {
      const isVisible = conditionalLogic.isFieldVisible(field.name);
      const isRequired = conditionalLogic.isFieldRequired(field.name);
      const modifications = conditionalLogic.getFieldModifications(field.name);

      return {
        ...field,
        ...modifications,
        visible: isVisible,
        required: isRequired,
        _conditionalState: {
          originalRequired: field.required,
          conditionallyRequired: isRequired !== field.required,
          hasModifications: Object.keys(modifications).length > 0
        }
      };
    });
  }, [fields, conditionalLogic]);

  // Filter only visible fields
  const visibleFields = useMemo(() => {
    return processedFields.filter(field => field.visible !== false);
  }, [processedFields]);

  // Group fields by section if enabled
  const groupedFields = useMemo(() => {
    if (!groupBySection) {
      return { default: visibleFields };
    }

    const groups = {};
    visibleFields.forEach(field => {
      const section = field.section || 'default';
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(field);
    });

    return groups;
  }, [visibleFields, groupBySection]);

  // Default field renderer
  const defaultRenderField = (field) => {
    if (animateTransitions) {
      return (
        <AnimatedFormField
          key={field.id}
          field={field}
          animationType="slideIn"
          duration={200}
        />
      );
    }

    return renderField ? renderField(field) : <div key={field.id}>Field: {field.label}</div>;
  };

  // Render grouped fields
  if (groupBySection) {
    return (
      <div className={`conditional-renderer conditional-renderer--grouped ${className}`}>
        {Object.entries(groupedFields).map(([sectionName, sectionFields]) => (
          <FieldSection
            key={sectionName}
            name={sectionName}
            fields={sectionFields}
            renderField={renderField || defaultRenderField}
            className="mb-8"
          />
        ))}
      </div>
    );
  }

  // Render flat field list
  return (
    <div className={`conditional-renderer ${className}`}>
      {visibleFields.map(field => 
        renderField ? renderField(field) : defaultRenderField(field)
      )}
    </div>
  );
};

// Field Section Component
const FieldSection = ({
  name,
  fields = [],
  renderField,
  title = null,
  description = null,
  collapsible = false,
  defaultExpanded = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  
  if (fields.length === 0) return null;

  const sectionTitle = title || (name !== 'default' ? name : null);

  return (
    <div className={`field-section ${className}`}>
      {sectionTitle && (
        <div className="field-section__header mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {sectionTitle}
              </h3>
              {description && (
                <p className="text-sm text-gray-600 mt-1">
                  {description}
                </p>
              )}
            </div>
            {collapsible && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-expanded={isExpanded}
              >
                <svg 
                  className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          <div className="border-b border-gray-200 mt-2" />
        </div>
      )}

      {(!collapsible || isExpanded) && (
        <div className="field-section__content space-y-6">
          {fields.map(field => renderField(field))}
        </div>
      )}
    </div>
  );
};

// Conditional Field Wrapper
export const ConditionalField = ({
  field,
  formData = {},
  conditionalLogic = null,
  children,
  fallback = null,
  showTransition = true
}) => {
  const isVisible = conditionalLogic 
    ? conditionalLogic.isFieldVisible(field.name)
    : field.visible !== false;

  if (!isVisible) {
    return fallback;
  }

  if (showTransition) {
    return (
      <div className="conditional-field transition-all duration-300 ease-in-out">
        {children}
      </div>
    );
  }

  return <div className="conditional-field">{children}</div>;
};

// Advanced Conditional Renderer with Dependencies
export const DependencyAwareRenderer = ({
  fields = [],
  formData = {},
  conditionalLogic = null,
  renderField,
  onFieldVisibilityChange = null,
  className = ''
}) => {
  const [previousVisibleFields, setPreviousVisibleFields] = React.useState(new Set());

  // Track visibility changes
  React.useEffect(() => {
    if (!conditionalLogic) return;

    const currentVisibleFields = new Set(
      fields
        .filter(field => conditionalLogic.isFieldVisible(field.name))
        .map(field => field.name)
    );

    // Detect changes
    const newlyVisible = [...currentVisibleFields].filter(
      fieldName => !previousVisibleFields.has(fieldName)
    );
    
    const newlyHidden = [...previousVisibleFields].filter(
      fieldName => !currentVisibleFields.has(fieldName)
    );

    if (newlyVisible.length > 0 || newlyHidden.length > 0) {
      onFieldVisibilityChange?.({
        visible: newlyVisible,
        hidden: newlyHidden,
        allVisible: [...currentVisibleFields]
      });
    }

    setPreviousVisibleFields(currentVisibleFields);
  }, [fields, formData, conditionalLogic, previousVisibleFields, onFieldVisibilityChange]);

  return (
    <ConditionalRenderer
      fields={fields}
      formData={formData}
      conditionalLogic={conditionalLogic}
      renderField={renderField}
      className={className}
    />
  );
};

// Debug Component for Development
export const ConditionalLogicDebugger = ({
  fields = [],
  formData = {},
  conditionalLogic = null,
  className = ''
}) => {
  if (process.env.NODE_ENV !== 'development' || !conditionalLogic) {
    return null;
  }

  const dependencies = conditionalLogic.getDependencyMap();
  const validationErrors = conditionalLogic.validateDependencies();

  return (
    <div className={`conditional-logic-debugger bg-gray-100 p-4 rounded-lg text-xs ${className}`}>
      <h4 className="font-semibold text-gray-900 mb-2">Conditional Logic Debug</h4>
      
      {/* Dependencies */}
      <div className="mb-3">
        <h5 className="font-medium text-gray-700">Dependencies:</h5>
        <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
          {JSON.stringify(dependencies, null, 2)}
        </pre>
      </div>

      {/* Field States */}
      <div className="mb-3">
        <h5 className="font-medium text-gray-700">Field States:</h5>
        <div className="space-y-1 mt-1">
          {fields.map(field => (
            <div key={field.name} className="flex justify-between text-xs">
              <span>{field.name}:</span>
              <span className={
                conditionalLogic.isFieldVisible(field.name) 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }>
                {conditionalLogic.isFieldVisible(field.name) ? 'visible' : 'hidden'}
                {conditionalLogic.isFieldRequired(field.name) && ' (required)'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div>
          <h5 className="font-medium text-red-700">Validation Errors:</h5>
          <ul className="text-red-600 mt-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConditionalRenderer;