// components/Transactions/modals/DeleteAll.tsx

'use client'

import { AlertTriangle } from 'lucide-react'

interface DeleteAllProps {
  onConfirm: () => Promise<void>
  onCancel: () => void
  portfolioName: string
}

export default function DeleteAll({ onConfirm, onCancel, portfolioName }: DeleteAllProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-md relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Delete All Transactions
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Portfolio: {portfolioName}
            </p>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-400 mb-2">
            <strong>Warning:</strong> This action cannot be undone.
          </p>
          <p className="text-sm text-red-400">
            All transactions in this portfolio will be permanently deleted. This will also reset your portfolio balance and performance metrics.
          </p>
        </div>

        {/* Confirmation Text */}
        <p className="text-[var(--text-secondary)] mb-6">
          Are you sure you want to delete all transactions from "{portfolioName}"?
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete All Transactions
          </button>
        </div>
      </div>
    </div>
  )
}