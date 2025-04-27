// app/dashboard/components/portfolio/components/portfolio-header.tsx

'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Portfolio } from '@/types'

interface PortfolioHeaderProps {
  setShowAddAsset: (value: boolean) => void
  portfolios: Portfolio[]
  selectedPortfolio: Portfolio | null
  onSelectPortfolio: (portfolio: Portfolio) => void
  onCreatePortfolio: () => void
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
  if (!selectedPortfolio) return null;
  
  // Button styles to match the Transactions component
  const baseButtonClass = "text-sm px-3 py-1.5 rounded-md transition-colors font-medium";
  const activeButtonClass = "bg-[var(--accent-primary-20)] text-[var(--accent-primary)]";
  const inactiveButtonClass = "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]";
  
  return (
    <div className="p-4 flex justify-between items-center">
      <div className="flex flex-wrap items-center gap-2">
        {/* Add Asset Button - now on the left */}
        <button
          onClick={() => setShowAddAsset(true)}
          className={`${baseButtonClass} ${activeButtonClass} flex items-center gap-1.5`}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Add Asset</span>
        </button>
        
        {/* Portfolio Selector - also on the left with matching style */}
        <select
          value={selectedPortfolio.id}
          onChange={(e) => {
            const portfolio = portfolios.find(p => p.id === e.target.value);
            if (portfolio) onSelectPortfolio(portfolio);
          }}
          className={`${baseButtonClass} ${inactiveButtonClass} focus:outline-none`}
        >
          {portfolios.map(portfolio => (
            <option key={portfolio.id} value={portfolio.id}>
              {portfolio.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {/* Right side placeholder */}
      </div>
    </div>
  )
}