// components/Budget/modals/BudgetEditModal.tsx

'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { BudgetData } from '@/types'

interface BudgetEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (budget: Partial<BudgetData>) => Promise<void>
  budget: BudgetData | null
}

export function BudgetEditModal({
  isOpen,
  onClose,
  onSubmit,
  budget
}: BudgetEditModalProps) {
  const [formData, setFormData] = useState({
    month: '',
    planned_income: '',
    planned_expenses: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (budget) {
      setFormData({
        month: budget.month,
        planned_income: budget.planned_income.toString(),
        planned_expenses: budget.planned_expenses.toString()
      })
    }
  }, [budget])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit({
        month: formData.month,
        planned_income: parseFloat(formData.planned_income) || 0,
        planned_expenses: parseFloat(formData.planned_expenses) || 0
      })
    } catch (error) {
      console.error('Error updating budget:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen || !budget) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-primary)] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[var(--bg-hover)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Edit Budget
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              Budget Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Month
                </label>
                <input
                  type="text"
                  value={new Date(formData.month).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                  readOnly
                  className="w-full px-3 py-2 bg-[var(--bg-hover)] border border-[var(--bg-hover)] rounded-lg text-[var(--text-secondary)] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Planned Income
                </label>
                <input
                  type="number"
                  name="planned_income"
                  value={formData.planned_income}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Planned Expenses
                </label>
                <input
                  type="number"
                  name="planned_expenses"
                  value={formData.planned_expenses}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--bg-hover)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Updating...' : 'Update Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}