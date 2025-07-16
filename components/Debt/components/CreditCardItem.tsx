// components/Debt/components/CreditCardItem.tsx

'use client'

import { Edit, Trash2, CreditCard as CreditCardIcon, DollarSign, Percent } from 'lucide-react'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import type { CreditCard } from '@/types'

interface CreditCardItemProps {
  creditCard: CreditCard
  onEdit: () => void
  onDelete: () => void
}

export function CreditCardItem({
  creditCard,
  onEdit,
  onDelete
}: CreditCardItemProps) {
  const { formatPreciseValue } = useCurrencyConverter()

  // Calculate utilization
  const utilization = creditCard.credit_limit > 0 
    ? (creditCard.balance / creditCard.credit_limit) * 100 
    : 0

  // Get utilization status and color
  const getUtilizationStatus = (utilization: number) => {
    if (utilization <= 10) return 'Excellent'
    if (utilization <= 30) return 'Good'
    if (utilization <= 60) return 'Fair'
    return 'Poor'
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization <= 30) return 'text-green-500'
    if (utilization <= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getUtilizationBgColor = (utilization: number) => {
    if (utilization <= 30) return 'bg-green-500'
    if (utilization <= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="hover:bg-[var(--bg-hover)]/30 transition-colors">
      {/* Mobile Card Layout */}
      <div className="md:hidden p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4 text-[var(--text-secondary)]" />
            <h3 className="font-medium text-[var(--text-primary)]">{creditCard.name}</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] rounded"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-[var(--text-secondary)] hover:text-red-500 rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Utilization Bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[var(--text-secondary)]">Credit Utilization</span>
            <span className={`text-xs font-medium ${getUtilizationColor(utilization)}`}>
              {utilization.toFixed(1)}% • {getUtilizationStatus(utilization)}
            </span>
          </div>
          <div className="w-full bg-[var(--bg-hover)] rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${getUtilizationBgColor(utilization)}`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--text-secondary)] text-xs">Balance</p>
            <p className="font-medium text-[var(--text-primary)]">{formatPreciseValue(creditCard.balance)}</p>
          </div>
          <div>
            <p className="text-[var(--text-secondary)] text-xs">Credit Limit</p>
            <p className="font-medium text-[var(--text-primary)]">{formatPreciseValue(creditCard.credit_limit)}</p>
          </div>
          <div>
            <p className="text-[var(--text-secondary)] text-xs">Min Payment</p>
            <p className="font-medium text-[var(--text-primary)]">{formatPreciseValue(creditCard.min_payment)}</p>
          </div>
          <div>
            <p className="text-[var(--text-secondary)] text-xs">Interest Rate</p>
            <p className="font-medium text-[var(--text-primary)]">{creditCard.interest_rate}%</p>
          </div>
        </div>
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,0.5fr] gap-4 items-center px-4 py-3">
        {/* Card Name with Utilization */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCardIcon className="h-4 w-4 text-[var(--text-secondary)]" />
            <span className="font-medium text-[var(--text-primary)]">{creditCard.name}</span>
          </div>
          <div className="w-full bg-[var(--bg-hover)] rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${getUtilizationBgColor(utilization)}`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
          <span className={`text-xs mt-1 ${getUtilizationColor(utilization)}`}>
            {utilization.toFixed(1)}% • {getUtilizationStatus(utilization)}
          </span>
        </div>

        {/* Balance */}
        <div className="text-right">
          <p className="font-medium text-[var(--text-primary)]">{formatPreciseValue(creditCard.balance)}</p>
        </div>

        {/* Credit Limit */}
        <div className="text-right">
          <p className="font-medium text-[var(--text-primary)]">{formatPreciseValue(creditCard.credit_limit)}</p>
        </div>

        {/* Utilization Percentage */}
        <div className="text-right">
          <p className={`font-medium ${getUtilizationColor(utilization)}`}>{utilization.toFixed(1)}%</p>
        </div>

        {/* Min Payment */}
        <div className="text-right">
          <p className="font-medium text-[var(--text-primary)]">{formatPreciseValue(creditCard.min_payment)}</p>
        </div>

        {/* APR */}
        <div className="text-right">
          <p className="font-medium text-[var(--text-primary)]">{creditCard.interest_rate}%</p>
        </div>

        {/* Actions */}
        <div className="flex gap-1 justify-end">
          <button
            onClick={onEdit}
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] rounded"
          >
            <Edit className="h-3 w-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-[var(--text-secondary)] hover:text-red-500 rounded"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}