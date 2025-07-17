// components/Debt/components/LoanItem.tsx

'use client'

import { Edit, Trash2, DollarSign } from 'lucide-react'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import type { Loan } from '@/types'

interface LoanItemProps {
  loan: Loan
  onEdit: () => void
  onDelete: () => void
}

export function LoanItem({
  loan,
  onEdit,
  onDelete
}: LoanItemProps) {
  const { formatPreciseValue } = useCurrencyConverter()

  // Calculate loan progress
  const totalAmount = loan.original_amount || loan.current_balance
  const paidAmount = totalAmount - loan.current_balance
  const progressPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0

  // Format next payment date
  const formatNextPayment = (dateString?: string) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="bg-[var(--bg-primary)] rounded-lg p-2 sm:p-3 md:bg-transparent md:rounded-none md:p-0 md:hover:bg-[var(--bg-hover)] md:border-b md:border-[var(--bg-hover)]">
      {/* Mobile Card Layout */}
      <div className="md:hidden grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-[var(--text-secondary)]" />
            <p className="text-sm text-[var(--text-primary)] font-medium">{loan.name}</p>
          </div>
          <div className="w-full bg-[var(--bg-hover)] rounded-full h-1.5 mb-1">
            <div 
              className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {progressPercentage.toFixed(1)}% paid
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[var(--text-primary)] font-medium">
            {formatPreciseValue(loan.current_balance)}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {formatPreciseValue(loan.monthly_payment)}/month
          </p>
        </div>
        <div className="col-span-2 flex justify-between items-center text-xs text-[var(--text-secondary)]">
          <span>{loan.interest_rate}% • {loan.term_months} months</span>
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
        {/* Loan Name with Progress */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-[var(--text-secondary)]" />
            <span className="text-[var(--text-primary)]">{loan.name}</span>
          </div>
          <div className="w-full bg-[var(--bg-hover)] rounded-full h-1.5">
            <div 
              className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs text-[var(--text-secondary)] mt-1">{progressPercentage.toFixed(1)}% paid</span>
        </div>

        {/* Balance */}
        <div className="text-right">
          <p className="text-[var(--text-primary)]">{formatPreciseValue(loan.current_balance)}</p>
        </div>

        {/* Monthly Payment */}
        <div className="text-right">
          <p className="text-[var(--text-primary)]">{formatPreciseValue(loan.monthly_payment)}</p>
        </div>

        {/* Interest Rate */}
        <div className="text-right">
          <p className="text-[var(--text-primary)]">{loan.interest_rate}%</p>
        </div>

        {/* Term */}
        <div className="text-right">
          <p className="text-[var(--text-primary)]">{loan.term_months} months</p>
        </div>

        {/* Next Payment */}
        <div className="text-right">
          <p className="text-[var(--text-primary)]">{formatNextPayment(loan.next_payment_date)}</p>
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