// components/Budget/modals/DeleteBudgetModal.tsx

'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface DeleteBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  budgetMonth: string
}

export function DeleteBudgetModal({
  isOpen,
  onClose,
  onConfirm,
  budgetMonth
}: DeleteBudgetModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error('Error deleting budget:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-primary)] rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--bg-hover)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Delete Budget
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-[var(--accent-danger)]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                Are you sure?
              </h3>
              <p className="text-[var(--text-secondary)] mb-4">
                This will permanently delete the budget for{' '}
                <span className="font-medium text-[var(--text-primary)]">
                  {formatDate(budgetMonth)}
                </span>
                . This action cannot be undone.
              </p>
              <div className="bg-[var(--bg-secondary)] border border-[var(--accent-danger-20)] rounded-lg p-3">
                <p className="text-sm text-[var(--text-secondary)]">
                  <strong className="text-[var(--accent-danger)]">Warning:</strong> All associated income sources and expense categories will also be deleted.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--bg-hover)]">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-6 py-2 bg-[var(--accent-danger)] text-white rounded-lg hover:bg-[var(--accent-danger-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? 'Deleting...' : 'Delete Budget'}
          </button>
        </div>
      </div>
    </div>
  )
}