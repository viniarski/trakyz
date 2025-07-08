// components/Debt/components/DebtList.tsx

'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { LoanItem } from './LoanItem'
import { CreditCardItem } from './CreditCardItem'
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['loans', 'credit_cards']))

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

  const totalLoanBalance = loans.reduce((sum, loan) => sum + loan.current_balance, 0)
  const totalCreditBalance = creditCards.reduce((sum, card) => sum + card.balance, 0)

  return (
    <div className="space-y-6">
      {/* Loans Section */}
      <div className="bg-[var(--bg-hover)]/30 rounded-xl">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--bg-hover)]/50 transition-colors rounded-xl"
          onClick={() => toggleSection('loans')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Loans</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {loans.length} {loans.length === 1 ? 'loan' : 'loans'} • ${totalLoanBalance.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            {expandedSections.has('loans') ? (
              <ChevronUp className="h-5 w-5 text-[var(--text-secondary)]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[var(--text-secondary)]" />
            )}
          </div>
        </div>

        {expandedSections.has('loans') && (
          <div className="px-4 pb-4">
            {loans.length > 0 ? (
              <div className="space-y-3">
                {loans.map((loan) => (
                  <LoanItem
                    key={loan.id}
                    loan={loan}
                    onEdit={() => onEditLoan(loan)}
                    onDelete={() => onDeleteDebt({ type: 'loan', id: loan.id, name: loan.name })}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[var(--text-secondary)]">No loans found</p>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                  Add your first loan to start tracking
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Credit Cards Section */}
      <div className="bg-[var(--bg-hover)]/30 rounded-xl">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--bg-hover)]/50 transition-colors rounded-xl"
          onClick={() => toggleSection('credit_cards')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Credit Cards</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {creditCards.length} {creditCards.length === 1 ? 'card' : 'cards'} • ${totalCreditBalance.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            {expandedSections.has('credit_cards') ? (
              <ChevronUp className="h-5 w-5 text-[var(--text-secondary)]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[var(--text-secondary)]" />
            )}
          </div>
        </div>

        {expandedSections.has('credit_cards') && (
          <div className="px-4 pb-4">
            {creditCards.length > 0 ? (
              <div className="space-y-3">
                {creditCards.map((card) => (
                  <CreditCardItem
                    key={card.id}
                    creditCard={card}
                    onEdit={() => onEditCreditCard(card)}
                    onDelete={() => onDeleteDebt({ type: 'credit_card', id: card.id, name: card.name })}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[var(--text-secondary)]">No credit cards found</p>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                  Add your first credit card to start tracking
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}