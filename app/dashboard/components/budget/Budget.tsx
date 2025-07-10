// app/dashboard/components/budget/Budget.tsx

'use client'

import { useState, useEffect } from 'react'
import { 
  BudgetHeader,
  BudgetList,
  AddBudgetModal,
  EditBudgetModal,
  DeleteBudgetModal
} from '@/components/Budget'
import type { BudgetData } from '@/types'

interface BudgetProps {
  budgets: BudgetData[]
  userId: string
}

export default function Budget({
  budgets: initialBudgets = [],
  userId
}: BudgetProps) {
  const [budgets, setBudgets] = useState<BudgetData[]>(initialBudgets)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetData | null>(null)
  const [deletingBudget, setDeletingBudget] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')

  // Set default selected period to current month
  useEffect(() => {
    const currentDate = new Date()
    const currentMonth = currentDate.toISOString().substring(0, 7) + '-01'
    setSelectedPeriod(currentMonth)
  }, [])

  // Update budgets when initialBudgets changes
  useEffect(() => {
    setBudgets(initialBudgets)
  }, [initialBudgets])

  const handleAddBudget = async (budgetData: Partial<BudgetData>) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      })

      if (response.ok) {
        const newBudget = await response.json()
        setBudgets(prev => [...prev, newBudget])
        setShowAddModal(false)
      }
    } catch (error) {
      console.error('Error adding budget:', error)
    }
  }

  const handleEditBudget = async (budgetData: Partial<BudgetData>) => {
    if (!editingBudget) return

    try {
      const response = await fetch(`/api/budgets/${editingBudget.month}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      })

      if (response.ok) {
        const updatedBudget = await response.json()
        setBudgets(prev => 
          prev.map(b => b.month === editingBudget.month ? updatedBudget : b)
        )
        setEditingBudget(null)
      }
    } catch (error) {
      console.error('Error updating budget:', error)
    }
  }

  const handleDeleteBudget = async () => {
    if (!deletingBudget) return

    try {
      const response = await fetch(`/api/budgets/${deletingBudget}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBudgets(prev => prev.filter(b => b.month !== deletingBudget))
        setDeletingBudget(null)
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
    }
  }

  const handleEditClick = (budget: BudgetData) => {
    setEditingBudget(budget)
  }

  const handleDeleteClick = (month: string) => {
    setDeletingBudget(month)
  }

  return (
    <div className="space-y-6">
      <BudgetHeader
        onAddBudget={() => setShowAddModal(true)}
        budgets={budgets}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      <BudgetList
        budgets={budgets}
        isLoading={isLoading}
        selectedPeriod={selectedPeriod}
        onEditBudget={handleEditClick}
        onDeleteBudget={handleDeleteClick}
      />

      {/* Add Budget Modal */}
      <AddBudgetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddBudget}
        existingBudgets={budgets}
      />

      {/* Edit Budget Modal */}
      <EditBudgetModal
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        onSubmit={handleEditBudget}
        budget={editingBudget}
      />

      {/* Delete Budget Modal */}
      <DeleteBudgetModal
        isOpen={!!deletingBudget}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleDeleteBudget}
        budgetMonth={deletingBudget || ''}
      />
    </div>
  )
}