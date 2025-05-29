// components/UI/Card.jsx
import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  rounded = 'md',
  background = 'white',
  hover = false,
  onClick,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl'
  };

  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50',
    transparent: 'bg-transparent'
  };

  const baseClasses = `
    ${backgroundClasses[background]}
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${roundedClasses[rounded]}
    ${border ? 'border border-gray-200' : ''}
    ${hover ? 'transition-shadow duration-200 hover:shadow-lg' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  return (
    <div
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header component
export const CardHeader = ({
  children,
  className = '',
  border = true,
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  };

  return (
    <div
      className={`
        ${paddingClasses[padding]}
        ${border ? 'border-b border-gray-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Card Body component
export const CardBody = ({
  children,
  className = '',
  padding = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={`${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

// Card Footer component
export const CardFooter = ({
  children,
  className = '',
  border = true,
  padding = 'md',
  justify = 'end'
}) => {
  const paddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div
      className={`
        flex items-center
        ${paddingClasses[padding]}
        ${justifyClasses[justify]}
        ${border ? 'border-t border-gray-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Preset card variants
export const FormCard = ({ children, className = '', ...props }) => (
  <Card
    className={`max-w-2xl mx-auto ${className}`}
    shadow="lg"
    padding="lg"
    {...props}
  >
    {children}
  </Card>
);

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendDirection = 'up',
  className = ''
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card className={`${className}`} hover>
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-1 text-sm ${trendColors[trendDirection]}`}>
              <span>{trend}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              {React.isValidElement(icon) ? (
                React.cloneElement(icon, { className: 'h-6 w-6 text-blue-600' })
              ) : (
                <span className="h-6 w-6 text-blue-600">{icon}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export const FeatureCard = ({
  title,
  description,
  icon,
  action,
  className = ''
}) => (
  <Card className={`text-center ${className}`} hover>
    {icon && (
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          {React.isValidElement(icon) ? (
            React.cloneElement(icon, { className: 'h-8 w-8 text-blue-600' })
          ) : (
            <span className="h-8 w-8 text-blue-600">{icon}</span>
          )}
        </div>
      </div>
    )}
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    {action && <div>{action}</div>}
  </Card>
);

export default Card;