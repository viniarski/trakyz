// components/Budget/components/BudgetHeader.tsx

'use client'

import { Plus, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BudgetData } from '@/types'

interface BudgetHeaderProps {
  onAddBudget: () => void
  budgets: BudgetData[]
  selectedPeriod: string
  onPeriodChange: (period: string) => void
}

export function BudgetHeader({
  onAddBudget,
  budgets = [],
  selectedPeriod,
  onPeriodChange
}: BudgetHeaderProps) {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Calculate summary statistics for current period
  const currentBudget = budgets.find(b => b.month === selectedPeriod)
  const totalBudgets = budgets.length
  const totalPlannedIncome = currentBudget?.planned_income || 0
  const totalPlannedExpenses = currentBudget?.planned_expenses || 0
  const netIncome = totalPlannedIncome - totalPlannedExpenses

  // Generate period options (last 12 months) - Fixed to avoid duplicates
  const generatePeriodOptions = () => {
    const options = []
    const today = new Date()
    const seenValues = new Set()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthStr = date.toISOString().substring(0, 7) + '-01'
      
      // Skip if we've already seen this value
      if (seenValues.has(monthStr)) continue
      seenValues.add(monthStr)
      
      const displayStr = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
      options.push({ value: monthStr, label: displayStr })
    }
    
    return options
  }

  const periodOptions = generatePeriodOptions()

  return (
    <div>
      {/* Header with buttons - same styling as other components */}
      <div className="p-4 flex justify-between items-center flex-wrap gap-y-2">
        {/* Left side - buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add Budget button */}
          <Button
            onClick={onAddBudget}
            variant="subtle"
            size="sm"
            className="flex items-center gap-1.5 bg-[var(--accent-primary-10)] hover:bg-[var(--accent-primary-20)]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Add Budget</span>
          </Button>
          
          {/* Period selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
            <select
              value={selectedPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-md transition-colors font-medium bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none"
            >
              {periodOptions.map((option, index) => (
                <option key={`${option.value}-${index}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Right side - summary statistics (only show if there are budgets) */}
        {budgets.length > 0 && currentBudget && (
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Planned Income</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(totalPlannedIncome)}</p>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Planned Expenses</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(totalPlannedExpenses)}</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Net Income</p>
              <p className={`text-lg font-bold ${
                netIncome >= 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'
              }`}>
                {formatCurrency(netIncome)}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Border line - same as other components */}
      <div className="border-t border-gray-800/50"></div>
    </div>
  )
}