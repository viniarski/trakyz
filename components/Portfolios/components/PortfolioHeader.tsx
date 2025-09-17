// components/Portfolios/components/PortfolioHeader.tsx

'use client'

import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/ui/DashboardHeader'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import { Portfolio, PortfolioSummary as PortfolioSummaryType } from '@/types'
import { useState } from 'react'

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
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) return
    
    try {
      setIsCreating(true)
      await onCreatePortfolio(newPortfolioName.trim())
      setNewPortfolioName('')
      setShowCreatePortfolio(false)
    } catch (error) {
      console.error('Error creating portfolio:', error)
    } finally {
      setIsCreating(false)
    }
  }

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
            if (e.target.value === '__add_new__') {
              setShowCreatePortfolio(true)
            } else {
              const portfolio = portfolios.find(p => p.id === e.target.value)
              if (portfolio) onSelectPortfolio(portfolio)
            }
          }}
          className="text-sm px-3 py-1.5 rounded-md transition-colors font-medium bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none"
        >
          {portfolios.map(portfolio => (
            <option key={portfolio.id} value={portfolio.id}>
              {portfolio.name}
              {portfolio.is_default ? ' (Default)' : ''}
            </option>
          ))}
          <option value="__add_new__">
            + Add New Portfolio
          </option>
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

  return (
    <>
      <Header leftContent={leftContent} rightContent={rightContent} />

      {/* Create Portfolio Modal */}
      {showCreatePortfolio && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-md relative animate-scale-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Create New Portfolio</h2>
              <button
                onClick={() => {
                  setShowCreatePortfolio(false)
                  setNewPortfolioName('')
                }}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Portfolio Name
                </label>
                <input
                  type="text"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                  placeholder="Enter portfolio name..."
                  className="w-full p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreatePortfolio()
                    }
                  }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowCreatePortfolio(false)
                    setNewPortfolioName('')
                  }}
                  className="flex-1 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePortfolio}
                  disabled={!newPortfolioName.trim() || isCreating}
                  className="flex-1 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Portfolio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}