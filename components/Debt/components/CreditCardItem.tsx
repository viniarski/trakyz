// components/Debt/components/CreditCardItem.tsx

'use client'

import { Edit, Trash2, Calendar, DollarSign, Percent, CreditCard as CreditCardIcon } from 'lucide-react'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import { formatDate } from '@/lib/utils/format'
import type { CreditCard } from '@/types'

interface CreditCardItemProps {
  creditCard: CreditCard
  onEdit: () => void
  onDelete: () => void
}

export function CreditCardItem({ creditCard, onEdit, onDelete }: CreditCardItemProps) {
  const { formatPreciseValue } = useCurrencyConverter()

  // Calculate utilization
  const utilization = creditCard.credit_limit > 0 ? (creditCard.balance / creditCard.credit_limit) * 100 : 0
  const availableCredit = creditCard.credit_limit - creditCard.balance

  // Get utilization color
  const getUtilizationColor = (util: number) => {
    if (util <= 30) return 'text-green-500'
    if (util <= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getUtilizationBgColor = (util: number) => {
    if (util <= 30) return 'bg-green-500'
    if (util <= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg p-4 hover:border-[var(--accent-primary)]/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate">
            {creditCard.name} •••• {creditCard.last_four}
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">{creditCard.issuer}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
            title="Edit credit card"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete credit card"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--text-secondary)]">Credit Utilization</span>
          <span className={`text-sm font-medium ${getUtilizationColor(utilization)}`}>
            {utilization.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-[var(--bg-hover)] rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getUtilizationBgColor(utilization)}`}
            style={{ width: `${Math.min(utilization, 100)}%` }}
          />
        </div>
      </div>

      {/* Credit Card Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-red-500" />
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Current Balance</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {formatPreciseValue(creditCard.balance)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CreditCardIcon className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Credit Limit</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {formatPreciseValue(creditCard.credit_limit)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-500" />
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Available Credit</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {formatPreciseValue(availableCredit)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-yellow-500" />
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Interest Rate</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {creditCard.interest_rate.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-3 border-t border-[var(--bg-hover)] flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
          <span>Due Date: {formatDate(creditCard.due_date)}</span>
          <span>Min Payment: {formatPreciseValue(creditCard.min_payment)}</span>
          {creditCard.auto_pay && (
            <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded">Auto Pay</span>
          )}
        </div>
        {creditCard.annual_fee > 0 && (
          <div className="text-xs text-[var(--text-secondary)]">
            Annual Fee: {formatPreciseValue(creditCard.annual_fee)}
          </div>
        )}
      </div>

      {/* Rewards Rate */}
      {creditCard.rewards_rate && (
        <div className="mt-2 text-xs text-[var(--text-secondary)]">
          Rewards: {creditCard.rewards_rate}
        </div>
      )}
    </div>
  )
}