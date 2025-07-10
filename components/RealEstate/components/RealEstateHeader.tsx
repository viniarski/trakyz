// components/RealEstate/components/RealEstateHeader.tsx

'use client'

import { Plus, Home, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Portfolio } from '@/types'

interface RealEstateHeaderProps {
  onAddProperty: () => void
  portfolios: Portfolio[]
  selectedPortfolio: string
  setSelectedPortfolio: (portfolioId: string) => void
  totalProperties: number
  totalValue: number
}

export function RealEstateHeader({
  onAddProperty,
  portfolios,
  selectedPortfolio,
  setSelectedPortfolio,
  totalProperties,
  totalValue
}: RealEstateHeaderProps) {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div>
      {/* Header with buttons - same styling as other components */}
      <div className="p-4 flex justify-between items-center flex-wrap gap-y-2">
        {/* Left side - buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add Property button */}
          <Button
            onClick={onAddProperty}
            variant="subtle"
            size="sm"
            className="flex items-center gap-1.5 bg-[var(--accent-primary-10)] hover:bg-[var(--accent-primary-20)]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Add Property</span>
          </Button>
          
          {/* Portfolio selector */}
          {portfolios.length > 0 && (
            <select
              value={selectedPortfolio}
              onChange={(e) => setSelectedPortfolio(e.target.value)}
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
        </div>
        
        {/* Right side - summary */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Properties</p>
            <div className="flex items-center gap-1">
              <Home className="h-4 w-4 text-[var(--accent-primary)]" />
              <p className="text-lg font-bold text-[var(--text-primary)]">{totalProperties}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Value</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Border line - same as other components */}
      <div className="border-t border-gray-800/50"></div>
    </div>
  )
}