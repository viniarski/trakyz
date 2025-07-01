// components/ui/Notification.tsx

'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface NotificationProps {
  type: NotificationType
  message: string
  onClose: () => void
  duration?: number
}

export function Notification({ type, message, onClose, duration = 5000 }: NotificationProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20'
      case 'error':
        return 'bg-red-500/10 border-red-500/20'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/20'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      case 'warning':
        return 'text-yellow-400'
      case 'info':
      default:
        return 'text-blue-400'
    }
  }

  return (
    <div className={`fixed bottom-4 right-4 max-w-md p-4 rounded-lg border ${getBackgroundColor()} z-50 animate-in slide-in-from-bottom-2`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <p className={`text-sm ${getTextColor()}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Hook for managing notifications
export function useNotification() {
  const [notification, setNotification] = useState<{
    type: NotificationType
    message: string
  } | null>(null)

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message })
  }

  const clearNotification = () => {
    setNotification(null)
  }

  return {
    notification,
    showNotification,
    clearNotification
  }
}