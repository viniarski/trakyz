// components/Portfolios/modals/BuySellModal.tsx
'use client'

import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { CategoryIcon } from '../components/CategoryIcon'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import { AssetCategory } from '@/types'

interface BuySellModalProps {
  assetType: string
  category: AssetCategory
  action: 'BUY' | 'SELL'
  current_price: number
  maxQuantity?: number
  maxDate?: string
  minDate?: string
  onClose: () => void
  onConfirm: (quantity: number, price: number, date: string, type: 'BUY' | 'SELL') => void
  getAvailableQuantityAtDate: (date: string) => number
}

export function BuySellModal({
  assetType,
  category,
  action,
  current_price,
  maxQuantity,
  maxDate = new Date().toISOString().split('T')[0],
  minDate,
  onClose,
  onConfirm,
  getAvailableQuantityAtDate
}: BuySellModalProps) {
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState(current_price?.toString() || '0')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')

  const { formatPreciseValue } = useCurrencyConverter()

  const validateInputs = (): boolean => {
    if (!quantity || !price || !date) {
      setError('All fields are required')
      return false
    }

    const quantityNum = Number(quantity)
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Quantity must be greater than 0')
      return false
    }

    const priceNum = Number(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be greater than 0')
      return false
    }

    if (action === 'SELL') {
      const availableAtDate = getAvailableQuantityAtDate(date)
      if (quantityNum > availableAtDate) {
        setError(`You only had ${availableAtDate} ${assetType} available on ${new Date(date).toLocaleDateString()}`)
        return false
      }

      if (minDate && new Date(date) < new Date(minDate)) {
        setError(`Cannot sell before first purchase date (${new Date(minDate).toLocaleDateString()})`)
        return false
      }
    }

    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateInputs()) {
      return
    }

    setError('')
    onConfirm(Number(quantity), Number(price), date, action)
  }

  const handlePriceChange = (value: string) => {
    const number = value.replace(/[^0-9.]/g, '')
    if (number === '' || /^\d*\.?\d*$/.test(number)) {
      setPrice(number)
    }
  }

  const handleQuantityChange = (value: string) => {
    const number = value.replace(/[^0-9.]/g, '')
    if (number === '' || /^\d*\.?\d*$/.test(number)) {
      setQuantity(number)
    }
  }

  const total = Number(quantity) * Number(price)

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CategoryIcon type={category} />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {action} {assetType}
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
          {/* Current Market Price */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Current Market Price
            </label>
            <input
              type="text"
              value={formatPreciseValue(current_price)}
              disabled
              className="w-full p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] border-0"
            />
          </div>

          {/* Transaction Price */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              {action === 'SELL' ? 'Sell' : 'Purchase'} Price
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="Enter price"
              className="w-full p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Quantity {action === 'SELL' && maxQuantity !== undefined && `(Max: ${maxQuantity})`}
            </label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              placeholder={`Enter ${assetType} quantity`}
              className="w-full p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>

          {/* Total */}
          {quantity && price && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Total
              </label>
              <input
                type="text"
                value={formatPreciseValue(total)}
                disabled
                className="w-full p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] border-0"
              />
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              {action === 'SELL' ? 'Sale' : 'Purchase'} Date
            </label>
            <input
              type="date"
              value={date}
              min={action === 'SELL' ? minDate : undefined}
              max={maxDate}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                action === 'BUY'
                  ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                  : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
              }`}
            >
              Confirm {action}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}