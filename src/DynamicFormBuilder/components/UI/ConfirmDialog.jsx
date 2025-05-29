// components/UI/ConfirmDialog.jsx
import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  loading = false,
  icon = null,
  destructive = false
}) => {
  const icons = {
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
    danger: XCircle
  };

  const iconStyles = {
    warning: 'text-yellow-600 bg-yellow-100',
    info: 'text-blue-600 bg-blue-100',
    success: 'text-green-600 bg-green-100',
    danger: 'text-red-600 bg-red-100'
  };

  const buttonVariants = {
    warning: 'warning',
    info: 'primary',
    success: 'success',
    danger: 'danger'
  };

  const IconComponent = icon || icons[variant];
  const iconStyle = iconStyles[variant];
  const buttonVariant = destructive ? 'danger' : buttonVariants[variant];

  const handleConfirm = async () => {
    try {
      await onConfirm?.();
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
      // Don't close on error - let parent handle
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <div className="sm:flex sm:items-start">
        {IconComponent && (
          <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${iconStyle} sm:mx-0 sm:h-10 sm:w-10`}>
            <IconComponent className="h-6 w-6" />
          </div>
        )}
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {title}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {message}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button
          variant={buttonVariant}
          onClick={handleConfirm}
          loading={loading}
          disabled={loading}
          className="w-full sm:w-auto sm:ml-3"
        >
          {confirmText}
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
          className="mt-3 w-full sm:mt-0 sm:w-auto"
        >
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
};

// Preset confirm dialogs
export const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = 'item',
  loading = false
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete Confirmation"
    message={`Are you sure you want to delete this ${itemName}? This action cannot be undone.`}
    confirmText="Delete"
    cancelText="Cancel"
    variant="danger"
    destructive={true}
    loading={loading}
  />
);

export const PublishConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Publish Form"
    message="Are you sure you want to publish this form? It will become available for public submissions."
    confirmText="Publish"
    cancelText="Cancel"
    variant="success"
    loading={loading}
  />
);

export const ArchiveConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Archive Form"
    message="Are you sure you want to archive this form? It will no longer accept new submissions but existing data will be preserved."
    confirmText="Archive"
    cancelText="Cancel"
    variant="warning"
    loading={loading}
  />
);

export const UnsavedChangesDialog = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Unsaved Changes"
    message="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
    confirmText="Leave"
    cancelText="Stay"
    variant="warning"
    destructive={true}
    loading={loading}
  />
);

export default ConfirmDialog;