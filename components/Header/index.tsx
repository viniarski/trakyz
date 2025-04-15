// components/Header/index.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { HeaderProps } from '@/lib/types/headerTypes'

// Import subcomponents
import CurrencySwitcher from './CurrencySwitcher'
import UserMenu from './UserMenu'
import MobileMenu from './MobileMenu'
import BalanceToggle, { MobileBalanceToggle } from './BalanceToggle'
import NotificationsButton, { MobileNotificationsButton } from './NotificationsButton'
import { useCurrencyStore } from '@/lib/stores/useCurrencyStore'

export default function Header({ userEmail, userRole, isSubscribed = false }: HeaderProps) {
  // Use hide balances state
  const [hideBalances, setHideBalances] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Use currency from Zustand store
  const { currency } = useCurrencyStore()
  
  // Memoized handlers to prevent recreation on each render
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])
  
  const toggleBalances = useCallback(() => {
    setHideBalances(prev => !prev)
  }, [])
  
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <div className="sticky top-0 left-0 right-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--bg-hover)]">
      <div className="w-[90%] mx-auto">
        <header className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/dashboard" 
            className="flex items-center gap-1 sm:gap-2 font-medium text-xl sm:text-2xl text-[var(--text-primary)] tracking-tight no-underline font-mono"
          >
            <div className="relative h-5 w-5">
              <Image 
                src="/logo_trakyz.png"
                alt="Trakyz Logo"
                fill
                sizes="20px"
                className="object-contain object-left"
                priority
              />
            </div>
            TRAKYZ
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <CurrencySwitcher />
            <BalanceToggle hideBalances={hideBalances} toggleBalances={toggleBalances} />
            <NotificationsButton />
            <UserMenu userEmail={userEmail} userRole={userRole} />
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <MobileBalanceToggle hideBalances={hideBalances} toggleBalances={toggleBalances} />
            <MobileNotificationsButton />
            <button
              onClick={toggleMobileMenu}
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Menu (only shown when isMobileMenuOpen is true) */}
      {isMobileMenuOpen && (
        <MobileMenu 
          userEmail={userEmail}
          userRole={userRole}
          onClose={closeMobileMenu}
          isMobile={true}
          onSelectCallback={closeMobileMenu}
        />
      )}
    </div>
  )
}