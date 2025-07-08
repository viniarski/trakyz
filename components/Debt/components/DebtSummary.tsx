// components/Debt/components/DebtSummary.tsx

'use client'

import { CreditCard, DollarSign, TrendingUp, Users } from 'lucide-react'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'

interface DebtSummaryProps {
  totalDebt: number
  monthlyPayments: number
  creditUtilization: number
  totalAccounts: number
}

export function DebtSummary({
  totalDebt,
  monthlyPayments,
  creditUtilization,
  totalAccounts
}: DebtSummaryProps) {
  const { formatPreciseValue } = useCurrencyConverter()

  const getUtilizationColor = (utilization: number) => {
    if (utilization <= 30) return 'text-green-500'
    if (utilization <= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getUtilizationStatus = (utilization: number) => {
    if (utilization <= 10) return 'Excellent'
    if (utilization <= 30) return 'Good'
    if (utilization <= 60) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Debt */}
      <div className="bg-[var(--bg-hover)]/50 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <DollarSign className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Debt</p>
            <p className="text-lg font-bold text-[var(--text-primary)] truncate">
              {formatPreciseValue(totalDebt)}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Payments */}
      <div className="bg-[var(--bg-hover)]/50 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Monthly Payments</p>
            <p className="text-lg font-bold text-[var(--text-primary)] truncate">
              {formatPreciseValue(monthlyPayments)}
            </p>
          </div>
        </div>
      </div>

      {/* Credit Utilization */}
      <div className="bg-[var(--bg-hover)]/50 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <CreditCard className="h-5 w-5 text-purple-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Credit Utilization</p>
            <div className="flex items-center gap-2">
              <p className={`text-lg font-bold ${getUtilizationColor(creditUtilization)}`}>
                {creditUtilization.toFixed(1)}%
              </p>
              <span className={`text-xs px-2 py-1 rounded ${getUtilizationColor(creditUtilization)} bg-opacity-10`}>
                {getUtilizationStatus(creditUtilization)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Accounts */}
      <div className="bg-[var(--bg-hover)]/50 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Users className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Accounts</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{totalAccounts}</p>
          </div>
        </div>
      </div>
    </div>
  )
}