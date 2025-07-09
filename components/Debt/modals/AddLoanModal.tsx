// components/Debt/modals/AddLoanModal.tsx

'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Loan } from '@/types'

interface AddLoanModalProps {
  onClose: () => void
  onSubmit: (loanData: Omit<Loan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
}

export function AddLoanModal({ onClose, onSubmit }: AddLoanModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    portfolio_id: '', // This should be populated with user's default portfolio
    name: '',
    lender: '',
    loan_type: '',
    original_amount: 0,
    current_balance: 0,
    interest_rate: 0,
    monthly_payment: 0,
    payment_day: 1,
    term_months: 0,
    start_date: '',
    maturity_date: '',
    months_paid: 0,
    months_remaining: 0,
    next_payment_date: '',
    auto_pay: false,
    extra_payments_total: 0,
    encrypted: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Calculate maturity date if not provided
      const startDate = new Date(formData.start_date)
      const maturityDate = formData.maturity_date || 
        new Date(startDate.getFullYear(), startDate.getMonth() + formData.term_months, startDate.getDate())
          .toISOString().split('T')[0]

      // Calculate derived fields
      const calculatedData = {
        ...formData,
        maturity_date: maturityDate,
        months_remaining: formData.term_months - formData.months_paid,
        // Set next payment date based on payment day if not provided
        next_payment_date: formData.next_payment_date || getNextPaymentDate(formData.payment_day)
      }

      // Remove empty string dates and replace with proper values
      const cleanedData = {
        ...calculatedData,
        start_date: calculatedData.start_date || new Date().toISOString().split('T')[0],
        maturity_date: maturityDate,
        next_payment_date: calculatedData.next_payment_date || getNextPaymentDate(formData.payment_day)
      }

      await onSubmit(cleanedData)
    } catch (error) {
      console.error('Error adding loan:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNextPaymentDate = (paymentDay: number) => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, paymentDay)
    return nextMonth.toISOString().split('T')[0]
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[var(--bg-primary)] rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[var(--bg-hover)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Add New Loan</h2>
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
                  placeholder="e.g., Car Loan, Mortgage"
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
                  placeholder="e.g., Bank of America"
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
                  <option value="">Select loan type</option>
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
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
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
                  Original Amount *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.original_amount}
                  onChange={(e) => handleChange('original_amount', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

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
                  placeholder="0.00"
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
                  placeholder="0.00"
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
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Term (Months) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.term_months}
                  onChange={(e) => handleChange('term_months', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                  placeholder="360"
                />
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
                  placeholder="15"
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
              {loading ? 'Adding...' : 'Add Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}