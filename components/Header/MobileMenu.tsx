// components/Header/MobileMenu.tsx

'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { signOutAction } from "@/app/actions"
import { 
  TrendingUp, 
  FileText, 
  Wallet, 
  CreditCard, 
  PieChart, 
  Building, 
  PiggyBank,
  Settings, 
  HelpCircle, 
  LogOut 
} from 'lucide-react'
import { MobileMenuProps } from '@/lib/types/headerTypes'
import CurrencySwitcher from './CurrencySwitcher'

export default function MobileMenu({ 
  userEmail, 
  userRole, 
  onClose,
  selectedCurrency,
  setSelectedCurrency
}: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])
  
  return (
    <div className="md:hidden fixed inset-0 z-40 bg-black/80 animate-fade-in">
      <div 
        ref={menuRef}
        className="w-3/4 max-w-xs h-full bg-[var(--bg-primary)] p-4 overflow-y-auto shadow-lg animate-slide-in-left"
      >
        {/* User Info */}
        <div className="mb-6 pb-4 border-b border-[var(--bg-hover)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-light text-[var(--text-secondary)]">Signed in as</div>
              <div className="text-sm font-medium text-[var(--text-primary)] truncate">{userEmail}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Main Menu Items */}
          <div className="mb-2 pb-2 border-b border-[var(--bg-hover)]">
            <h3 className="px-4 py-2 text-xs uppercase text-[var(--text-secondary)] font-medium">Main Navigation</h3>
          </div>

          {/* Market Link */}
          <Link
            href="/dashboard?tab=markets"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left"
            onClick={onClose}
          >
            <TrendingUp className="h-5 w-5 text-[var(--accent-primary)]" />
            <span>Market</span>
          </Link>

          {/* Transactions Link */}
          <Link
            href="/dashboard?tab=transactions"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left"
            onClick={onClose}
          >
            <FileText className="h-5 w-5 text-[var(--accent-primary)]" />
            <span>Transactions</span>
          </Link>

          {/* Portfolio Link */}
          <Link
            href="/dashboard?tab=portfolios"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left"
            onClick={onClose}
          >
            <Wallet className="h-5 w-5 text-[var(--accent-primary)]" />
            <span>Portfolio</span>
          </Link>

          {/* Debt Link */}
          <Link
            href="/dashboard?tab=debt"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left"
            onClick={onClose}
          >
            <CreditCard className="h-5 w-5 text-[var(--accent-primary)]" />
            <span>Debt</span>
          </Link>

          {/* Analytics Link */}
          <Link
            href="/dashboard?tab=analytics"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left"
            onClick={onClose}
          >
            <PieChart className="h-5 w-5 text-[var(--accent-primary)]" />
            <span>Analytics</span>
          </Link>

          {/* Real Estate Link */}
          <Link
            href="/dashboard?tab=real-estate"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left"
            onClick={onClose}
          >
            <Building className="h-5 w-5 text-[var(--accent-primary)]" />
            <span>Real Estate</span>
          </Link>

          {/* Budget Link */}
          <Link
            href="/dashboard?tab=budget"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left"
            onClick={onClose}
          >
            <PiggyBank className="h-5 w-5 text-[var(--accent-primary)]" />
            <span>Budget</span>
          </Link>

          {/* Settings and Preferences Section */}
          <div className="mt-6 mb-2 pb-2 border-b border-[var(--bg-hover)]">
            <h3 className="px-4 py-2 text-xs uppercase text-[var(--text-secondary)] font-medium">Settings & Support</h3>
          </div>

          {/* Currency Switcher */}
          <CurrencySwitcher 
            selectedCurrency={selectedCurrency}
            setSelectedCurrency={setSelectedCurrency}
            isMobile={true}
            onSelectCallback={onClose}
          />

          {/* Settings Link */}
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            onClick={onClose}
          >
            <Settings className="h-5 w-5 text-[var(--accent-primary)]" />
            <span>Settings</span>
          </Link>

          {/* Help & Support Link */}
          <Link
            href="/help"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            onClick={onClose}
          >
            <HelpCircle className="h-5 w-5 text-[var(--accent-primary)]" />
            <span>Help & Support</span>
          </Link>

          {/* Sign Out Button */}
          <div className="mt-8">
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}