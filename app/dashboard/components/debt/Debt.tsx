// app/dashboard/components/debt/Debt.tsx

'use client'

import { useState } from 'react'
import { 
  DebtHeader,
  DebtList,
  AddLoanModal,
  AddCreditCardModal,
  EditLoanModal,
  EditCreditCardModal,
  DeleteDebtModal
} from '@/components/Debt'
import type { DebtData, Loan, CreditCard } from '@/types'

interface DebtProps {
  debtData: DebtData
  userId: string
}

export default function Debt({ debtData, userId }: DebtProps) {
  // State management
  const [loans, setLoans] = useState<Loan[]>(debtData.loans)
  const [creditCards, setCreditCards] = useState<CreditCard[]>(debtData.creditCards)
  
  // Modal states
  const [showAddLoan, setShowAddLoan] = useState(false)
  const [showAddCreditCard, setShowAddCreditCard] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [editingCreditCard, setEditingCreditCard] = useState<CreditCard | null>(null)
  const [deletingDebt, setDeletingDebt] = useState<{
    type: 'loan' | 'credit_card'
    id: string
    name: string
  } | null>(null)

  // Add new loan
  const handleAddLoan = async (loanData: Omit<Loan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...loanData, user_id: userId })
      })

      if (!response.ok) throw new Error('Failed to add loan')

      const newLoan = await response.json()
      setLoans(prev => [...prev, newLoan])
      setShowAddLoan(false)
    } catch (error) {
      console.error('Error adding loan:', error)
      throw error
    }
  }

  // Add new credit card
  const handleAddCreditCard = async (cardData: Omit<CreditCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/credit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cardData, user_id: userId })
      })

      if (!response.ok) throw new Error('Failed to add credit card')

      const newCard = await response.json()
      setCreditCards(prev => [...prev, newCard])
      setShowAddCreditCard(false)
    } catch (error) {
      console.error('Error adding credit card:', error)
      throw error
    }
  }

  // Update loan
  const handleUpdateLoan = async (id: string, loanData: Partial<Loan>) => {
    try {
      const response = await fetch(`/api/loans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanData)
      })

      if (!response.ok) throw new Error('Failed to update loan')

      const updatedLoan = await response.json()
      setLoans(prev => prev.map(loan => loan.id === id ? updatedLoan : loan))
      setEditingLoan(null)
    } catch (error) {
      console.error('Error updating loan:', error)
      throw error
    }
  }

  // Update credit card
  const handleUpdateCreditCard = async (id: string, cardData: Partial<CreditCard>) => {
    try {
      const response = await fetch(`/api/credit-cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      })

      if (!response.ok) throw new Error('Failed to update credit card')

      const updatedCard = await response.json()
      setCreditCards(prev => prev.map(card => card.id === id ? updatedCard : card))
      setEditingCreditCard(null)
    } catch (error) {
      console.error('Error updating credit card:', error)
      throw error
    }
  }

  // Delete debt item
  const handleDeleteDebt = async () => {
    if (!deletingDebt) return

    try {
      const endpoint = deletingDebt.type === 'loan' ? 'loans' : 'credit-cards'
      const response = await fetch(`/api/${endpoint}/${deletingDebt.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error(`Failed to delete ${deletingDebt.type}`)

      if (deletingDebt.type === 'loan') {
        setLoans(prev => prev.filter(loan => loan.id !== deletingDebt.id))
      } else {
        setCreditCards(prev => prev.filter(card => card.id !== deletingDebt.id))
      }

      setDeletingDebt(null)
    } catch (error) {
      console.error(`Error deleting ${deletingDebt?.type}:`, error)
      throw error
    }
  }

  // Calculate totals for summary
  const totalDebt = loans.reduce((sum, loan) => sum + loan.current_balance, 0) +
                   creditCards.reduce((sum, card) => sum + card.balance, 0)
  
  const monthlyPayments = loans.reduce((sum, loan) => sum + loan.monthly_payment, 0) +
                         creditCards.reduce((sum, card) => sum + card.min_payment, 0)

  const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.credit_limit, 0)
  const totalCreditUsed = creditCards.reduce((sum, card) => sum + card.balance, 0)
  const creditUtilization = totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0

return (
  <div className="p-3 sm:p-6 md:p-6">
    {/* Header Section with Summary */}
    <DebtHeader
      onAddLoan={() => setShowAddLoan(true)}
      onAddCreditCard={() => setShowAddCreditCard(true)}
      debtData={{ loans, creditCards }}
    />

    {/* Debt Lists */}
    <div className="p-4">
      <DebtList
        loans={loans}
        creditCards={creditCards}
        onEditLoan={setEditingLoan}
        onEditCreditCard={setEditingCreditCard}
        onDeleteDebt={setDeletingDebt}
      />
    </div>

    {/* Modals... */}
  </div>
)
}