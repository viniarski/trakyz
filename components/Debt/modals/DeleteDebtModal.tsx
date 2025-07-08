// components/Debt/modals/DeleteDebtModal.tsx

'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface DeleteDebtModalProps {
  debtType: 'loan' | 'credit_card'
  debtName: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteDebtModal({ debtType, debtName, onClose, onConfirm }: DeleteDebtModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error(`Error deleting ${debtType}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const typeLabel = debtType === 'loan' ? 'loan' : 'credit card'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[var(--bg-primary)] rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-[var(--bg-hover)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Delete {typeLabel}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500/10 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--text-primary)]">
                Are you sure?
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <p className="text-[var(--text-secondary)] mb-6">
            You are about to permanently delete the {typeLabel} "{debtName}". 
            All associated data will be removed from your account.
          </p>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Deleting...' : `Delete ${typeLabel}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}