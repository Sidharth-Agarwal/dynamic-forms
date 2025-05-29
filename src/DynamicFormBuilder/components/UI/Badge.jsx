// components/UI/Badge.jsx
import React from 'react';

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = 'md',
  className = '',
  onClick,
  removable = false,
  onRemove,
  icon = null,
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-sm'
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800 border border-blue-200',
    secondary: 'bg-gray-100 text-gray-800 border border-gray-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    purple: 'bg-purple-100 text-purple-800 border border-purple-200',
    pink: 'bg-pink-100 text-pink-800 border border-pink-200',
    indigo: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    dark: 'bg-gray-800 text-white border border-gray-800',
    light: 'bg-white text-gray-800 border border-gray-300'
  };

  const solidVariantClasses = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-600 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-600 text-white',
    info: 'bg-cyan-600 text-white',
    purple: 'bg-purple-600 text-white',
    pink: 'bg-pink-600 text-white',
    indigo: 'bg-indigo-600 text-white',
    dark: 'bg-gray-800 text-white',
    light: 'bg-gray-100 text-gray-800'
  };

  const baseClasses = `
    inline-flex items-center font-medium
    ${sizeClasses[size]}
    ${roundedClasses[rounded]}
    ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
  `;

  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <span
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {icon && (
        <span className="mr-1">
          {React.isValidElement(icon) ? (
            React.cloneElement(icon, { className: 'h-3 w-3' })
          ) : (
            icon
          )}
        </span>
      )}
      
      {children}
      
      {removable && (
        <button
          type="button"
          className="ml-1 -mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-current hover:bg-opacity-20 focus:outline-none"
          onClick={handleRemove}
        >
          <span className="sr-only">Remove</span>
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};

// Solid variant badge
export const SolidBadge = ({ variant = 'primary', ...props }) => {
  const solidVariantClasses = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-600 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-600 text-white',
    info: 'bg-cyan-600 text-white',
    purple: 'bg-purple-600 text-white',
    pink: 'bg-pink-600 text-white',
    indigo: 'bg-indigo-600 text-white',
    dark: 'bg-gray-800 text-white',
    light: 'bg-gray-100 text-gray-800'
  };

  return (
    <Badge
      {...props}
      className={`${solidVariantClasses[variant]} border-transparent ${props.className || ''}`}
    />
  );
};

// Status badges with predefined styles
export const StatusBadge = ({ status, ...props }) => {
  const statusConfig = {
    active: { variant: 'success', children: 'Active' },
    inactive: { variant: 'secondary', children: 'Inactive' },
    pending: { variant: 'warning', children: 'Pending' },
    draft: { variant: 'secondary', children: 'Draft' },
    published: { variant: 'success', children: 'Published' },
    archived: { variant: 'secondary', children: 'Archived' },
    completed: { variant: 'success', children: 'Completed' },
    failed: { variant: 'danger', children: 'Failed' },
    processing: { variant: 'info', children: 'Processing' }
  };

  const config = statusConfig[status] || { variant: 'secondary', children: status };

  return <Badge {...config} {...props} />;
};

// Count badge (typically used for notifications)
export const CountBadge = ({ count, max = 99, ...props }) => {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <Badge
      variant="danger"
      size="xs"
      rounded="full"
      className="font-semibold min-w-[1.25rem] text-center"
      {...props}
    >
      {displayCount}
    </Badge>
  );
};

// Dot badge (small indicator)
export const DotBadge = ({ variant = 'primary', className = '', ...props }) => (
  <span
    className={`
      inline-block w-2 h-2 rounded-full
      ${variant === 'primary' ? 'bg-blue-600' : ''}
      ${variant === 'success' ? 'bg-green-600' : ''}
      ${variant === 'warning' ? 'bg-yellow-500' : ''}
      ${variant === 'danger' ? 'bg-red-600' : ''}
      ${variant === 'secondary' ? 'bg-gray-400' : ''}
      ${className}
    `}
    {...props}
  />
);

// Tag-style badge (for categories, tags, etc.)
export const TagBadge = ({ children, onRemove, ...props }) => (
  <Badge
    variant="secondary"
    size="sm"
    rounded="md"
    removable={!!onRemove}
    onRemove={onRemove}
    className="mr-1 mb-1"
    {...props}
  >
    {children}
  </Badge>
);

export default Badge;