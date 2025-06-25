// app/dashboard/components/portfolio/portfolio-modals/create-portfolio-modal.tsx

'use client'

import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

interface CreatePortfolioModalProps {
  onClose: () => void
  onCreatePortfolio: (name: string) => Promise<void>
}

export function CreatePortfolioModal({ 
  onClose, 
  onCreatePortfolio 
}: CreatePortfolioModalProps) {
  const [portfolioName, setPortfolioName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!portfolioName.trim()) {
      setError('Portfolio name is required')
      return
    }

    try {
      setIsLoading(true)
      await onCreatePortfolio(portfolioName.trim())
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
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Create Portfolio</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Portfolio Name
            </label>
            <input
              type="text"
              value={portfolioName}
              onChange={(e) => {
                setPortfolioName(e.target.value)
                setError('')
              }}
              className="w-full p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="Enter portfolio name"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm rounded-lg bg-[var(--accent-primary-10)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary-20)] transition-colors flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              Create Portfolio
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}