// components/Header/UserMenu.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { signOutAction } from "@/app/actions"
import { User, Settings, HelpCircle, LogOut, Shield } from 'lucide-react'
import { UserMenuProps } from '@/lib/types/headerTypes'

export default function UserMenu({ userEmail, userRole }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
        title="User Menu"
      >
        <User className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[280px] bg-[var(--bg-secondary)] rounded-xl shadow-xl overflow-hidden border border-[var(--bg-hover)] z-50 animate-fade-in">
          <div className="p-2 space-y-1">
            <div className="px-3 py-2">
              <div className="text-sm font-light text-[var(--text-secondary)]">Signed in as</div>
              <div className="text-sm font-medium text-[var(--text-primary)] truncate">{userEmail}</div>
            </div>

            {/* Settings Link */}
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">Settings</span>
            </Link>

            {/* Help Link */}
            <Link
              href="/help"
              className="flex items-center gap-3 px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <HelpCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">Help & Support</span>
            </Link>

            {userRole === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">Admin Dashboard</span>
              </Link>
            )}

            <div className="px-1 py-1 border-t border-[var(--bg-hover)]">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors text-left"
                >
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}