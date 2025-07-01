// app/dashboard/components/portfolio/BuySellModal.tsx

'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, AlertCircle, Info, TrendingUp, TrendingDown } from 'lucide-react'
import { AssetCategory, Transaction } from '@/types'
import { useTransactionValidation } from '@/hooks/useTransactionValidation'

interface BuySellModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (quantity: number, price: number, date: string, type: 'BUY' | 'SELL') => Promise<void>
  type: 'BUY' | 'SELL'
  asset: {
    category: AssetCategory
    asset_type: string
    current_price: number
    quantity?: number
    minDate?: string
  }
  transactions: Transaction[]
}

export function BuySellModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  asset,
  transactions
}: BuySellModalProps) {
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState(asset.current_price.toString())
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')

  // Use validation hook
  const {
    validateTransaction,
    getAvailableQuantityAtDate,
    getFirstPurchaseDate
  } = useTransactionValidation(transactions)

  // Get available quantity for sell operations
  const availableQuantity = useMemo(() => {
    if (type === 'SELL' && date) {
      return getAvailableQuantityAtDate(asset.category, asset.asset_type, date)
    }
    return 0
  }, [type, asset.category, asset.asset_type, date, getAvailableQuantityAtDate])

  // Get first purchase date
  const firstPurchaseDate = useMemo(() => {
    return getFirstPurchaseDate(asset.category, asset.asset_type)
  }, [asset.category, asset.asset_type, getFirstPurchaseDate])

  // Calculate total value
  const totalValue = useMemo(() => {
    const qty = parseFloat(quantity) || 0
    const prc = parseFloat(price) || 0
    return qty * prc
  }, [quantity, price])

  // Real-time validation
  useEffect(() => {
    if (quantity && price && date) {
      const validation = validateTransaction(
        type,
        asset.category,
        asset.asset_type,
        parseFloat(quantity),
        parseFloat(price),
        date
      )
      
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid transaction')
      } else {
        setValidationError('')
      }
    } else {
      setValidationError('')
    }
  }, [type, asset.category, asset.asset_type, quantity, price, date, validateTransaction])

  // Set minimum date for sell transactions
  const getMinDate = (): string => {
    if (type === 'SELL' && firstPurchaseDate) {
      return firstPurchaseDate.split('T')[0]
    }
    return ''
  }

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity('')
      setPrice(asset.current_price.toString())
      setDate(new Date().toISOString().split('T')[0])
      setError('')
      setValidationError('')
    }
  }, [isOpen, asset.current_price])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!quantity || !price || !date) {
      setError('Please fill in all fields')
      return
    }

    const quantityNum = parseFloat(quantity)
    const priceNum = parseFloat(price)

    // Final validation
    const validation = validateTransaction(
      type,
      asset.category,
      asset.asset_type,
      quantityNum,
      priceNum,
      date
    )

    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid transaction')
      return
    }

    setIsLoading(true)

    try {
      await onConfirm(quantityNum, priceNum, date, type)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Transaction failed')
      setIsLoading(false)
    }
  }

  const handleMaxQuantity = () => {
    if (type === 'SELL' && availableQuantity > 0) {
      setQuantity(availableQuantity.toString())
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-md relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              type === 'BUY' 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-red-500/10 text-red-500'
            }`}>
              {type === 'BUY' ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {type === 'BUY' ? 'Buy' : 'Sell'} {asset.asset_type}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Current price: ${asset.current_price.toFixed(6)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sell-specific information */}
        {type === 'SELL' && (
          <div className="mb-4 space-y-2">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div className="text-sm text-yellow-400">
                  <p className="font-medium">Available to sell: {availableQuantity.toFixed(8)} {asset.asset_type}</p>
                  {firstPurchaseDate && (
                    <p>First purchased: {new Date(firstPurchaseDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Quantity
              {type === 'SELL' && availableQuantity > 0 && (
                <button
                  type="button"
                  onClick={handleMaxQuantity}
                  className="ml-2 text-xs text-[var(--accent-primary)] hover:underline"
                >
                  (Max: {availableQuantity.toFixed(8)})
                </button>
              )}
            </label>
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--bg-hover)] focus:border-[var(--accent-primary)] rounded-lg py-2 px-3 outline-none transition-colors"
              placeholder="Enter quantity"
              max={type === 'SELL' ? availableQuantity : undefined}
              required
            />
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Price per unit (USD)
            </label>
            <input
              type="number"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--bg-hover)] focus:border-[var(--accent-primary)] rounded-lg py-2 px-3 outline-none transition-colors"
              placeholder="Enter price"
              required
            />
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Transaction Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={getMinDate()}
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--bg-hover)] focus:border-[var(--accent-primary)] rounded-lg py-2 px-3 outline-none transition-colors"
              required
            />
          </div>

          {/* Total Value Display */}
          {quantity && price && (
            <div className="bg-[var(--bg-hover)] rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-secondary)]">Total Value:</span>
                <span className="text-lg font-semibold text-[var(--text-primary)]">
                  ${totalValue.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Validation Error */}
          {validationError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <p className="text-sm text-red-400">{validationError}</p>
              </div>
            </div>
          )}

          {/* General Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
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
              disabled={isLoading || !!validationError || !quantity || !price || !date}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                type === 'BUY'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isLoading ? 'Processing...' : `${type === 'BUY' ? 'Buy' : 'Sell'} ${asset.asset_type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}