// components/Budget/components/BudgetList.tsx

'use client'

import { useState } from 'react'
import { Edit, Trash2, Calendar, DollarSign, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import type { BudgetData } from '@/types'

interface BudgetListProps {
  budgets: BudgetData[]
  isLoading: boolean
  selectedPeriod: string
  onEditBudget: (budget: BudgetData) => void
  onDeleteBudget: (month: string) => void
}

export function BudgetList({
  budgets,
  isLoading,
  selectedPeriod,
  onEditBudget,
  onDeleteBudget
}: BudgetListProps) {
  const [sortBy, setSortBy] = useState<'month' | 'income' | 'expenses' | 'net'>('month')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const calculateNetIncome = (income: number, expenses: number) => {
    return income - expenses
  }

  const sortedBudgets = [...budgets].sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy) {
      case 'month':
        aValue = new Date(a.month).getTime()
        bValue = new Date(b.month).getTime()
        break
      case 'income':
        aValue = a.planned_income
        bValue = b.planned_income
        break
      case 'expenses':
        aValue = a.planned_expenses
        bValue = b.planned_expenses
        break
      case 'net':
        aValue = calculateNetIncome(a.planned_income, a.planned_expenses)
        bValue = calculateNetIncome(b.planned_income, b.planned_expenses)
        break
      default:
        aValue = new Date(a.month).getTime()
        bValue = new Date(b.month).getTime()
    }

    if (typeof aValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

  const handleSort = (column: 'month' | 'income' | 'expenses' | 'net') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-primary)] rounded-lg p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-[var(--bg-hover)] rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-[var(--bg-hover)] rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (budgets.length === 0) {
    return (
      <div className="bg-[var(--bg-primary)] rounded-lg p-8 text-center">
        <PiggyBank className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
          No Budgets Found
        </h3>
        <p className="text-[var(--text-secondary)]">
          Create your first budget to start tracking your income and expenses.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-primary)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--bg-hover)]">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-[var(--text-secondary)]">
          <div 
            className="col-span-3 cursor-pointer hover:text-[var(--accent-primary)] flex items-center gap-1"
            onClick={() => handleSort('month')}
          >
            Month
            {sortBy === 'month' && (
              <span className="text-xs">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div 
            className="col-span-2 cursor-pointer hover:text-[var(--accent-primary)] flex items-center gap-1"
            onClick={() => handleSort('income')}
          >
            Planned Income
            {sortBy === 'income' && (
              <span className="text-xs">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div 
            className="col-span-2 cursor-pointer hover:text-[var(--accent-primary)] flex items-center gap-1"
            onClick={() => handleSort('expenses')}
          >
            Planned Expenses
            {sortBy === 'expenses' && (
              <span className="text-xs">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div 
            className="col-span-2 cursor-pointer hover:text-[var(--accent-primary)] flex items-center gap-1"
            onClick={() => handleSort('net')}
          >
            Net Income
            {sortBy === 'net' && (
              <span className="text-xs">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className="col-span-2">Income Sources</div>
          <div className="col-span-1">Actions</div>
        </div>
      </div>

      {/* Budget List */}
      <div className="divide-y divide-[var(--bg-hover)]">
        {sortedBudgets.map((budget) => {
          const netIncome = calculateNetIncome(budget.planned_income, budget.planned_expenses)
          const isPositive = netIncome >= 0
          const isCurrentPeriod = budget.month === selectedPeriod

          return (
            <div 
              key={budget.month} 
              className={`px-6 py-4 hover:bg-[var(--bg-hover)] transition-colors ${
                isCurrentPeriod ? 'bg-[var(--accent-primary-10)]' : ''
              }`}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Month */}
                <div className="col-span-3">
                  <div className="font-medium text-[var(--text-primary)]">
                    {formatDate(budget.month)}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    Updated: {new Date(budget.updated_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Planned Income */}
                <div className="col-span-2">
                  <div className="font-medium text-[var(--text-primary)]">
                    {formatCurrency(budget.planned_income)}
                  </div>
                  <div className="text-xs text-[var(--accent-success)]">
                    Income
                  </div>
                </div>

                {/* Planned Expenses */}
                <div className="col-span-2">
                  <div className="font-medium text-[var(--text-primary)]">
                    {formatCurrency(budget.planned_expenses)}
                  </div>
                  <div className="text-xs text-[var(--accent-danger)]">
                    Expenses
                  </div>
                </div>

                {/* Net Income */}
                <div className="col-span-2">
                  <div className={`flex items-center gap-1 ${isPositive ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'}`}>
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <div>
                      <div className="font-medium">
                        {formatCurrency(Math.abs(netIncome))}
                      </div>
                      <div className="text-xs">
                        {isPositive ? 'Surplus' : 'Deficit'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Income Sources */}
                <div className="col-span-2">
                  <div className="text-sm text-[var(--text-primary)]">
                    {budget.budget_income?.filter(income => income.is_selected).length || 0} sources
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {budget.budget_expenses?.filter(expense => expense.is_selected).length || 0} categories
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditBudget(budget)}
                      className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-hover)] rounded transition-colors"
                      title="Edit Budget"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteBudget(budget.month)}
                      className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-danger)] hover:bg-[var(--bg-hover)] rounded transition-colors"
                      title="Delete Budget"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}