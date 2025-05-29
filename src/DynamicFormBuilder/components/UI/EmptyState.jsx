// components/UI/EmptyState.jsx
import React from 'react';
import { FileText, Plus, Search, AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon = FileText,
  title = 'No data found',
  description = 'Get started by creating your first item.',
  action = null,
  imageUrl = null,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-sm'
    },
    md: {
      container: 'py-12',
      icon: 'h-12 w-12',
      title: 'text-xl',
      description: 'text-base'
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      title: 'text-2xl',
      description: 'text-lg'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`text-center ${sizes.container} ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Empty state"
          className="mx-auto h-32 w-32 object-cover mb-4"
        />
      ) : (
        <div className="mx-auto mb-4">
          {React.isValidElement(icon) ? (
            React.cloneElement(icon, {
              className: `mx-auto ${sizes.icon} text-gray-400`
            })
          ) : (
            React.createElement(icon, {
              className: `mx-auto ${sizes.icon} text-gray-400`
            })
          )}
        </div>
      )}
      
      <h3 className={`font-medium text-gray-900 mb-2 ${sizes.title}`}>
        {title}
      </h3>
      
      <p className={`text-gray-500 max-w-md mx-auto mb-6 ${sizes.description}`}>
        {description}
      </p>
      
      {action && <div>{action}</div>}
    </div>
  );
};

// Preset empty state components
export const NoFormsState = ({ onCreateForm }) => (
  <EmptyState
    icon={FileText}
    title="No forms yet"
    description="Create your first form to start collecting responses from your audience."
    action={
      <Button
        variant="primary"
        icon={Plus}
        onClick={onCreateForm}
      >
        Create Your First Form
      </Button>
    }
  />
);

export const NoSubmissionsState = ({ formTitle }) => (
  <EmptyState
    icon={FileText}
    title="No submissions yet"
    description={`No one has submitted "${formTitle}" yet. Share your form to start collecting responses.`}
    size="sm"
  />
);

export const NoSearchResultsState = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    icon={Search}
    title="No results found"
    description={`We couldn't find anything matching "${searchTerm}". Try adjusting your search terms.`}
    action={
      <Button
        variant="secondary"
        onClick={onClearSearch}
      >
        Clear Search
      </Button>
    }
    size="sm"
  />
);

export const ErrorState = ({ title = "Something went wrong", description, onRetry }) => (
  <EmptyState
    icon={AlertCircle}
    title={title}
    description={description || "We encountered an error while loading this content. Please try again."}
    action={
      onRetry && (
        <Button
          variant="outline"
          icon={RefreshCw}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )
    }
  />
);

export const LoadingState = ({ title = "Loading...", description = "Please wait while we fetch your data." }) => (
  <EmptyState
    icon={() => (
      <div className="mx-auto h-12 w-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    )}
    title={title}
    description={description}
    size="sm"
  />
);

export const ComingSoonState = ({ feature, description }) => (
  <EmptyState
    icon={() => (
      <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-blue-600 text-xl">🚀</span>
      </div>
    )}
    title={`${feature} Coming Soon`}
    description={description || `We're working hard to bring you ${feature}. Stay tuned for updates!`}
  />
);

export const MaintenanceState = ({ estimatedTime }) => (
  <EmptyState
    icon={() => (
      <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
        <span className="text-yellow-600 text-xl">🔧</span>
      </div>
    )}
    title="Under Maintenance"
    description={`We're currently performing maintenance to improve your experience. ${
      estimatedTime ? `Expected completion: ${estimatedTime}` : 'We\'ll be back soon!'
    }`}
  />
);

export const PermissionDeniedState = ({ resource = 'this content', action }) => (
  <EmptyState
    icon={AlertCircle}
    title="Access Denied"
    description={`You don't have permission to view ${resource}. Please contact your administrator if you think this is an error.`}
    action={action}
  />
);

export const OfflineState = ({ onRetry }) => (
  <EmptyState
    icon={() => (
      <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-gray-600 text-xl">📡</span>
      </div>
    )}
    title="You're Offline"
    description="Please check your internet connection and try again."
    action={
      <Button
        variant="outline"
        icon={RefreshCw}
        onClick={onRetry}
      >
        Retry Connection
      </Button>
    }
  />
);

// Generic empty state for lists
export const EmptyListState = ({
  itemName = 'items',
  onCreateItem,
  createButtonText,
  createIcon = Plus
}) => (
  <EmptyState
    icon={FileText}
    title={`No ${itemName} found`}
    description={`You haven't created any ${itemName} yet. Get started by creating your first one.`}
    action={
      onCreateItem && (
        <Button
          variant="primary"
          icon={createIcon}
          onClick={onCreateItem}
        >
          {createButtonText || `Create ${itemName.slice(0, -1)}`}
        </Button>
      )
    }
  />
);

export default EmptyState;