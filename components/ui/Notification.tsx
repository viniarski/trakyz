// components/ui/Notification.tsx

'use client'

import { useEffect } from 'react'

interface NotificationProps {
  type: 'success' | 'error';
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

  return (
    <div 
      className={`fixed bottom-4 right-4 rounded-lg px-4 py-2 shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}
    >
      {message}
    </div>
  );
}

// Hook to manage notifications
import { useState, useCallback } from 'react';

export function useNotification() {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
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