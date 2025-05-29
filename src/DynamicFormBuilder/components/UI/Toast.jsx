// components/UI/Toast.jsx
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const Toast = ({
  notification,
  onRemove,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const typeStyles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: 'text-green-400',
      progress: 'bg-green-500'
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-400',
      progress: 'bg-red-500'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-400',
      progress: 'bg-yellow-500'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-400',
      progress: 'bg-blue-500'
    }
  };

  const animationClasses = {
    'top-right': {
      enter: 'transform translate-x-full opacity-0',
      enterActive: 'transform translate-x-0 opacity-100 transition-all duration-300 ease-out',
      exit: 'transform translate-x-full opacity-0 transition-all duration-200 ease-in'
    },
    'top-left': {
      enter: 'transform -translate-x-full opacity-0',
      enterActive: 'transform translate-x-0 opacity-100 transition-all duration-300 ease-out',
      exit: 'transform -translate-x-full opacity-0 transition-all duration-200 ease-in'
    },
    'bottom-right': {
      enter: 'transform translate-x-full opacity-0',
      enterActive: 'transform translate-x-0 opacity-100 transition-all duration-300 ease-out',
      exit: 'transform translate-x-full opacity-0 transition-all duration-200 ease-in'
    },
    'bottom-left': {
      enter: 'transform -translate-x-full opacity-0',
      enterActive: 'transform translate-x-0 opacity-100 transition-all duration-300 ease-out',
      exit: 'transform -translate-x-full opacity-0 transition-all duration-200 ease-in'
    }
  };

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 200);
  };

  const IconComponent = icons[notification.type];
  const styles = typeStyles[notification.type];
  const animations = animationClasses[position];

  const getAnimationClass = () => {
    if (isLeaving) return animations.exit;
    if (isVisible) return animations.enterActive;
    return animations.enter;
  };

  return (
    <div
      className={`
        max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden
        ${getAnimationClass()}
      `}
    >
      <div className={`p-4 border ${styles.container}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${styles.icon}`} />
          </div>
          <div className="ml-3 w-0 flex-1">
            {notification.title && (
              <p className="text-sm font-medium">
                {notification.title}
              </p>
            )}
            <p className={`text-sm ${notification.title ? 'mt-1' : ''}`}>
              {notification.message}
            </p>
            {notification.details && (
              <p className="text-xs mt-1 opacity-75">
                {notification.details}
              </p>
            )}
          </div>
          {notification.dismissible && (
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleRemove}
              >
                <span className="sr-only">Close</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {notification.duration > 0 && !isLeaving && (
        <div className="h-1 bg-gray-200">
          <div
            className={`h-full ${styles.progress} transition-all ease-linear`}
            style={{
              animation: `shrink ${notification.duration}ms linear`
            }}
          />
        </div>
      )}
    </div>
  );
};

// Container component for rendering toasts
export const ToastContainer = () => {
  const { notifications, position, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50'
  };

  return (
    <div className={positionClasses[position]}>
      <div className="space-y-2">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            position={position}
          />
        ))}
      </div>
    </div>
  );
};

// Custom styles for progress bar animation
const progressBarStyles = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = progressBarStyles;
  document.head.appendChild(styleSheet);
}

export default Toast;