// app/dashboard/components/portfolio/CreatePortfolioModal.tsx

'use client'

import { useState } from 'react'
import { X, Folder } from 'lucide-react'

interface CreatePortfolioModalProps {
  onClose: () => void
  onCreatePortfolio: (name: string) => Promise<void>
}

export function CreatePortfolioModal({ onClose, onCreatePortfolio }: CreatePortfolioModalProps) {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('Portfolio name is required')
      return
    }

    if (name.trim().length < 2) {
      setError('Portfolio name must be at least 2 characters')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await onCreatePortfolio(name.trim())
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create portfolio')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-md relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--accent-primary-10)] rounded-lg">
              <Folder className="h-5 w-5 text-[var(--accent-primary)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Create New Portfolio
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Portfolio Name Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Portfolio Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--bg-hover)] focus:border-[var(--accent-primary)] rounded-lg py-2 px-3 outline-none transition-colors"
              placeholder="Enter portfolio name"
              maxLength={50}
              autoFocus
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Choose a descriptive name for your portfolio
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 bg-[var(--accent-primary)] text-white py-2 px-4 rounded-lg hover:bg-[var(--accent-primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Portfolio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}