// components/Debt/components/LoanItem.tsx

'use client'

import { Edit, Trash2, Calendar, DollarSign, Percent, Clock } from 'lucide-react'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import { formatDate } from '@/lib/utils/format'
import type { Loan } from '@/types'

interface LoanItemProps {
  loan: Loan
  onEdit: () => void
  onDelete: () => void
}

export function LoanItem({ loan, onEdit, onDelete }: LoanItemProps) {
  const { formatPreciseValue } = useCurrencyConverter()

  // Calculate progress
  const totalPaid = loan.original_amount - loan.current_balance
  const progress = loan.original_amount > 0 ? (totalPaid / loan.original_amount) * 100 : 0

  // Calculate remaining time
  const remainingYears = Math.floor(loan.months_remaining / 12)
  const remainingMonths = loan.months_remaining % 12
  const remainingTime = remainingYears > 0 
    ? `${remainingYears}y ${remainingMonths}m`
    : `${remainingMonths}m`

  return (
    <div className="bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg p-4 hover:border-[var(--accent-primary)]/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate">{loan.name}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{loan.lender} • {loan.loan_type}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
            title="Edit loan"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete loan"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--text-secondary)]">Progress</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-[var(--bg-hover)] rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Loan Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-red-500" />
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Current Balance</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {formatPreciseValue(loan.current_balance)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Monthly Payment</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {formatPreciseValue(loan.monthly_payment)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-yellow-500" />
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Interest Rate</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {loan.interest_rate.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-500" />
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Time Remaining</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {remainingTime}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-3 border-t border-[var(--bg-hover)] flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
          <span>Next Payment: {formatDate(loan.next_payment_date)}</span>
          {loan.auto_pay && (
            <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded">Auto Pay</span>
          )}
        </div>
        <div className="text-xs text-[var(--text-secondary)]">
          Paid: {formatPreciseValue(totalPaid)} of {formatPreciseValue(loan.original_amount)}
        </div>
      </div>
    </div>
  )
}