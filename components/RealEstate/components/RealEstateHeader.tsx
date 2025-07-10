// components/RealEstate/components/RealEstateHeader.tsx

'use client'

import { Plus, Home, TrendingUp, DollarSign } from 'lucide-react'
import type { RealEstateProperty } from '@/types/realestate'
import type { Portfolio } from '@/types'

interface RealEstateHeaderProps {
  onAddProperty: () => void
  portfolios: Portfolio[]
  selectedPortfolio: string
  onPortfolioChange: (portfolioId: string) => void
  properties: RealEstateProperty[]
}

export function RealEstateHeader({
  onAddProperty,
  portfolios = [], // Default to empty array
  selectedPortfolio,
  onPortfolioChange,
  properties = [] // Default to empty array
}: RealEstateHeaderProps) {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Calculate summary statistics
  const totalProperties = properties.length
  const totalValue = properties.reduce((sum, property) => sum + property.current_value, 0)
  const totalCost = properties.reduce((sum, property) => sum + property.purchase_price, 0)
  const totalGainLoss = totalValue - totalCost
  const gainLossPercentage = totalCost > 0 ? ((totalGainLoss / totalCost) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header with buttons */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        {/* Left side - Title and Portfolio Selector */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-[var(--accent-primary)]" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Real Estate
            </h1>
          </div>
          
          {/* Portfolio selector - only show if portfolios exist and there's more than one */}
          {portfolios && portfolios.length > 1 && (
            <select
              value={selectedPortfolio}
              onChange={(e) => onPortfolioChange(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--bg-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-colors"
            >
              {portfolios.map(portfolio => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                  {portfolio.is_default ? ' (Default)' : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right side - Add button */}
        <button
          onClick={onAddProperty}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Property</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Summary Cards */}
      {properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Properties */}
          <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--bg-hover)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--accent-primary-10)] rounded-lg">
                <Home className="h-5 w-5 text-[var(--accent-primary)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Properties</p>
                <p className="text-xl font-semibold text-[var(--text-primary)]">
                  {totalProperties}
                </p>
              </div>
            </div>
          </div>

          {/* Total Value */}
          <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--bg-hover)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--accent-primary-10)] rounded-lg">
                <DollarSign className="h-5 w-5 text-[var(--accent-primary)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total Value</p>
                <p className="text-xl font-semibold text-[var(--text-primary)]">
                  {formatCurrency(totalValue)}
                </p>
              </div>
            </div>
          </div>

          {/* Total Investment */}
          <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--bg-hover)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--accent-secondary-10)] rounded-lg">
                <DollarSign className="h-5 w-5 text-[var(--accent-secondary)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total Cost</p>
                <p className="text-xl font-semibold text-[var(--text-primary)]">
                  {formatCurrency(totalCost)}
                </p>
              </div>
            </div>
          </div>

          {/* Gain/Loss */}
          <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--bg-hover)]">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                totalGainLoss >= 0 
                  ? 'bg-[var(--accent-success-10)]' 
                  : 'bg-[var(--accent-danger-10)]'
              }`}>
                <TrendingUp className={`h-5 w-5 ${
                  totalGainLoss >= 0 
                    ? 'text-[var(--accent-success)]' 
                    : 'text-[var(--accent-danger)]'
                }`} />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Gain/Loss</p>
                <div className="flex items-center gap-2">
                  <p className={`text-xl font-semibold ${
                    totalGainLoss >= 0 
                      ? 'text-[var(--accent-success)]' 
                      : 'text-[var(--accent-danger)]'
                  }`}>
                    {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
                  </p>
                  <span className={`text-sm ${
                    totalGainLoss >= 0 
                      ? 'text-[var(--accent-success)]' 
                      : 'text-[var(--accent-danger)]'
                  }`}>
                    ({gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {properties.length === 0 && (
        <div className="bg-[var(--bg-primary)] rounded-lg p-8 text-center border border-[var(--bg-hover)]">
          <Home className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
            Start Building Your Real Estate Portfolio
          </h3>
          <p className="text-[var(--text-secondary)] mb-4">
            Track your properties, monitor their performance, and analyze your real estate investments.
          </p>
          <button
            onClick={onAddProperty}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary-hover)] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Your First Property
          </button>
        </div>
      )}
    </div>
  )
}