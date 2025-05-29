// components/UI/Dropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Dropdown = ({
  trigger,
  children,
  placement = 'bottom-start',
  offset = 8,
  closeOnSelect = true,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const placementClasses = {
    'top-start': 'bottom-full left-0 mb-2',
    'top-end': 'bottom-full right-0 mb-2',
    'bottom-start': 'top-full left-0 mt-2',
    'bottom-end': 'top-full right-0 mt-2',
    'left-start': 'right-full top-0 mr-2',
    'left-end': 'right-full bottom-0 mr-2',
    'right-start': 'left-full top-0 ml-2',
    'right-end': 'left-full bottom-0 ml-2'
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = () => {
    if (closeOnSelect) {
      setIsOpen(false);
    }
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onSelect: handleItemClick
      });
    }
    return child;
  });

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <div ref={triggerRef} onClick={handleTriggerClick}>
        {trigger}
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute z-50 min-w-[160px] bg-white border border-gray-200 rounded-md shadow-lg
            ${placementClasses[placement]}
          `}
          style={{ transform: `translateY(${offset}px)` }}
        >
          <div className="py-1">
            {childrenWithProps}
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({
  children,
  onClick,
  onSelect,
  disabled = false,
  icon = null,
  shortcut = null,
  selected = false,
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'text-gray-700 hover:bg-gray-100',
    danger: 'text-red-700 hover:bg-red-50'
  };

  const handleClick = (e) => {
    if (!disabled) {
      onClick?.(e);
      onSelect?.();
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`
        w-full text-left px-4 py-2 text-sm flex items-center justify-between
        transition-colors duration-150
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <div className="flex items-center">
        {icon && (
          <span className="mr-3">
            {React.isValidElement(icon) ? (
              React.cloneElement(icon, { className: 'h-4 w-4' })
            ) : (
              icon
            )}
          </span>
        )}
        <span>{children}</span>
        {selected && (
          <Check className="h-4 w-4 ml-2 text-blue-600" />
        )}
      </div>
      {shortcut && (
        <span className="text-xs text-gray-400 ml-4">{shortcut}</span>
      )}
    </button>
  );
};

const DropdownSeparator = ({ className = '' }) => (
  <div className={`border-t border-gray-200 my-1 ${className}`} />
);

const DropdownLabel = ({ children, className = '' }) => (
  <div className={`px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </div>
);

// Preset dropdown components
export const ActionDropdown = ({
  trigger,
  actions = [],
  onAction,
  ...props
}) => (
  <Dropdown trigger={trigger} {...props}>
    {actions.map((action, index) => (
      <React.Fragment key={action.key || index}>
        {action.type === 'separator' ? (
          <DropdownSeparator />
        ) : action.type === 'label' ? (
          <DropdownLabel>{action.label}</DropdownLabel>
        ) : (
          <DropdownItem
            icon={action.icon}
            variant={action.variant}
            disabled={action.disabled}
            onClick={() => onAction?.(action)}
          >
            {action.label}
          </DropdownItem>
        )}
      </React.Fragment>
    ))}
  </Dropdown>
);

export const SelectDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  className = ''
}) => {
  const selectedOption = options.find(opt => opt.value === value);

  const trigger = (
    <button
      type="button"
      disabled={disabled}
      className={`
        w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md
        bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
        {selectedOption ? selectedOption.label : placeholder}
      </span>
      <ChevronDown className="h-4 w-4 text-gray-400" />
    </button>
  );

  return (
    <Dropdown trigger={trigger} disabled={disabled}>
      {options.map((option) => (
        <DropdownItem
          key={option.value}
          selected={option.value === value}
          disabled={option.disabled}
          onClick={() => onChange?.(option.value)}
        >
          {option.label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
};

export const MenuDropdown = ({
  trigger,
  menuItems = [],
  ...props
}) => (
  <ActionDropdown
    trigger={trigger}
    actions={menuItems}
    onAction={(item) => item.action?.()}
    {...props}
  />
);

// Assign sub-components
Dropdown.Item = DropdownItem;
Dropdown.Separator = DropdownSeparator;
Dropdown.Label = DropdownLabel;

export { DropdownItem, DropdownSeparator, DropdownLabel };
export default Dropdown;