// components/Debt/modals/AddCreditCardModal.tsx

'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { CreditCard } from '@/types'

interface AddCreditCardModalProps {
  onClose: () => void
  onSubmit: (cardData: Omit<CreditCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
}

export function AddCreditCardModal({ onClose, onSubmit }: AddCreditCardModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    portfolio_id: '', // This should be populated with user's default portfolio
    name: '',
    issuer: '',
    last_four: '',
    balance: 0,
    credit_limit: 0,
    interest_rate: 0,
    min_payment: 0,
    due_date: '',
    auto_pay: false,
    statement_balance: 0,
    annual_fee: 0,
    rewards_rate: '',
    encrypted: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error adding credit card:', error)
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
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Add New Credit Card</h2>
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
                  Card Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                  placeholder="e.g., Chase Sapphire Preferred"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Issuer *
                </label>
                <input
                  type="text"
                  required
                  value={formData.issuer}
                  onChange={(e) => handleChange('issuer', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                  placeholder="e.g., Chase, Amex, Capital One"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Last Four Digits *
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  pattern="[0-9]{4}"
                  value={formData.last_four}
                  onChange={(e) => handleChange('last_four', e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                  placeholder="1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => handleChange('due_date', e.target.value)}
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
                  value={formData.balance}
                  onChange={(e) => handleChange('balance', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Credit Limit *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.credit_limit}
                  onChange={(e) => handleChange('credit_limit', parseFloat(e.target.value))}
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
                  Minimum Payment *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.min_payment}
                  onChange={(e) => handleChange('min_payment', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Statement Balance
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.statement_balance}
                  onChange={(e) => handleChange('statement_balance', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Annual Fee
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.annual_fee}
                  onChange={(e) => handleChange('annual_fee', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Rewards Rate
              </label>
              <input
                type="text"
                value={formData.rewards_rate}
                onChange={(e) => handleChange('rewards_rate', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--bg-hover)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                placeholder="e.g., 2% cash back, 3x points on dining"
              />
            </div>

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
              {loading ? 'Adding...' : 'Add Credit Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}