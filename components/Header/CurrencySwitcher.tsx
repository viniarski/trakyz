// components/Header/CurrencySwitcher.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  DollarSign, 
  Euro, 
  PoundSterling, 
  Bitcoin, 
  ChevronDown,
  Coins
} from 'lucide-react'
import { useCurrencyStore, Currency } from '@/lib/stores/useCurrencyStore'

// Currency metadata with display info
export const currencyOptions = [
  { code: 'USD', name: 'US Dollar', icon: DollarSign },
  { code: 'EUR', name: 'Euro', icon: Euro },
  { code: 'GBP', name: 'British Pound', icon: PoundSterling },
  { 
    code: 'CHF', 
    name: 'Swiss Franc', 
    icon: (props: any) => (
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
] as const;

interface CurrencySwitcherProps {
  isMobile?: boolean;
  onSelectCallback?: () => void;
}

export default function CurrencySwitcher({ 
  isMobile = false,
  onSelectCallback
}: CurrencySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Use Zustand store for currency state
  const { currency, setCurrency } = useCurrencyStore();
  
  // Get the selected currency data
  const selectedCurrencyData = currencyOptions.find(c => c.code === currency) || currencyOptions[0];
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle selecting a currency
  const handleSelectCurrency = (currencyCode: Currency) => {
    // Only use the Zustand store's setCurrency method
    // which internally handles the database update
    setCurrency(currencyCode);
    setIsOpen(false);
    
    if (onSelectCallback) {
      onSelectCallback();
    }
  };
  
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
            {currencyOptions.map((currencyOption) => (
              <button
                key={currencyOption.code}
                onClick={() => handleSelectCurrency(currencyOption.code as Currency)}
                className={`w-full text-left flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currency === currencyOption.code 
                    ? 'bg-[var(--accent-primary-20)] text-[var(--accent-primary)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <currencyOption.icon className="h-4 w-4" />
                <span>{currencyOption.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
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
            {currencyOptions.map((currencyOption) => {
              const Icon = currencyOption.icon;
              return (
                <button
                  key={currencyOption.code}
                  onClick={() => handleSelectCurrency(currencyOption.code as Currency)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    currency === currencyOption.code 
                      ? 'bg-[var(--accent-primary-20)] text-[var(--accent-primary)]' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm">{currencyOption.code}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{currencyOption.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}