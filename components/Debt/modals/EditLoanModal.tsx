// components/Debt/modals/EditLoanModal.tsx

'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Loan } from '@/types'

interface EditLoanModalProps {
  loan: Loan
  onClose: () => void
  onSubmit: (loanData: Partial<Loan>) => Promise<void>
}

export function EditLoanModal({ loan, onClose, onSubmit }: EditLoanModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: loan.name,
    lender: loan.lender,
    loan_type: loan.loan_type,
    current_balance: loan.current_balance,
    interest_rate: loan.interest_rate,
    monthly_payment: loan.monthly_payment,
    payment_day: loan.payment_day,
    next_payment_date: loan.next_payment_date,
    auto_pay: loan.auto_pay,
    extra_payments_total: loan.extra_payments_total
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error updating loan:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[var(--bg-primary)] rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[var(--bg-hover)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Edit Loan</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Basic Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Loan Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Lender *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lender}
                  onChange={(e) => handleChange('lender', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Loan Type *
                </label>
                <select
                  required
                  value={formData.loan_type}
                  onChange={(e) => handleChange('loan_type', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                >
                  <option value="Mortgage">Mortgage</option>
                  <option value="Auto Loan">Auto Loan</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Student Loan">Student Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Payment Day (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.payment_day}
                  onChange={(e) => handleChange('payment_day', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Financial Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Current Balance *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.current_balance}
                  onChange={(e) => handleChange('current_balance', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Interest Rate (%) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.interest_rate}
                  onChange={(e) => handleChange('interest_rate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Monthly Payment *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.monthly_payment}
                  onChange={(e) => handleChange('monthly_payment', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Extra Payments Total
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.extra_payments_total}
                  onChange={(e) => handleChange('extra_payments_total', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Next Payment Date
                </label>
                <input
                  type="date"
                  value={formData.next_payment_date}
                  onChange={(e) => handleChange('next_payment_date', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Additional Options</h3>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto_pay"
                checked={formData.auto_pay}
                onChange={(e) => handleChange('auto_pay', e.target.checked)}
                className="rounded border-[var(--bg-hover)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
              />
              <label htmlFor="auto_pay" className="text-sm text-[var(--text-secondary)]">
                Auto Pay enabled
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--bg-hover)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}