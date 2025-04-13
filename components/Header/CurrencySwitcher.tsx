// components/Header/CurrencySwitcher.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { CurrencySwitcherProps, Currency } from '@/lib/types/headerTypes'
import { updateUserProfile } from '@/lib/db-client-req/updateUserProfile'
import { 
  DollarSign, 
  Euro, 
  PoundSterling, 
  Bitcoin, 
  ChevronDown,
  Coins
} from 'lucide-react'
import { createClient } from '@/lib/utils/supabase/client'

// Extended currency list
const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', icon: DollarSign },
  { code: 'EUR', name: 'Euro', icon: Euro },
  { code: 'GBP', name: 'British Pound', icon: PoundSterling },
  { 
    code: 'CHF', 
    name: 'Swiss Franc', 
    icon: (props) => (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
      >
    <path d="M5 4h10" />
      <path d="M5 10h7" />
      <path d="M3 16h5" />
      <path d="M5 5v19" />
      </svg>
    )
  },
  { code: 'BTC', name: 'Bitcoin', icon: Bitcoin },
  { code: 'GOLD', name: 'Gold', icon: Coins },
]

export default function CurrencySwitcher({ 
  selectedCurrency, 
  setSelectedCurrency, 
  isMobile = false,
  onSelectCallback
}: CurrencySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  
  // Get the selected currency data
  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency) || currencies[0]
  
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
  
  // Handle selecting a currency
  const handleSelectCurrency = async (currencyCode: string) => {
    setSelectedCurrency(currencyCode)
    setIsOpen(false)
    
    if (onSelectCallback) {
      onSelectCallback()
    }
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Update the user's currency preference in the database
      try {
        await updateUserProfile(user.id, {
          selected_currency: currencyCode
        })
        console.log('Currency preference updated:', currencyCode)
      } catch (error) {
        console.error('Failed to update currency preference:', error)
      }
    }
  }
  
  // Render mobile version
  if (isMobile) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <span className="flex items-center gap-3">
            <selectedCurrencyData.icon className="h-5 w-5 text-[var(--accent-primary)]" />
            <span>Currency ({selectedCurrencyData.code})</span>
          </span>
          <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="pl-6 space-y-1 mt-1">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleSelectCurrency(currency.code)}
                className={`w-full text-left flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedCurrency === currency.code 
                    ? 'bg-[var(--accent-primary-20)] text-[var(--accent-primary)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <currency.icon className="h-4 w-4" />
                <span>{currency.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  // Render desktop version
  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
      >
        <selectedCurrencyData.icon className="h-5 w-5" />
        <span>{selectedCurrencyData.code}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-secondary)] rounded-lg shadow-lg overflow-hidden border border-[var(--bg-hover)] z-50 animate-fade-in">
          <div className="p-1">
            {currencies.map((currency) => {
              const Icon = currency.icon
              return (
                <button
                  key={currency.code}
                  onClick={() => handleSelectCurrency(currency.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedCurrency === currency.code 
                      ? 'bg-[var(--accent-primary-20)] text-[var(--accent-primary)]' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }`}
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
  )
}