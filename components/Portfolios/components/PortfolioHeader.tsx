// components/Portfolios/components/PortfolioHeader.tsx
'use client'

import { Plus } from 'lucide-react'
import { PortfolioSelector } from './PortfolioSelector'
import { Portfolio } from '@/types'

interface PortfolioHeaderProps {
  setShowAddAsset: (value: boolean) => void
  portfolios: Portfolio[]
  selectedPortfolio: Portfolio | null
  onSelectPortfolio: (portfolio: Portfolio) => void
  onCreatePortfolio: (name: string) => Promise<void>
  onRenamePortfolio: (id: string, name: string) => Promise<void>
  onDeletePortfolio: (id: string) => Promise<void>
}

export function PortfolioHeader({ 
  setShowAddAsset,
  portfolios,
  selectedPortfolio,
  onSelectPortfolio,
  onCreatePortfolio,
  onRenamePortfolio,
  onDeletePortfolio
}: PortfolioHeaderProps) {
  return (
    <div className="p-3 sm:p-4 md:p-4 flex justify-center items-center">
      <div className="flex flex-wrap items-center gap-2 justify-center">
        {/* Portfolio Selector */}
        <PortfolioSelector
          portfolios={portfolios}
          selectedPortfolio={selectedPortfolio}
          onSelectPortfolio={onSelectPortfolio}
          onCreatePortfolio={onCreatePortfolio}
          onRenamePortfolio={onRenamePortfolio}
          onDeletePortfolio={onDeletePortfolio}
        />
        
        <button
          onClick={() => setShowAddAsset(true)}
          className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-[var(--accent-primary-10)] hover:bg-[var(--accent-primary-20)] text-[var(--accent-primary)] rounded-lg text-sm transition-colors"
        >
          <Plus className="h-3 sm:h-4 w-3 sm:w-4" />
          Add Asset
        </button>
      </div>
    </div>
  )
}