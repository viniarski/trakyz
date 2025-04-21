// components/FinancialSummary.tsx
'use client'

import { useRef } from 'react'
import { useCurrencyStore } from '@/lib/stores/useCurrencyStore'

export default function FinancialSummary() {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { currency } = useCurrencyStore()
  
  // Format currency values - hardcoded to $0 for now
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(value);
  }

  return (
    <div className="w-[90%] mx-auto relative my-6" ref={dropdownRef}>
      {/* Single panel for all screen sizes */}
      <div className="w-full rounded-lg bg-[var(--bg-secondary)] p-3 sm:p-4 md:p-5 lg:p-6 shadow-md">
        <div className="grid grid-cols-3 gap-2 md:gap-4 lg:gap-6">
          {/* Assets */}
          <div className="flex flex-col items-center justify-center border-r border-[var(--bg-hover)]">
            <span className="text-2xs xs:text-xs md:text-sm font-light tracking-wider uppercase text-[var(--text-secondary)]">ASSETS</span>
            <span className="text-base xs:text-lg sm:text-xl md:text-2xl font-light">
              {formatCurrency(0)}
            </span>
          </div>
          
          {/* Net Worth */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-2xs xs:text-xs md:text-sm font-light tracking-wider uppercase text-[var(--text-secondary)]">NET WORTH</span>
            <span className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-medium">
              {formatCurrency(0)}
            </span>
          </div>
          
          {/* Debt */}
          <div className="flex flex-col items-center justify-center border-l border-[var(--bg-hover)]">
            <span className="text-2xs xs:text-xs md:text-sm font-light tracking-wider uppercase text-[var(--text-secondary)]">DEBT</span>
            <span className="text-base xs:text-lg sm:text-xl md:text-2xl font-light">
              {formatCurrency(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}