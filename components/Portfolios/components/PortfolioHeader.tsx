// components/Portfolios/components/PortfolioHeader.tsx

'use client'

import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/Header'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import { Portfolio, PortfolioSummary as PortfolioSummaryType } from '@/types'

interface PortfolioHeaderProps {
  setShowAddAsset: (value: boolean) => void
  portfolios: Portfolio[]
  selectedPortfolio: Portfolio | null
  onSelectPortfolio: (portfolio: Portfolio) => void
  onCreatePortfolio: (name: string) => Promise<void>
  onRenamePortfolio: (id: string, name: string) => Promise<void>
  onDeletePortfolio: (id: string) => Promise<void>
  summary: PortfolioSummaryType
  hideBalances?: boolean
}

export function PortfolioHeader({ 
  setShowAddAsset,
  portfolios,
  selectedPortfolio,
  onSelectPortfolio,
  onCreatePortfolio,
  onRenamePortfolio,
  onDeletePortfolio,
  summary,
  hideBalances = false
}: PortfolioHeaderProps) {
  const { formatPreciseValue } = useCurrencyConverter()

  const leftContent = (
    <>
      {/* Add Asset button */}
      <Button
        onClick={() => setShowAddAsset(true)}
        variant="subtle"
        size="sm"
        className="flex items-center gap-1.5 bg-[var(--accent-primary-10)] hover:bg-[var(--accent-primary-20)]"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden xs:inline">Add Asset</span>
      </Button>
      
      {/* Portfolio selector */}
      {portfolios.length > 0 && selectedPortfolio && (
        <select
          value={selectedPortfolio.id}
          onChange={(e) => {
            const portfolio = portfolios.find(p => p.id === e.target.value)
            if (portfolio) onSelectPortfolio(portfolio)
          }}
          className="text-sm px-3 py-1.5 rounded-md transition-colors font-medium bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none"
        >
          {portfolios.map(portfolio => (
            <option key={portfolio.id} value={portfolio.id}>
              {portfolio.name}
              {portfolio.is_default ? ' (Default)' : ''}
            </option>
          ))}
        </select>
      )}
    </>
  )

  const rightContent = (
    <>
      {/* Portfolio Summary - aligned properly */}
      <div className="flex items-center gap-8">
        {/* Portfolio Cost */}
        <div className="text-right">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Portfolio Cost</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">
            {hideBalances ? '******' : formatPreciseValue(summary.total_cost)}
          </p>
        </div>
        
        {/* Portfolio Value */}
        <div className="text-right">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Portfolio Value</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">
            {hideBalances ? '******' : formatPreciseValue(summary.total_value)}
          </p>
        </div>
        
        {/* Portfolio Profit/Loss */}
        <div className="text-right">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Portfolio Profit/Loss</p>
          {!hideBalances ? (
            <div className="flex items-center justify-end gap-1 whitespace-nowrap">
              {summary.total_profit_loss >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 flex-shrink-0" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 flex-shrink-0" />
              )}
              <span className={`text-lg font-bold ${
                summary.total_profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {formatPreciseValue(Math.abs(summary.total_profit_loss))}
              </span>
              <span className={`text-lg ml-1 ${
                summary.total_profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                ({summary.total_profit_loss_percentage.toFixed(2)}%)
              </span>
            </div>
          ) : (
            <p className="text-sm font-bold text-[var(--text-primary)]">******</p>
          )}
        </div>
      </div>
    </>
  )

  return <Header leftContent={leftContent} rightContent={rightContent} />
}