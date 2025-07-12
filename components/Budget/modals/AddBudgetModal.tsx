// components/Budget/modals/AddBudgetModal.tsx

'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { BudgetData } from '@/types'

interface AddBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (budget: Partial<BudgetData>) => Promise<void>
  existingBudgets: BudgetData[]
}

const INCOME_OPTIONS = [
  'Salary', 'Freelance', 'Investments', 'Rental Income', 'Side Business',
  'Dividends', 'Interest', 'Royalties', 'Pension', 'Social Security', 'Gifts', 'Other'
]

const EXPENSE_OPTIONS = [
  'Housing', 'Utilities', 'Groceries', 'Transportation', 'Insurance',
  'Healthcare', 'Debt Payments', 'Entertainment', 'Dining Out', 'Shopping',
  'Education', 'Travel', 'Subscriptions', 'Savings', 'Investments', 'Charity', 'Other'
]

export function AddBudgetModal({
  isOpen,
  onClose,
  onSubmit,
  existingBudgets
}: AddBudgetModalProps) {
  const [formData, setFormData] = useState({
    month: '',
    planned_income: '',
    planned_expenses: ''
  })

  const [selectedIncomes, setSelectedIncomes] = useState<string[]>([])
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set default month to current month
  useEffect(() => {
    if (isOpen) {
      const currentDate = new Date()
      const currentMonth = currentDate.toISOString().substring(0, 7) + '-01'
      setFormData(prev => ({ ...prev, month: currentMonth }))
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // For now, just send the basic budget data
      // The income/expense selections would need to be handled separately
      // via the API that manages the budget_income and budget_expenses tables
      await onSubmit({
        month: formData.month,
        planned_income: parseFloat(formData.planned_income) || 0,
        planned_expenses: parseFloat(formData.planned_expenses) || 0
      })
      
      // Reset form
      setFormData({
        month: '',
        planned_income: '',
        planned_expenses: ''
      })
      setSelectedIncomes([])
      setSelectedExpenses([])
    } catch (error) {
      console.error('Error adding budget:', error)
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

  const toggleIncome = (income: string) => {
    setSelectedIncomes(prev => 
      prev.includes(income) 
        ? prev.filter(i => i !== income)
        : [...prev, income]
    )
  }

  const toggleExpense = (expense: string) => {
    setSelectedExpenses(prev => 
      prev.includes(expense) 
        ? prev.filter(e => e !== expense)
        : [...prev, expense]
    )
  }

  // Check if month already exists
  const monthExists = existingBudgets.some(budget => budget.month === formData.month)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-primary)] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--bg-hover)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Add New Budget
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Month */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Month
                </label>
                <input
                  type="month"
                  name="month"
                  value={formData.month.substring(0, 7)}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    month: e.target.value + '-01' 
                  }))}
                  required
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                />
                {monthExists && (
                  <p className="text-sm text-[var(--accent-danger)] mt-1">
                    Budget for this month already exists
                  </p>
                )}
              </div>

              {/* Planned Income */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Planned Income
                </label>
                <input
                  type="number"
                  name="planned_income"
                  value={formData.planned_income}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                  placeholder="0.00"
                />
              </div>

              {/* Planned Expenses */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Planned Expenses
                </label>
                <input
                  type="number"
                  name="planned_expenses"
                  value={formData.planned_expenses}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Income Sources */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              Income Sources (Optional)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {INCOME_OPTIONS.map(income => (
                <label
                  key={income}
                  className="flex items-center gap-2 p-3 border border-[var(--bg-hover)] rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedIncomes.includes(income)}
                    onChange={() => toggleIncome(income)}
                    className="rounded border-[var(--bg-hover)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">{income}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Expense Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              Expense Categories (Optional)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {EXPENSE_OPTIONS.map(expense => (
                <label
                  key={expense}
                  className="flex items-center gap-2 p-3 border border-[var(--bg-hover)] rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedExpenses.includes(expense)}
                    onChange={() => toggleExpense(expense)}
                    className="rounded border-[var(--bg-hover)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">{expense}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
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
              disabled={isSubmitting || monthExists}
              className="px-6 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}