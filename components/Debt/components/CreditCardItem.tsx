// components/Debt/components/CreditCardItem.tsx

'use client'

import { Edit, Trash2, CreditCard as CreditCardIcon } from 'lucide-react'
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
    <div className="bg-[var(--bg-primary)] rounded-lg p-2 sm:p-3 md:bg-transparent md:rounded-none md:p-0 md:hover:bg-[var(--bg-hover)] md:border-b md:border-[var(--bg-hover)]">
      {/* Mobile Card Layout */}
      <div className="md:hidden grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCardIcon className="h-4 w-4 text-[var(--text-secondary)]" />
            <p className="text-sm text-[var(--text-primary)] font-medium">{creditCard.name}</p>
          </div>
          <div className="w-full bg-[var(--bg-hover)] rounded-full h-1.5 mb-1">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${getUtilizationBgColor(utilization)}`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
          <p className={`text-xs ${getUtilizationColor(utilization)}`}>
            {utilization.toFixed(1)}% • {getUtilizationStatus(utilization)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[var(--text-primary)] font-medium">
            {formatPreciseValue(creditCard.balance)}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            of {formatPreciseValue(creditCard.credit_limit)}
          </p>
        </div>
        <div className="col-span-2 flex justify-between items-center text-xs text-[var(--text-secondary)]">
          <span>{creditCard.interest_rate}% • Min: {formatPreciseValue(creditCard.min_payment)}</span>
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
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,0.5fr] gap-4 items-center px-2 py-3">
        {/* Card Name with Utilization */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCardIcon className="h-4 w-4 text-[var(--text-secondary)]" />
            <span className="text-[var(--text-primary)]">{creditCard.name}</span>
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
          <p className="text-[var(--text-primary)]">{formatPreciseValue(creditCard.balance)}</p>
        </div>

        {/* Credit Limit */}
        <div className="text-right">
          <p className="text-[var(--text-primary)]">{formatPreciseValue(creditCard.credit_limit)}</p>
        </div>

        {/* Utilization Percentage */}
        <div className="text-right">
          <p className={`${getUtilizationColor(utilization)}`}>{utilization.toFixed(1)}%</p>
        </div>

        {/* Min Payment */}
        <div className="text-right">
          <p className="text-[var(--text-primary)]">{formatPreciseValue(creditCard.min_payment)}</p>
        </div>

        {/* Interest Rate */}
        <div className="text-right">
          <p className="text-[var(--text-primary)]">{creditCard.interest_rate}%</p>
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