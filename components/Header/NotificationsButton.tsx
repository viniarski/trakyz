// components/Header/NotificationsButton.tsx

'use client'

import { Bell } from 'lucide-react'
import { NotificationsButtonProps } from '@/types'

export default function NotificationsButton({}: NotificationsButtonProps) {
  return (
    <button
      className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
      title="Notifications"
    >
      <Bell className="w-5 h-5" />
    </button>
  )
}

// Mobile version with smaller icon
export function MobileNotificationsButton({}: NotificationsButtonProps) {
  return (
    <button
      className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
      title="Notifications"
    >
      <Bell className="w-4 h-4" />
    </button>
  )
}