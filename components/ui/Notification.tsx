// components/ui/Notification.tsx

'use client'

import { useEffect } from 'react'

// Update the type to include 'info'
interface NotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Notification({ 
  type, 
  message, 
  onClose,
  duration = 5000 
}: NotificationProps) {
  // Auto-dismiss notification after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  // Add styling for info type
  const getBgColor = () => {
    switch(type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 rounded-lg px-4 py-2 shadow-lg z-50 ${getBgColor()} text-white`}
    >
      {message}
    </div>
  );
}

// Hook to manage notifications - also update type here
import { useState, useCallback } from 'react';

export function useNotification() {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    clearNotification
  };
}