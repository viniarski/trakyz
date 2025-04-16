'use client'

import { Star } from 'lucide-react'

interface MarketHeaderProps {
  selectedPeriod: '24H' | '7D';
  setSelectedPeriod: (period: '24H' | '7D') => void;
  view: 'market' | 'watchlist';
  setView: (view: 'market' | 'watchlist') => void;
}

export function MarketHeader({
  selectedPeriod,
  setSelectedPeriod,
  view,
  setView
}: MarketHeaderProps) {
  return (
    <div className="p-4 flex justify-center items-center">
      <div className="flex flex-wrap items-center gap-2 justify-center">
        <button
          onClick={() => setSelectedPeriod('24H')}
          className={`px-2 sm:px-3 py-1 text-sm rounded-lg transition-colors ${
            selectedPeriod === '24H' 
              ? 'bg-[var(--accent-primary-10)] text-[var(--accent-primary)]'
              : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          24H
        </button>
        <button
          onClick={() => setSelectedPeriod('7D')}
          className={`px-2 sm:px-3 py-1 text-sm rounded-lg transition-colors ${
            selectedPeriod === '7D' 
              ? 'bg-[var(--accent-primary-10)] text-[var(--accent-primary)]'
              : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          7D
        </button>
        <button
          onClick={() => setView(view === 'market' ? 'watchlist' : 'market')}
          className={`px-2 sm:px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1 ${
            view === 'watchlist' 
              ? 'bg-[var(--accent-primary-10)] text-[var(--accent-primary)]'
              : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Star className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Watchlist</span>
        </button>
      </div>
    </div>
  )
}