// components/UI/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({
  size = 'md',
  color = 'blue',
  text = '',
  overlay = false,
  className = ''
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    white: 'text-white'
  };

  const spinner = (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        xmlns="http://www.w3.org/2000/svg"
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
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text && (
        <span className={`mt-2 text-sm ${colorClasses[color]}`}>
          {text}
        </span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Preset loading states
export const PageLoader = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="xl" text={text} />
  </div>
);

export const ButtonLoader = ({ size = 'sm' }) => (
  <LoadingSpinner size={size} color="white" />
);

export const SectionLoader = ({ text = 'Loading...', className = '' }) => (
  <div className={`flex items-center justify-center py-12 ${className}`}>
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export const InlineLoader = ({ size = 'sm', className = '' }) => (
  <LoadingSpinner size={size} className={`inline-block ${className}`} />
);

export default LoadingSpinner;