/**
 * Button Component
 * Reusable button component with multiple variants and states
 */

import React, { forwardRef } from 'react';
import { uiUtils } from '../../utils/index.js';
import { COMPONENT_STYLES } from '../../config/index.js';

const Button = forwardRef(({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
  onFocus,
  onBlur,
  className = '',
  style = {},
  icon = null,
  iconPosition = 'left', // 'left' | 'right'
  loadingText = 'Loading...',
  theme = 'default',
  ...rest
}, ref) => {

  // Base button styles
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 focus:ring-gray-500 border border-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500 shadow-sm hover:shadow-md',
    success: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white focus:ring-green-500 shadow-sm hover:shadow-md',
    warning: 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white focus:ring-yellow-500 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-600 hover:text-gray-900 focus:ring-gray-500',
    outline: 'bg-transparent hover:bg-blue-50 active:bg-blue-100 text-blue-600 border-2 border-blue-600 hover:border-blue-700 focus:ring-blue-500'
  };

  // Size styles
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs min-h-[24px]',
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-base min-h-[40px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
    xl: 'px-8 py-4 text-xl min-h-[56px]'
  };

  // Icon sizes based on button size
  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7'
  };

  // Loading spinner sizes
  const spinnerSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  };

  // Generate button classes
  const buttonClasses = uiUtils.generateClasses(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    loading && 'cursor-wait',
    className
  );

  // Handle click events
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  // Loading spinner component
  const LoadingSpinner = ({ size: spinnerSize }) => (
    <svg 
      className={uiUtils.generateClasses(
        'animate-spin',
        spinnerSizes[spinnerSize]
      )} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Icon component
  const IconComponent = ({ iconData, position }) => {
    if (!iconData) return null;

    // Handle different icon types
    if (typeof iconData === 'string') {
      // Assume it's an emoji or text
      return (
        <span className={uiUtils.generateClasses(
          position === 'left' ? 'mr-2' : 'ml-2'
        )}>
          {iconData}
        </span>
      );
    }

    if (React.isValidElement(iconData)) {
      // React element (e.g., Lucide React icon)
      return React.cloneElement(iconData, {
        className: uiUtils.generateClasses(
          iconSizes[size],
          position === 'left' ? 'mr-2' : 'ml-2',
          iconData.props.className
        )
      });
    }

    return null;
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      onFocus={onFocus}
      onBlur={onBlur}
      className={buttonClasses}
      style={style}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {/* Loading state */}
      {loading && (
        <>
          <LoadingSpinner size={size} />
          <span className="ml-2">
            {loadingText || children}
          </span>
        </>
      )}

      {/* Normal state */}
      {!loading && (
        <>
          {/* Left icon */}
          {icon && iconPosition === 'left' && (
            <IconComponent iconData={icon} position="left" />
          )}

          {/* Button content */}
          <span>{children}</span>

          {/* Right icon */}
          {icon && iconPosition === 'right' && (
            <IconComponent iconData={icon} position="right" />
          )}
        </>
      )}
    </button>
  );
});

// Button group component for related buttons
export const ButtonGroup = ({ 
  children, 
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  spacing = 'md', // 'sm' | 'md' | 'lg'
  className = '' 
}) => {
  const spacingClasses = {
    horizontal: {
      sm: 'space-x-2',
      md: 'space-x-3',
      lg: 'space-x-4'
    },
    vertical: {
      sm: 'space-y-2',
      md: 'space-y-3',
      lg: 'space-y-4'
    }
  };

  const orientationClasses = {
    horizontal: 'flex items-center',
    vertical: 'flex flex-col'
  };

  return (
    <div className={uiUtils.generateClasses(
      orientationClasses[orientation],
      spacingClasses[orientation][spacing],
      className
    )}>
      {children}
    </div>
  );
};

// Icon button component for icon-only buttons
export const IconButton = forwardRef(({
  icon,
  'aria-label': ariaLabel,
  tooltip,
  size = 'md',
  variant = 'ghost',
  ...props
}, ref) => {
  const iconButtonSizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4'
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      className={uiUtils.generateClasses(
        iconButtonSizes[size],
        '!min-h-0 rounded-full'
      )}
      aria-label={ariaLabel}
      title={tooltip || ariaLabel}
      {...props}
    >
      {typeof icon === 'string' ? (
        <span className="text-current">{icon}</span>
      ) : (
        React.cloneElement(icon, {
          className: uiUtils.generateClasses(
            'h-5 w-5',
            icon.props?.className
          )
        })
      )}
    </Button>
  );
});

// Preset button components for common actions
export const SaveButton = (props) => (
  <Button variant="primary" icon="💾" {...props}>
    Save
  </Button>
);

export const CancelButton = (props) => (
  <Button variant="secondary" {...props}>
    Cancel
  </Button>
);

export const DeleteButton = (props) => (
  <Button variant="danger" icon="🗑️" {...props}>
    Delete
  </Button>
);

export const AddButton = (props) => (
  <Button variant="primary" icon="+" {...props}>
    Add
  </Button>
);

export const EditButton = (props) => (
  <Button variant="secondary" icon="✏️" {...props}>
    Edit
  </Button>
);

export const ViewButton = (props) => (
  <Button variant="ghost" icon="👁️" {...props}>
    View
  </Button>
);

export const DownloadButton = (props) => (
  <Button variant="outline" icon="⬇️" {...props}>
    Download
  </Button>
);

export const SubmitButton = (props) => (
  <Button type="submit" variant="primary" {...props}>
    Submit
  </Button>
);

// Default props
Button.defaultProps = {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
  type: 'button',
  iconPosition: 'left',
  theme: 'default'
};

ButtonGroup.defaultProps = {
  orientation: 'horizontal',
  spacing: 'md'
};

IconButton.defaultProps = {
  size: 'md',
  variant: 'ghost'
};

// Display names for React DevTools
Button.displayName = 'Button';
ButtonGroup.displayName = 'ButtonGroup';
IconButton.displayName = 'IconButton';

export default Button;