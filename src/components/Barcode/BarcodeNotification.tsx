import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface BarcodeNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function BarcodeNotification({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 3000
}: BarcodeNotificationProps) {
  React.useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`${getBackgroundColor()} border rounded-lg p-4 shadow-lg`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <h4 className={`font-medium ${getTextColor()}`}>
              {title}
            </h4>
            <p className={`text-sm mt-1 ${getTextColor()}`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`${getTextColor()} hover:opacity-70`}
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}