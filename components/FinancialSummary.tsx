// components/FinancialSummary.tsx
'use client'

import { useRef, useMemo } from 'react'
import { useCurrencyStore } from '@/lib/stores/useCurrencyStore'
import type { Transaction, DebtData, RealEstateProperty } from '@/types'

interface FinancialSummaryProps {
  transactions?: Transaction[]
  debtData?: DebtData
  realEstateData?: RealEstateProperty[]
  currentPrices?: Record<string, number>
}

export default function FinancialSummary({
  transactions = [],
  debtData = { loans: [], creditCards: [] },
  realEstateData = [],
  currentPrices = {}
}: FinancialSummaryProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { currency } = useCurrencyStore()
  
  // Calculate portfolio value from transactions
  const portfolioValue = useMemo(() => {
    if (!transactions.length || !Object.keys(currentPrices).length) return 0

    // Calculate current holdings
    const assetQuantities: Record<string, number> = {}
    
    transactions.forEach(transaction => {
      const assetKey = `${transaction.category}-${transaction.asset_type}`
      
      if (!assetQuantities[assetKey]) {
        assetQuantities[assetKey] = 0
      }
      
      if (transaction.transaction_type === 'BUY') {
        assetQuantities[assetKey] += transaction.quantity
      } else if (transaction.transaction_type === 'SELL') {
        assetQuantities[assetKey] -= transaction.quantity
      }
    })

    // Calculate total value using current prices
    let totalValue = 0
    Object.entries(assetQuantities).forEach(([assetKey, quantity]) => {
      if (quantity <= 0) return
      
      const assetType = assetKey.split('-')[1]
      const price = currentPrices[assetType] || 0
      
      if (price > 0) {
        totalValue += quantity * price
      }
    })

    return totalValue
  }, [transactions, currentPrices])

  // Calculate real estate value
  const realEstateValue = useMemo(() => {
    return realEstateData.reduce((total, property) => {
      return total + (property.current_value || 0)
    }, 0)
  }, [realEstateData])

  // Calculate total debt
  const totalDebt = useMemo(() => {
    const loanDebt = debtData.loans.reduce((sum, loan) => sum + (loan.current_balance || 0), 0)
    const creditCardDebt = debtData.creditCards.reduce((sum, card) => sum + (card.balance || 0), 0)
    return loanDebt + creditCardDebt
  }, [debtData])

  // Calculate total assets and net worth
  const totalAssets = portfolioValue + realEstateValue
  const netWorth = totalAssets - totalDebt
  
  // Format currency values
  const formatCurrency = (value: number) => {
    // Special formatting for non-standard currencies
    if (currency === 'GOLD') {
      return `${value.toFixed(2)} XAU`;
    }
    if (currency === 'BTC') {
      return `${value.toFixed(8)} BTC`;
    }
    
    try {
      // Standard currency formatting for ISO currencies
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
      }).format(value);
    } catch (error) {
      // Fallback formatting if currency code is invalid
      console.warn(`Invalid currency code "${currency}", using fallback formatting`);
      return `$${value.toFixed(0)}`;
    }
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
              {formatCurrency(totalAssets)}
            </span>
            {/* Breakdown tooltip on hover */}
            <div className="hidden md:block text-xs text-[var(--text-secondary)] mt-1">
              Portfolio: {formatCurrency(portfolioValue)}
              {realEstateValue > 0 && (
                <div>Real Estate: {formatCurrency(realEstateValue)}</div>
              )}
            </div>
          </div>
          
          {/* Net Worth */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-2xs xs:text-xs md:text-sm font-light tracking-wider uppercase text-[var(--text-secondary)]">NET WORTH</span>
            <span className={`text-lg xs:text-xl sm:text-2xl md:text-3xl font-medium ${
              netWorth >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(netWorth)}
            </span>
            {/* Show percentage if there are assets */}
            {totalAssets > 0 && (
              <div className="hidden md:block text-xs text-[var(--text-secondary)] mt-1">
                {((netWorth / totalAssets) * 100).toFixed(1)}% equity
              </div>
            )}
          </div>
          
          {/* Debt */}
          <div className="flex flex-col items-center justify-center border-l border-[var(--bg-hover)]">
            <span className="text-2xs xs:text-xs md:text-sm font-light tracking-wider uppercase text-[var(--text-secondary)]">DEBT</span>
            <span className={`text-base xs:text-lg sm:text-xl md:text-2xl font-light ${
              totalDebt > 0 ? 'text-red-500' : 'text-[var(--text-primary)]'
            }`}>
              {formatCurrency(totalDebt)}
            </span>
            {/* Show debt breakdown */}
            {totalDebt > 0 && (
              <div className="hidden md:block text-xs text-[var(--text-secondary)] mt-1">
                {debtData.loans.length > 0 && `Loans: ${debtData.loans.length}`}
                {debtData.loans.length > 0 && debtData.creditCards.length > 0 && ' • '}
                {debtData.creditCards.length > 0 && `Cards: ${debtData.creditCards.length}`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}