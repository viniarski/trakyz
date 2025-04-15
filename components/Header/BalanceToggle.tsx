// components/Header/BalanceToggle.tsx

'use client'

import { Eye, EyeOff } from 'lucide-react'
import { BalanceToggleProps } from '@/types'

export default function BalanceToggle({ hideBalances, toggleBalances }: BalanceToggleProps) {
  return (
    <button
      onClick={toggleBalances}
      className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
      title={hideBalances ? 'Show Balances' : 'Hide Balances'}
    >
      {hideBalances ? (
        <EyeOff className="w-5 h-5" />
      ) : (
        <Eye className="w-5 h-5" />
      )}
    </button>
  )
}

// Mobile version with smaller icons
export function MobileBalanceToggle({ hideBalances, toggleBalances }: BalanceToggleProps) {
  return (
    <button
      onClick={toggleBalances}
      className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
      title={hideBalances ? 'Show Balances' : 'Hide Balances'}
    >
      {hideBalances ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
    </button>
  )
}