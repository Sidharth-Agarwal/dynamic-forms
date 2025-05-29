// components/FieldTypes/index.js
export { default as TextInput, TextInputConfig } from './TextInput';
export { default as TextArea, TextAreaConfig } from './TextArea';
export { default as EmailInput, EmailInputConfig } from './EmailInput';
export { default as NumberInput, NumberInputConfig } from './NumberInput';
export { default as SelectField, SelectFieldConfig } from './SelectField';
export { default as RadioGroup, RadioGroupConfig } from './RadioGroup';
export { default as CheckboxGroup, CheckboxGroupConfig } from './CheckboxGroup';
export { default as FileUpload, FileUploadConfig } from './FileUpload';

// Field type mapping for dynamic rendering
export const FIELD_COMPONENTS = {
  text: TextInput,
  textarea: TextArea,
  email: EmailInput,
  number: NumberInput,
  select: SelectField,
  radio: RadioGroup,
  checkbox: CheckboxGroup,
  file: FileUpload
};

// Config components mapping for form builder
export const FIELD_CONFIG_COMPONENTS = {
  text: TextInputConfig,
  textarea: TextAreaConfig,
  email: EmailInputConfig,
  number: NumberInputConfig,
  select: SelectFieldConfig,
  radio: RadioGroupConfig,
  checkbox: CheckboxGroupConfig,
  file: FileUploadConfig
};

// Helper function to get field component
export const getFieldComponent = (fieldType) => {
  return FIELD_COMPONENTS[fieldType] || TextInput;
};

// Helper function to get field config component
export const getFieldConfigComponent = (fieldType) => {
  return FIELD_CONFIG_COMPONENTS[fieldType] || TextInputConfig;
};

// Generic field renderer component
export const FieldRenderer = ({ field, ...props }) => {
  const FieldComponent = getFieldComponent(field.type);
  return <FieldComponent field={field} {...props} />;
};

// Generic field config renderer component
export const FieldConfigRenderer = ({ field, ...props }) => {
  const ConfigComponent = getFieldConfigComponent(field.type);
  return <ConfigComponent field={field} {...props} />;
};