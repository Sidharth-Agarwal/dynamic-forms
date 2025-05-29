// components/Renderer/ProgressBar.jsx
import React from 'react';
import { Check, Circle, ChevronRight } from 'lucide-react';

const ProgressBar = ({
  currentStep = 0,
  totalSteps = 1,
  stepProgress = 0,
  completionPercentage = 0,
  form = null,
  showStepNames = true,
  showPercentage = true,
  variant = 'default', // 'default', 'minimal', 'detailed', 'circular'
  className = ''
}) => {
  const steps = form?.steps || [];
  const hasStepNames = steps.length > 0 && showStepNames;

  // Minimal progress bar
  if (variant === 'minimal') {
    return (
      <div className={`progress-bar progress-bar--minimal ${className}`}>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          {showPercentage && (
            <span>{Math.round(stepProgress)}%</span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${stepProgress}%` }}
          />
        </div>
      </div>
    );
  }

  // Circular progress
  if (variant === 'circular') {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (stepProgress / 100) * circumference;

    return (
      <div className={`progress-bar progress-bar--circular flex flex-col items-center ${className}`}>
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90" width="96" height="96">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#3b82f6"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold text-gray-900">
              {Math.round(stepProgress)}%
            </span>
          </div>
        </div>
        <div className="mt-2 text-center">
          <div className="text-sm font-medium text-gray-900">
            Step {currentStep + 1} of {totalSteps}
          </div>
          {hasStepNames && steps[currentStep]?.title && (
            <div className="text-xs text-gray-600 mt-1">
              {steps[currentStep].title}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed progress with step indicators
  if (variant === 'detailed') {
    return (
      <div className={`progress-bar progress-bar--detailed ${className}`}>
        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-4">
          {Array.from({ length: totalSteps }, (_, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const stepData = steps[index];

            return (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200
                    ${isCompleted 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : isCurrent 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-500'
                    }
                  `}>
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>

                  {/* Step Name */}
                  {hasStepNames && stepData?.title && (
                    <div className={`
                      mt-2 text-xs text-center max-w-[80px] leading-tight
                      ${isCurrent ? 'text-blue-600 font-medium' : 'text-gray-600'}
                    `}>
                      {stepData.title}
                    </div>
                  )}
                </div>

                {/* Connector Line */}
                {index < totalSteps - 1 && (
                  <div className="flex-1 h-0.5 mx-2 mb-6">
                    <div className={`
                      h-full transition-all duration-300
                      ${index < currentStep ? 'bg-green-600' : 'bg-gray-300'}
                    `} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Overall Progress</span>
            {showPercentage && (
              <span className="font-medium text-gray-900">
                {Math.round(completionPercentage)}%
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Default progress bar
  return (
    <div className={`progress-bar progress-bar--default ${className}`}>
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">
            Step {currentStep + 1} of {totalSteps}
          </span>
          {hasStepNames && steps[currentStep]?.title && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {steps[currentStep].title}
              </span>
            </>
          )}
        </div>
        {showPercentage && (
          <span className="text-sm font-medium text-blue-600">
            {Math.round(stepProgress)}%
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
            style={{ width: `${stepProgress}%` }}
          >
            {/* Animated progress stripe */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Step Markers */}
        {totalSteps > 1 && (
          <div className="absolute top-0 left-0 w-full h-3 flex justify-between items-center px-1">
            {Array.from({ length: totalSteps - 1 }, (_, index) => (
              <div 
                key={index}
                className="w-0.5 h-2 bg-white/60 rounded-full"
                style={{ 
                  marginLeft: `${((index + 1) / totalSteps) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Step Description */}
      {hasStepNames && steps[currentStep]?.description && (
        <p className="mt-2 text-xs text-gray-600 text-center">
          {steps[currentStep].description}
        </p>
      )}
    </div>
  );
};

// Specialized progress bar components
export const SimpleProgressBar = ({ 
  currentStep, 
  totalSteps, 
  className = '' 
}) => (
  <ProgressBar
    currentStep={currentStep}
    totalSteps={totalSteps}
    stepProgress={((currentStep + 1) / totalSteps) * 100}
    variant="minimal"
    showStepNames={false}
    className={className}
  />
);

export const StepperProgress = ({ 
  currentStep, 
  totalSteps, 
  steps = [], 
  className = '' 
}) => (
  <ProgressBar
    currentStep={currentStep}
    totalSteps={totalSteps}
    stepProgress={((currentStep + 1) / totalSteps) * 100}
    variant="detailed"
    form={{ steps }}
    className={className}
  />
);

export const CircularProgress = ({ 
  currentStep, 
  totalSteps, 
  className = '' 
}) => (
  <ProgressBar
    currentStep={currentStep}
    totalSteps={totalSteps}
    stepProgress={((currentStep + 1) / totalSteps) * 100}
    variant="circular"
    className={className}
  />
);

export default ProgressBar;