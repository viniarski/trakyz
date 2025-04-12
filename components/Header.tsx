'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Menu, 
  Bell, 
  Eye, 
  EyeOff, 
  LogOut, 
  ChevronDown, 
  DollarSign, 
  Settings, 
  Wallet, 
  Building, 
  PiggyBank, 
  PieChart, 
  HelpCircle, 
  TrendingUp, 
  FileText, 
  CreditCard, 
  Crown, 
  X,
  User,
  Euro,
  PoundSterling,
  Bitcoin,
  Shield
} from 'lucide-react'

const currencies = [
  { code: 'USD', name: 'US Dollar', icon: DollarSign },
  { code: 'EUR', name: 'Euro', icon: Euro },
  { code: 'GBP', name: 'British Pound', icon: PoundSterling },
  { code: 'BTC', name: 'Bitcoin', icon: Bitcoin },
]

interface HeaderProps {
  userEmail?: string | null
  userRole?: string | null
  planType?: string | null
}

export default function Header({ userEmail, userRole, planType }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false)
  const [isDesktopCurrencyOpen, setIsDesktopCurrencyOpen] = useState(false)
  const [showProModal, setShowProModal] = useState(false)
  const [proFeature, setProFeature] = useState('')
  const [hideBalances, setHideBalances] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const currencyMenuRef = useRef<HTMLDivElement>(null)
  
  // Toggle balance visibility (dummy function)
  const toggleBalances = () => setHideBalances(!hideBalances)
  
  // Get selected currency data
  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency)

  // Handle outside clicks for mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false)
        setIsDesktopCurrencyOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Check if user has Pro plan
  const isPro = planType === 'pro'

  // Handle Pro feature click
  const handleProFeatureClick = (featureName: string) => {
    if (!isPro) {
      setProFeature(featureName)
      setShowProModal(true)
      return true
    }
    return false
  }

  return (
    <div className="sticky top-0 left-0 right-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--bg-hover)]">
      <div className="max-w-6xl mx-auto px-4">
        <header className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-1 sm:gap-2 font-medium text-xl sm:text-2xl text-[var(--text-primary)] tracking-tight no-underline font-mono"
          >
            <div className="relative h-5 w-5">
              <Image 
                src="/logo_trakyz.png"
                alt="Trakyz Logo"
                fill
                sizes="80px"
                className="object-contain object-left"
                priority
              />
            </div>
            TRAKYZ
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Currency Switcher */}
            <div ref={currencyMenuRef} className="relative">
              <button
                onClick={() => setIsDesktopCurrencyOpen(!isDesktopCurrencyOpen)}
                className="flex items-center gap-2 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              >
                {selectedCurrencyData && (
                  <>
                    <selectedCurrencyData.icon className="h-5 w-5" />
                    <span>{selectedCurrencyData.code}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isDesktopCurrencyOpen ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              {isDesktopCurrencyOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-secondary)] rounded-lg shadow-lg overflow-hidden border border-[var(--bg-hover)] z-50">
                  <div className="p-1">
                    {currencies.map((currency) => {
                      const Icon = currency.icon
                      return (
                        <button
                          key={currency.code}
                          onClick={() => {
                            setSelectedCurrency(currency.code)
                            setIsDesktopCurrencyOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          <div className="flex flex-col items-start">
                            <span className="text-sm">{currency.code}</span>
                            <span className="text-xs text-[var(--text-secondary)]">{currency.name}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Toggle Balances Button */}
            <button
              onClick={toggleBalances}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              title={hideBalances ? 'Show Balances' : 'Hide Balances'}
            >
              {hideBalances ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>

            {/* Notifications Button */}
            <button
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
                title="User Menu"
              >
                <User className="w-5 h-5" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-[280px] bg-[var(--bg-secondary)] rounded-xl shadow-xl overflow-hidden border border-[var(--bg-hover)] z-50">
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-2">
                      <div className="text-sm font-light text-[var(--text-secondary)]">Signed in as</div>
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">{userEmail}</div>
                      {planType === 'pro' && (
                        <div className="flex items-center gap-1 text-xs text-[var(--accent-primary)] mt-1">
                          <Crown className="w-3 h-3" />
                          <span>Pro Plan</span>
                        </div>
                      )}
                    </div>

                    {/* Settings Link */}
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium">Settings</span>
                    </Link>

                    {/* Help Link */}
                    <Link
                      href="/help"
                      className="flex items-center gap-3 px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <HelpCircle className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium">Help & Support</span>
                    </Link>

                    {userRole === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm font-medium">Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="px-1 py-1 border-t border-[var(--bg-hover)]">
                      <button
                        onClick={() => {
                          // Sign out function would go here
                          console.log('Sign out clicked')
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleBalances}
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              title={hideBalances ? 'Show Balances' : 'Hide Balances'}
            >
              {hideBalances ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/80 animate-fade-in">
          <div 
            ref={mobileMenuRef}
            className="w-3/4 max-w-xs h-full bg-[var(--bg-primary)] p-4 overflow-y-auto shadow-lg animate-slide-in-left"
          >
            {/* User Info */}
            <div className="mb-6 pb-4 border-b border-[var(--bg-hover)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-light text-[var(--text-secondary)]">Signed in as</div>
                  <div className="text-sm font-medium text-[var(--text-primary)] truncate">{userEmail}</div>
                </div>
                {planType === 'pro' && (
                  <div className="flex items-center gap-1 text-xs text-[var(--accent-primary)]">
                    <Crown className="w-3 h-3" />
                    <span>Pro Plan</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Main Menu Items */}
              <div className="mb-2 pb-2 border-b border-[var(--bg-hover)]">
                <h3 className="px-4 py-2 text-xs uppercase text-[var(--text-secondary)] font-medium">Main Navigation</h3>
              </div>

              {/* Market Link */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  // You would call your tab switching function here
                }}
              >
                <TrendingUp className="h-5 w-5 text-[var(--accent-primary)]" />
                <span>Market</span>
              </button>

              {/* Transactions Link */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  // You would call your tab switching function here
                }}
              >
                <FileText className="h-5 w-5 text-[var(--accent-primary)]" />
                <span>Transactions</span>
              </button>

              {/* Portfolio Link */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  // You would call your tab switching function here
                }}
              >
                <Wallet className="h-5 w-5 text-[var(--accent-primary)]" />
                <span>Portfolio</span>
              </button>

              {/* Debt Link */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  // You would call your tab switching function here
                }}
              >
                <CreditCard className="h-5 w-5 text-[var(--accent-primary)]" />
                <span>Debt</span>
              </button>

              {/* Analytics Link - Pro Feature */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left"
                onClick={() => {
                  if (!handleProFeatureClick("Analytics")) {
                    setIsMobileMenuOpen(false);
                    // You would call your tab switching function here
                  }
                }}
              >
                <PieChart className="h-5 w-5 text-[var(--accent-primary)]" />
                <div className="flex items-center">
                  <span>Analytics</span>
                  {!isPro && (
                    <div className="flex items-center ml-2">
                      <Crown className="h-3 w-3 text-[var(--accent-primary)]" />
                      <span className="text-[10px] font-medium text-[var(--accent-primary)]">PRO</span>
                    </div>
                  )}
                </div>
              </button>

              {/* Real Estate Link - Pro Feature */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left"
                onClick={() => {
                  if (!handleProFeatureClick("Real Estate Portfolio")) {
                    setIsMobileMenuOpen(false);
                    // You would call your tab switching function here
                  }
                }}
              >
                <Building className="h-5 w-5 text-[var(--accent-primary)]" />
                <div className="flex items-center">
                  <span>Real Estate</span>
                  {!isPro && (
                    <div className="flex items-center ml-2">
                      <Crown className="h-3 w-3 text-[var(--accent-primary)]" />
                      <span className="text-[10px] font-medium text-[var(--accent-primary)]">PRO</span>
                    </div>
                  )}
                </div>
              </button>

              {/* Budget Link - Pro Feature */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left"
                onClick={() => {
                  if (!handleProFeatureClick("Budget")) {
                    setIsMobileMenuOpen(false);
                    // You would call your tab switching function here
                  }
                }}
              >
                <PiggyBank className="h-5 w-5 text-[var(--accent-primary)]" />
                <div className="flex items-center">
                  <span>Budget</span>
                  {!isPro && (
                    <div className="flex items-center ml-2">
                      <Crown className="h-3 w-3 text-[var(--accent-primary)]" />
                      <span className="text-[10px] font-medium text-[var(--accent-primary)]">PRO</span>
                    </div>
                  )}
                </div>
              </button>

              {/* Settings and Preferences Section */}
              <div className="mt-6 mb-2 pb-2 border-b border-[var(--bg-hover)]">
                <h3 className="px-4 py-2 text-xs uppercase text-[var(--text-secondary)] font-medium">Settings & Support</h3>
              </div>

              {/* Currency Switcher */}
              <div>
                <button
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-[var(--accent-primary)]" />
                    <span>Currency</span>
                  </span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCurrencyOpen && (
                  <div className="pl-6 space-y-1 mt-1">
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => {
                          setSelectedCurrency(currency.code)
                          setIsCurrencyOpen(false)
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                      >
                        <currency.icon className="h-4 w-4" />
                        <span>{currency.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings Link */}
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="h-5 w-5 text-[var(--accent-primary)]" />
                <span>Settings</span>
              </Link>

              {/* Help & Support Link */}
              <Link
                href="/help"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HelpCircle className="h-5 w-5 text-[var(--accent-primary)]" />
                <span>Help & Support</span>
              </Link>

              {/* Sign Out Button */}
              <div className="mt-8">
                <button
                  onClick={() => {
                    // Sign out function would go here
                    console.log('Sign out clicked')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pro Feature Modal */}
      {showProModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 w-full max-w-[320px] relative animate-scale-up mx-auto">
            <button 
              onClick={() => setShowProModal(false)} 
              className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-center p-2">
              <Crown className="h-8 w-8 text-[var(--accent-primary)] mx-auto mb-2" />
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Pro Feature: {proFeature}</h3>
              <p className="text-[var(--text-secondary)] mb-4">
                This feature is only available to Pro plan subscribers.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary-80)] transition-colors"
                onClick={() => setShowProModal(false)}
              >
                <Crown className="h-4 w-4" />
                <span>Upgrade to Pro</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}