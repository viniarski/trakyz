// app/admin/components/market-status.tsx
'use client'

import { useState } from 'react'
import { Activity, ChevronDown, ChevronUp } from 'lucide-react'

interface MarketStatusProps {
  cryptoLastUpdate: Date | null
  metalsLastUpdate: Date | null
  stocksLastUpdate: Date | null
  currenciesLastUpdate: Date | null
  onUpdate: () => void
  isUpdating: boolean
}

const formatTimestamp = (date: Date | null): string => {
  if (!date || isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function MarketStatus({
  cryptoLastUpdate,
  metalsLastUpdate,
  stocksLastUpdate,
  currenciesLastUpdate,
  onUpdate,
  isUpdating
}: MarketStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const marketSources = [
    { name: 'Crypto', timestamp: cryptoLastUpdate },
    { name: 'Metals', timestamp: metalsLastUpdate },
    { name: 'Stocks', timestamp: stocksLastUpdate },
    { name: 'Currencies', timestamp: currenciesLastUpdate }
  ]

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
      <div 
        className="p-4 border-b border-gray-700 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Market Status</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(); }}
            disabled={isUpdating}
            className={`text-sm px-3 py-1 rounded-md ${isUpdating ? 'bg-gray-500' : 'bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)]'} text-white transition-colors`}
          >
            {isUpdating ? 'Updating...' : 'Update Now'}
          </button>
          <div className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3">
          {marketSources.map(({ name, timestamp }) => (
            <div key={name} className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">{name}</span>
              <span className="text-sm text-[var(--text-primary)]">
                {formatTimestamp(timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}