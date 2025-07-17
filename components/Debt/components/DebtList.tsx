// components/Debt/components/DebtList.tsx

'use client'

import { useState } from 'react'
import { LoanItem } from './LoanItem'
import { CreditCardItem } from './CreditCardItem'
import { ExpandableCategory } from '@/components/ui/ExpandableCategory'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import type { Loan, CreditCard } from '@/types'

interface DebtListProps {
  loans: Loan[]
  creditCards: CreditCard[]
  onEditLoan: (loan: Loan) => void
  onEditCreditCard: (card: CreditCard) => void
  onDeleteDebt: (debt: { type: 'loan' | 'credit_card'; id: string; name: string }) => void
}

export function DebtList({
  loans,
  creditCards,
  onEditLoan,
  onEditCreditCard,
  onDeleteDebt
}: DebtListProps) {
  const { formatPreciseValue } = useCurrencyConverter()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  // Calculate loan totals
  const totalLoanBalance = loans.reduce((sum, loan) => sum + loan.current_balance, 0)
  const totalLoanPayments = loans.reduce((sum, loan) => sum + loan.monthly_payment, 0)

  // Calculate credit card totals
  const totalCreditBalance = creditCards.reduce((sum, card) => sum + card.balance, 0)
  const totalCreditPayments = creditCards.reduce((sum, card) => sum + card.min_payment, 0)

  return (
    <div className="space-y-2 sm:space-y-4 md:space-y-4">
      {/* Loans Section */}
      {loans.length > 0 && (
        <ExpandableCategory
          icon={
            <svg className="h-5 w-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          title="Loans"
          subtitle={`${loans.length} ${loans.length === 1 ? 'loan' : 'loans'}`}
          isExpanded={expandedSections.has('loans')}
          onToggle={() => toggleSection('loans')}
          rightContent={
            <div className="flex items-center gap-8">
              {/* Total Balance */}
              <div className="flex flex-col items-end">
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Balance</p>
                <p className="text-sm font-medium text-red-500">
                  {formatPreciseValue(totalLoanBalance)}
                </p>
              </div>
              
              {/* Monthly Payments */}
              <div className="flex flex-col items-end">
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Monthly Payments</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {formatPreciseValue(totalLoanPayments)}
                </p>
              </div>
            </div>
          }
        >
          <div className="mt-2 space-y-2">
            {/* Loans Table Header */}
            <div className="hidden md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,0.5fr] gap-4 px-2 py-3 border-b border-[var(--bg-hover)]">
              <div className="text-[var(--text-secondary)] text-sm">Loan Name</div>
              <div className="text-[var(--text-secondary)] text-sm text-right">Balance</div>
              <div className="text-[var(--text-secondary)] text-sm text-right">Monthly Payment</div>
              <div className="text-[var(--text-secondary)] text-sm text-right">Interest Rate</div>
              <div className="text-[var(--text-secondary)] text-sm text-right">Term</div>
              <div className="text-[var(--text-secondary)] text-sm text-right">Next Payment</div>
              <div className="text-[var(--text-secondary)] text-sm text-right">Actions</div>
            </div>

            {/* Loans Rows */}
            <div className="space-y-2">
              {loans.map(loan => (
                <LoanItem
                  key={loan.id}
                  loan={loan}
                  onEdit={() => onEditLoan(loan)}
                  onDelete={() => onDeleteDebt({ type: 'loan', id: loan.id, name: loan.name })}
                />
              ))}
            </div>
          </div>
        </ExpandableCategory>
      )}

      {/* Credit Cards Section */}
      {creditCards.length > 0 && (
        <ExpandableCategory
          icon={
            <svg className="h-5 w-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
          title="Credit Cards"
          subtitle={`${creditCards.length} ${creditCards.length === 1 ? 'card' : 'cards'}`}
          isExpanded={expandedSections.has('credit_cards')}
          onToggle={() => toggleSection('credit_cards')}
          rightContent={
            <div className="flex items-center gap-8">
              {/* Total Balance */}
              <div className="flex flex-col items-end">
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Balance</p>
                <p className="text-sm font-medium text-red-500">
                  {formatPreciseValue(totalCreditBalance)}
                </p>
              </div>
              
              {/* Min Payments */}
              <div className="flex flex-col items-end">
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Min Payments</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {formatPreciseValue(totalCreditPayments)}
                </p>
              </div>
            </div>
          }
        >
          <div className="mt-2 space-y-2">
            {/* Credit Cards Table Header */}
            <div className="hidden md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,0.5fr] gap-4 px-2 py-3 border-b border-[var(--bg-hover)]">
              <div className="text-[var(--text-secondary)] text-sm">Card Name</div>
              <div className="text-[var(--text-secondary)] text-sm text-right">Balance</div>
              <div className="text-[var(--text-secondary)] text-sm text-right">Credit Limit</div>
              <div className="text-[var(--text-secondary)] text-sm text-right">Utilization</div>
              <div className="text-[var(--text-secondary)] text-sm text-right">Min Payment</div>
              <div className="text-[var(--text-secondary)] text-sm text-right">Interest Rate</div>
              <div className="text-[var(--text-secondary)] text-sm text-right">Actions</div>
            </div>

            {/* Credit Cards Rows */}
            <div className="space-y-2">
              {creditCards.map(card => (
                <CreditCardItem
                  key={card.id}
                  creditCard={card}
                  onEdit={() => onEditCreditCard(card)}
                  onDelete={() => onDeleteDebt({ type: 'credit_card', id: card.id, name: card.name })}
                />
              ))}
            </div>
          </div>
        </ExpandableCategory>
      )}

      {/* Empty State */}
      {loans.length === 0 && creditCards.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[var(--text-secondary)]">No debt accounts found</p>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Add your first loan or credit card to start tracking
          </p>
        </div>
      )}
    </div>
  )
}