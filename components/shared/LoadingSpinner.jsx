/**
 * LoadingSpinner Component
 * Reusable loading indicators with multiple variants
 */

import React from 'react';
import { uiUtils } from '../../utils/index.js';

const LoadingSpinner = ({
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant = 'spinner', // 'spinner' | 'dots' | 'pulse' | 'bars' | 'circle'
  color = 'blue', // 'blue' | 'gray' | 'white' | 'green' | 'red'
  text,
  fullScreen = false,
  overlay = false,
  className = '',
  style = {},
  theme = 'default'
}) => {
  // Size configurations
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  // Color configurations
  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600'
  };

  // Spinner variants
  const SpinnerVariant = () => (
    <svg 
      className={uiUtils.generateClasses(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color]
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

  const DotsVariant = () => {
    const dotSize = {
      xs: 'h-1 w-1',
      sm: 'h-1.5 w-1.5',
      md: 'h-2 w-2',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4'
    };

    return (
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={uiUtils.generateClasses(
              'rounded-full animate-pulse',
              dotSize[size],
              colorClasses[color].replace('text-', 'bg-')
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    );
  };

  const PulseVariant = () => (
    <div
      className={uiUtils.generateClasses(
        'rounded-full animate-pulse',
        sizeClasses[size],
        colorClasses[color].replace('text-', 'bg-')
      )}
      style={{
        animationDuration: '1.5s'
      }}
    />
  );

  const BarsVariant = () => {
    const barWidth = {
      xs: 'w-0.5',
      sm: 'w-1',
      md: 'w-1',
      lg: 'w-1.5',
      xl: 'w-2'
    };

    const barHeight = {
      xs: 'h-3',
      sm: 'h-4',
      md: 'h-6',
      lg: 'h-8',
      xl: 'h-12'
    };

    return (
      <div className="flex items-end space-x-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={uiUtils.generateClasses(
              'animate-pulse',
              barWidth[size],
              barHeight[size],
              colorClasses[color].replace('text-', 'bg-')
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1.2s',
              height: `${Math.random() * 50 + 50}%`
            }}
          />
        ))}
      </div>
    );
  };

  const CircleVariant = () => {
    const strokeWidth = {
      xs: 2,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5
    };

    return (
      <svg
        className={uiUtils.generateClasses(
          'animate-spin',
          sizeClasses[size]
        )}
        viewBox="0 0 50 50"
      >
        <circle
          className={colorClasses[color]}
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth[size]}
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
          style={{
            animation: 'dash 2s ease-in-out infinite'
          }}
        />
        <style jsx>{`
          @keyframes dash {
            0% {
              stroke-dasharray: 1, 150;
              stroke-dashoffset: 0;
            }
            50% {
              stroke-dasharray: 90, 150;
              stroke-dashoffset: -35;
            }
            100% {
              stroke-dasharray: 90, 150;
              stroke-dashoffset: -124;
            }
          }
        `}</style>
      </svg>
    );
  };

  // Select variant component
  const VariantComponent = () => {
    switch (variant) {
      case 'dots':
        return <DotsVariant />;
      case 'pulse':
        return <PulseVariant />;
      case 'bars':
        return <BarsVariant />;
      case 'circle':
        return <CircleVariant />;
      default:
        return <SpinnerVariant />;
    }
  };

  // Container classes
  const containerClasses = uiUtils.generateClasses(
    'flex items-center justify-center',
    text && 'flex-col space-y-2',
    fullScreen && 'fixed inset-0 z-50',
    overlay && 'bg-white/80 backdrop-blur-sm',
    className
  );

  return (
    <div className={containerClasses} style={style}>
      <VariantComponent />
      {text && (
        <div className={uiUtils.generateClasses(
          'font-medium',
          textSizes[size],
          colorClasses[color]
        )}>
          {text}
        </div>
      )}
    </div>
  );
};

// Inline spinner for buttons and small spaces
export const InlineSpinner = ({ size = 'sm', color = 'white', className = '' }) => (
  <LoadingSpinner
    size={size}
    variant="spinner"
    color={color}
    className={className}
  />
);

// Page loading component
export const PageLoader = ({ 
  text = 'Loading...', 
  variant = 'spinner',
  size = 'lg'
}) => (
  <LoadingSpinner
    variant={variant}
    size={size}
    text={text}
    fullScreen={true}
    overlay={true}
    color="blue"
  />
);

// Content loading placeholder
export const ContentLoader = ({ 
  lines = 3,
  className = ''
}) => (
  <div className={uiUtils.generateClasses('animate-pulse space-y-3', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

// Skeleton loader for specific content types
export const SkeletonLoader = ({
  type = 'text', // 'text' | 'avatar' | 'card' | 'table'
  lines = 3,
  className = ''
}) => {
  const skeletonClasses = 'animate-pulse bg-gray-200 rounded';

  switch (type) {
    case 'avatar':
      return (
        <div className={uiUtils.generateClasses('flex items-center space-x-3', className)}>
          <div className={uiUtils.generateClasses(skeletonClasses, 'h-10 w-10 rounded-full')} />
          <div className="space-y-2">
            <div className={uiUtils.generateClasses(skeletonClasses, 'h-4 w-24')} />
            <div className={uiUtils.generateClasses(skeletonClasses, 'h-3 w-16')} />
          </div>
        </div>
      );

    case 'card':
      return (
        <div className={uiUtils.generateClasses('p-4 space-y-4', className)}>
          <div className={uiUtils.generateClasses(skeletonClasses, 'h-6 w-3/4')} />
          <div className={uiUtils.generateClasses(skeletonClasses, 'h-32 w-full')} />
          <div className="space-y-2">
            <div className={uiUtils.generateClasses(skeletonClasses, 'h-4 w-full')} />
            <div className={uiUtils.generateClasses(skeletonClasses, 'h-4 w-2/3')} />
          </div>
        </div>
      );

    case 'table':
      return (
        <div className={uiUtils.generateClasses('space-y-3', className)}>
          {/* Header */}
          <div className="flex space-x-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={uiUtils.generateClasses(skeletonClasses, 'h-4 flex-1')} />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="flex space-x-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className={uiUtils.generateClasses(skeletonClasses, 'h-4 flex-1')} />
              ))}
            </div>
          ))}
        </div>
      );

    default: // text
      return (
        <div className={uiUtils.generateClasses('space-y-2', className)}>
          {Array.from({ length: lines }).map((_, i) => (
            <div 
              key={i} 
              className={uiUtils.generateClasses(
                skeletonClasses, 
                'h-4',
                i === lines - 1 ? 'w-2/3' : 'w-full'
              )} 
            />
          ))}
        </div>
      );
  }
};

LoadingSpinner.defaultProps = {
  size: 'md',
  variant: 'spinner',
  color: 'blue',
  fullScreen: false,
  overlay: false,
  theme: 'default'
};

LoadingSpinner.displayName = 'LoadingSpinner';
InlineSpinner.displayName = 'InlineSpinner';
PageLoader.displayName = 'PageLoader';
ContentLoader.displayName = 'ContentLoader';
SkeletonLoader.displayName = 'SkeletonLoader';

export default LoadingSpinner;