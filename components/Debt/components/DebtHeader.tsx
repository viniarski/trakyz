// components/Debt/components/DebtHeader.tsx

'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/ui/DashboardHeader'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import type { DebtData } from '@/types'

interface DebtHeaderProps {
  onAddLoan: () => void
  onAddCreditCard: () => void
  debtData?: DebtData // Make optional to handle undefined
}

export function DebtHeader({
  onAddLoan,
  onAddCreditCard,
  debtData
}: DebtHeaderProps) {
  const { formatPreciseValue } = useCurrencyConverter()

  // Provide default empty arrays if debtData is undefined
  const loans = debtData?.loans || []
  const creditCards = debtData?.creditCards || []

  // Calculate debt summary metrics
  const totalDebt = loans.reduce((sum, loan) => sum + loan.current_balance, 0) +
                   creditCards.reduce((sum, card) => sum + card.balance, 0)
  
  const monthlyPayments = loans.reduce((sum, loan) => sum + loan.monthly_payment, 0) +
                         creditCards.reduce((sum, card) => sum + card.min_payment, 0)

  const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.credit_limit, 0)
  const totalCreditUsed = creditCards.reduce((sum, card) => sum + card.balance, 0)
  const creditUtilization = totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0

  const totalAccounts = loans.length + creditCards.length

  // Get credit utilization status and color
  const getUtilizationStatus = (utilization: number) => {
    if (utilization <= 10) return 'Excellent'
    if (utilization <= 30) return 'Good'
    if (utilization <= 60) return 'Fair'
    return 'Poor'
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization <= 30) return 'text-green-500'
    if (utilization <= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const leftContent = (
    <>
      {/* Add Loan button */}
      <Button
        onClick={onAddLoan}
        variant="subtle"
        size="sm"
        className="flex items-center gap-1.5 bg-[var(--accent-primary-10)] hover:bg-[var(--accent-primary-20)]"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden xs:inline">Add Loan</span>
      </Button>
      
      {/* Add Credit Card button */}
      <Button
        onClick={onAddCreditCard}
        variant="subtle"
        size="sm"
        className="flex items-center gap-1.5 bg-[var(--accent-primary-10)] hover:bg-[var(--accent-primary-20)]"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden xs:inline">Add Credit Card</span>
      </Button>
    </>
  )

  const rightContent = (
    <>
      {/* Debt Summary */}
      <div className="flex items-center gap-8">
        {/* Total Debt */}
        <div className="text-right">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Debt</p>
          <p className="text-lg font-bold text-red-500">
            {formatPreciseValue(totalDebt)}
          </p>
        </div>
        
        {/* Monthly Payments */}
        <div className="text-right">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Monthly Payments</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">
            {formatPreciseValue(monthlyPayments)}
          </p>
        </div>
        
        {/* Credit Utilization */}
        <div className="text-right">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Credit Utilization</p>
          <div className="flex items-center justify-end gap-2">
            <p className={`text-lg font-bold ${getUtilizationColor(creditUtilization)}`}>
              {creditUtilization.toFixed(1)}%
            </p>
            <span className={`text-xs px-2 py-1 rounded ${getUtilizationColor(creditUtilization)} bg-opacity-10`}>
              {getUtilizationStatus(creditUtilization)}
            </span>
          </div>
        </div>
        
        {/* Total Accounts */}
        <div className="text-right">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Accounts</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">
            {totalAccounts}
          </p>
        </div>
      </div>
    </>
  )

  return <Header leftContent={leftContent} rightContent={rightContent} />
}