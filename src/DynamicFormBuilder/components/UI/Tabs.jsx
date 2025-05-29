// components/UI/Tabs.jsx
import React, { useState, createContext, useContext } from 'react';

const TabsContext = createContext();

const Tabs = ({
  children,
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  variant = 'default',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue || '');
  
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : activeTab;

  const handleTabChange = (newValue) => {
    if (!isControlled) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  const orientationClasses = {
    horizontal: 'flex flex-col',
    vertical: 'flex flex-row'
  };

  return (
    <TabsContext.Provider
      value={{
        currentValue,
        onValueChange: handleTabChange,
        orientation,
        variant
      }}
    >
      <div className={`${orientationClasses[orientation]} ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className = '' }) => {
  const { orientation, variant } = useContext(TabsContext);

  const orientationClasses = {
    horizontal: 'flex border-b border-gray-200',
    vertical: 'flex flex-col border-r border-gray-200 min-w-[200px]'
  };

  const variantClasses = {
    default: '',
    pills: orientation === 'horizontal' ? 'bg-gray-100 p-1 rounded-lg border-0' : 'space-y-1 border-0',
    underline: 'border-b-2 border-gray-200'
  };

  return (
    <div
      className={`
        ${orientationClasses[orientation]}
        ${variantClasses[variant]}
        ${className}
      `}
      role="tablist"
      aria-orientation={orientation}
    >
      {children}
    </div>
  );
};

const TabsTrigger = ({
  children,
  value,
  disabled = false,
  className = '',
  icon = null,
  badge = null
}) => {
  const { currentValue, onValueChange, orientation, variant } = useContext(TabsContext);
  const isActive = currentValue === value;

  const baseClasses = `
    inline-flex items-center justify-center whitespace-nowrap px-3 py-2 text-sm font-medium
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const getVariantClasses = () => {
    switch (variant) {
      case 'pills':
        return isActive
          ? 'bg-white text-gray-900 shadow-sm rounded-md'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md';
      
      case 'underline':
        return isActive
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300';
      
      default:
        return isActive
          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
          : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300';
    }
  };

  const orientationClasses = {
    horizontal: '',
    vertical: 'w-full justify-start'
  };

  const handleClick = () => {
    if (!disabled && value) {
      onValueChange(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        ${baseClasses}
        ${getVariantClasses()}
        ${orientationClasses[orientation]}
        ${className}
      `}
    >
      {icon && (
        <span className="mr-2">
          {React.isValidElement(icon) ? (
            React.cloneElement(icon, { className: 'h-4 w-4' })
          ) : (
            icon
          )}
        </span>
      )}
      
      {children}
      
      {badge && (
        <span className="ml-2">
          {badge}
        </span>
      )}
    </button>
  );
};

const TabsContent = ({
  children,
  value,
  className = '',
  forceMount = false
}) => {
  const { currentValue } = useContext(TabsContext);
  const isActive = currentValue === value;

  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <div
      id={`tabpanel-${value}`}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      className={`
        focus:outline-none
        ${!isActive && forceMount ? 'hidden' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Preset tab configurations
export const FormTabs = ({ children, ...props }) => (
  <Tabs variant="default" {...props}>
    {children}
  </Tabs>
);

export const PillTabs = ({ children, ...props }) => (
  <Tabs variant="pills" {...props}>
    {children}
  </Tabs>
);

export const UnderlineTabs = ({ children, ...props }) => (
  <Tabs variant="underline" {...props}>
    {children}
  </Tabs>
);

export const VerticalTabs = ({ children, ...props }) => (
  <Tabs orientation="vertical" {...props}>
    {children}
  </Tabs>
);

// Complete tabs component with sub-components
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export { TabsList, TabsTrigger, TabsContent };
export default Tabs;