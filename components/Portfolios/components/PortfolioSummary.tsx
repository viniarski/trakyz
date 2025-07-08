// components/Portfolios/components/PortfolioSummary.tsx

'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import { PortfolioSummary as PortfolioSummaryType } from '@/types'

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType
  hideBalances?: boolean
}

export function PortfolioSummary({ 
  summary, 
  hideBalances = false
}: PortfolioSummaryProps) {
  const { formatPreciseValue } = useCurrencyConverter()

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8 md:mb-8">
      {/* Mobile layout - Combined Total Value and Profit/Loss in one row with space between */}
      <div className="flex justify-between items-center md:hidden">
        <div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Total Value</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">
            {hideBalances ? '******' : formatPreciseValue(summary.total_value)}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Profit/Loss</p>
          {!hideBalances ? (
            <div className="flex items-center justify-end">
              {summary.total_profit_loss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-lg font-bold ${
                summary.total_profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {formatPreciseValue(Math.abs(summary.total_profit_loss))}
              </span>
            </div>
          ) : (
            <p className="text-lg font-bold text-[var(--text-primary)]">******</p>
          )}
        </div>
      </div>

      {/* Desktop layout - Three column grid */}
      <div className="hidden md:block">
        <p className="text-sm text-[var(--text-secondary)]">Total Value</p>
        <p className="text-2xl font-bold text-[var(--text-primary)]">
          {hideBalances ? '******' : formatPreciseValue(summary.total_value)}
        </p>
      </div>
      
      <div className="hidden md:block">
        <p className="text-sm text-[var(--text-secondary)]">Total Cost</p>
        <p className="text-2xl font-bold text-[var(--text-primary)]">
          {hideBalances ? '******' : formatPreciseValue(summary.total_cost)}
        </p>
      </div>
      
      <div className="hidden md:block">
        <p className="text-sm text-[var(--text-secondary)]">Profit/Loss</p>
        {!hideBalances ? (
          <div className="flex items-center gap-2">
            {summary.total_profit_loss >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <p className={`text-2xl font-bold ${
              summary.total_profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatPreciseValue(Math.abs(summary.total_profit_loss))}
              <span className="text-sm ml-1">
                ({summary.total_profit_loss_percentage.toFixed(2)}%)
              </span>
            </p>
          </div>
        ) : (
          <p className="text-2xl font-bold text-[var(--text-primary)]">******</p>
        )}
      </div>
    </div>
  )
}