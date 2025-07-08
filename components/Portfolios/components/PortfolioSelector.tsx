// components/Portfolios/components/PortfolioSelector.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, Edit, X, Check, Trash2 } from 'lucide-react'
import { Portfolio } from '@/types'

interface PortfolioSelectorProps {
  portfolios: Portfolio[]
  selectedPortfolio: Portfolio | null
  onSelectPortfolio: (portfolio: Portfolio) => void
  onCreatePortfolio: (name: string) => Promise<void>
  onRenamePortfolio: (id: string, name: string) => Promise<void>
  onDeletePortfolio: (id: string) => Promise<void>
}

export function PortfolioSelector({
  portfolios,
  selectedPortfolio,
  onSelectPortfolio,
  onCreatePortfolio,
  onRenamePortfolio,
  onDeletePortfolio
}: PortfolioSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [newPortfolioName, setNewPortfolioName] = useState('')
  const [editingPortfolio, setEditingPortfolio] = useState<{id: string, name: string} | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when creating or editing
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus()
    }
    if (editingPortfolio && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [isCreating, editingPortfolio])

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) {
      setCreateError('Portfolio name cannot be empty')
      return
    }

    try {
      await onCreatePortfolio(newPortfolioName.trim())
      setNewPortfolioName('')
      setIsCreating(false)
      setCreateError(null)
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create portfolio')
    }
  }

  const handleStartRename = (portfolio: Portfolio) => {
    setEditingPortfolio({ id: portfolio.id, name: portfolio.name })
  }

  const handleRename = async () => {
    if (!editingPortfolio) return
    if (!editingPortfolio.name.trim()) {
      return // Don't allow empty names
    }

    try {
      await onRenamePortfolio(editingPortfolio.id, editingPortfolio.name.trim())
      setEditingPortfolio(null)
    } catch (error) {
      console.error('Error renaming portfolio:', error)
    }
  }

  const handleDeletePortfolio = async (id: string) => {
    try {
      setIsDeleting(id)
      await onDeletePortfolio(id)
      setIsDeleting(null)
    } catch (error) {
      console.error('Error deleting portfolio:', error)
      setIsDeleting(null)
    }
  }

  if (!selectedPortfolio) {
    return (
      <div className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-[var(--accent-primary-10)] text-[var(--accent-primary)] rounded-lg text-sm">
        <span>No Portfolio Selected</span>
      </div>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-[var(--accent-primary-10)] hover:bg-[var(--accent-primary-20)] text-[var(--accent-primary)] rounded-lg text-sm transition-colors"
      >
        <span className="truncate max-w-[120px]">{selectedPortfolio.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--bg-hover)] z-50">
          {/* Portfolio List */}
          <div className="max-h-60 overflow-y-auto p-1">
            {portfolios.map(portfolio => (
              <div key={portfolio.id} className="relative">
                {editingPortfolio && editingPortfolio.id === portfolio.id ? (
                  <div className="flex items-center p-1">
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingPortfolio.name}
                      onChange={(e) => setEditingPortfolio({ ...editingPortfolio, name: e.target.value })}
                      className="flex-1 p-2 rounded bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--bg-hover)]"
                      onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    />
                    <button
                      onClick={handleRename}
                      className="p-2 text-[var(--text-secondary)] hover:text-green-500"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingPortfolio(null)}
                      className="p-2 text-[var(--text-secondary)] hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    className={`flex items-center justify-between p-2 rounded-md ${
                      selectedPortfolio.id === portfolio.id 
                        ? 'bg-[var(--accent-primary-10)] text-[var(--accent-primary)]' 
                        : 'hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    }`}
                  >
                    <button
                      onClick={() => {
                        onSelectPortfolio(portfolio)
                        setIsOpen(false)
                      }}
                      className="flex-1 text-left truncate"
                    >
                      {portfolio.name}
                      {portfolio.is_default && (
                        <span className="ml-1 text-xs text-[var(--text-secondary)]">(Default)</span>
                      )}
                    </button>
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartRename(portfolio)
                        }}
                        className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      {/* Only allow deleting non-default portfolios */}
                      {!portfolio.is_default && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePortfolio(portfolio.id)
                          }}
                          disabled={isDeleting === portfolio.id}
                          className="p-1 text-[var(--text-secondary)] hover:text-red-500 disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Create New Portfolio */}
          <div className="border-t border-[var(--bg-hover)] p-2">
            {isCreating ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newPortfolioName}
                    onChange={(e) => {
                      setNewPortfolioName(e.target.value)
                      setCreateError(null)
                    }}
                    placeholder="Portfolio name"
                    className="flex-1 p-2 rounded bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--bg-hover)]"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreatePortfolio()}
                  />
                  <button
                    onClick={handleCreatePortfolio}
                    className="p-2 text-[var(--accent-primary)] hover:bg-[var(--accent-primary-10)] rounded"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false)
                      setNewPortfolioName('')
                      setCreateError(null)
                    }}
                    className="p-2 text-[var(--text-secondary)] hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {createError && (
                  <p className="text-xs text-red-500">{createError}</p>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
              >
                <Plus className="h-4 w-4" />
                <span>New Portfolio</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}