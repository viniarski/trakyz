// components/RealEstate/modals/DeletePropertyModal.tsx

'use client'

import { AlertTriangle, X } from 'lucide-react'

interface DeletePropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  propertyName: string
}

export function DeletePropertyModal({
  isOpen,
  onClose,
  onConfirm,
  propertyName
}: DeletePropertyModalProps) {
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-secondary)] rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--bg-hover)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Delete Property</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[var(--text-secondary)] mb-4">
            Are you sure you want to delete{' '}
            <span className="font-medium text-[var(--text-primary)]">"{propertyName}"</span>?
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            This action cannot be undone. All data associated with this property will be permanently removed.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete Property
          </button>
        </div>
      </div>
    </div>
  )
}