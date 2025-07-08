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
    <div>
      {/* Summary in one row - aligned horizontally */}
      <div className="p-4 flex justify-between items-center flex-wrap gap-y-2">
        {/* Total Value */}
        <div className="flex flex-col">
          <p className="text-sm text-[var(--text-secondary)]">Total Value</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">
            {hideBalances ? '******' : formatPreciseValue(summary.total_value)}
          </p>
        </div>
        
        {/* Total Cost */}
        <div className="flex flex-col text-center">
          <p className="text-sm text-[var(--text-secondary)]">Total Cost</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">
            {hideBalances ? '******' : formatPreciseValue(summary.total_cost)}
          </p>
        </div>
        
        {/* Profit/Loss */}
        <div className="flex flex-col text-right">
          <p className="text-sm text-[var(--text-secondary)]">Profit/Loss</p>
          {!hideBalances ? (
            <div className="flex items-center justify-end gap-1">
              {summary.total_profit_loss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xl font-bold ${
                summary.total_profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {formatPreciseValue(Math.abs(summary.total_profit_loss))}
              </span>
              <span className={`text-sm ml-1 ${
                summary.total_profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                ({summary.total_profit_loss_percentage.toFixed(2)}%)
              </span>
            </div>
          ) : (
            <p className="text-xl font-bold text-[var(--text-primary)]">******</p>
          )}
        </div>
      </div>
      
      {/* Border line below summary */}
      <div className="border-t border-gray-800/50"></div>
    </div>
  )
}