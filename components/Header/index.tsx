// components/Header/index.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { createClient } from '@/lib/utils/supabase/client'
import { HeaderProps } from '@/lib/types/headerTypes'

// Import subcomponents
import CurrencySwitcher from './CurrencySwitcher'
import UserMenu from './UserMenu'
import MobileMenu from './MobileMenu'
import BalanceToggle, { MobileBalanceToggle } from './BalanceToggle'
import NotificationsButton, { MobileNotificationsButton } from './NotificationsButton'

export default function Header({ userEmail, userRole, isSubscribed = false }: HeaderProps) {
  // Combined UI state for better management
  const [uiState, setUiState] = useState({
    isMobileMenuOpen: false,
    hideBalances: false,
    selectedCurrency: 'USD'
  })
  
  const supabase = createClient()
  
  // Memoized handlers to prevent recreation on each render
  const toggleMobileMenu = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      isMobileMenuOpen: !prev.isMobileMenuOpen
    }))
  }, [])
  
  const toggleBalances = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      hideBalances: !prev.hideBalances
    }))
  }, [])
  
  const setSelectedCurrency = useCallback((currency: string) => {
    setUiState(prev => ({
      ...prev,
      selectedCurrency: currency
    }))
  }, [])
  
  const closeMobileMenu = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      isMobileMenuOpen: false
    }))
  }, [])
  
  // Load user's currency preference from database on component mount
  useEffect(() => {
    let isMounted = true
    
    async function loadUserPreferences() {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user && isMounted) {
          // Get the user profile
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('selected_currency')
            .eq('id', user.id)
            .single()
          
          // Set the selected currency if it exists
          if (userProfile?.selected_currency && isMounted) {
            setSelectedCurrency(userProfile.selected_currency)
          }
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error)
      }
    }
    
    loadUserPreferences()
    
    // Cleanup function for unmount
    return () => {
      isMounted = false
    }
  }, [supabase, setSelectedCurrency])
  
  const { isMobileMenuOpen, hideBalances, selectedCurrency } = uiState

  return (
    <div className="sticky top-0 left-0 right-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--bg-hover)]">
      <div className="max-w-6xl mx-auto px-4">
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
            <CurrencySwitcher 
              selectedCurrency={selectedCurrency} 
              setSelectedCurrency={setSelectedCurrency} 
            />
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
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
        />
      )}
    </div>
  )
}