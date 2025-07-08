// components/Portfolios/modals/AddAssetModal.tsx
'use client'

import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { AssetCategory, Metal, Crypto, Stock, Currency } from '@/types'
import { 
  CRYPTO_ASSETS,
  PRECIOUS_METALS,
  STOCKS_AND_INDEXES,
  REIT_ASSETS,
  BONDS,
  COMMODITIES,
  CURRENCIES 
} from '@/lib/asset-options'

type AssetOption = {
  readonly symbol: string;
  readonly name: string;
}

interface AddAssetModalProps {
  onClose: () => void
  onAddAsset: (asset: {
    category: AssetCategory
    asset_type: string
    quantity: number
    price: number
    date: string
  }) => Promise<void>
  marketData: {
    metals: Metal[] | null
    crypto: Crypto[] | null
    stocks: Stock[] | null
    currencies: Currency[] | null
  }
  portfolioName: string
}

export function AddAssetModal({ 
  onClose, 
  onAddAsset, 
  marketData,
  portfolioName 
}: AddAssetModalProps) {
  const [category, setCategory] = useState<AssetCategory>('Crypto')
  const [assetType, setAssetType] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const getAssetOptions = (category: AssetCategory): readonly AssetOption[] => {
    switch (category) {
      case 'Crypto':
        return CRYPTO_ASSETS
      case 'Precious Metals':
        return PRECIOUS_METALS
      case 'Stocks & Indexes':
        return STOCKS_AND_INDEXES
      case 'REIT':
        return REIT_ASSETS
      case 'Bonds':
        return BONDS
      case 'Commodities':
        return COMMODITIES
      case 'Cash':
        return CURRENCIES.map(currency => ({
          symbol: currency.code,
          name: currency.name
        })) as readonly AssetOption[]
      default:
        return []
    }
  }

  const getCurrentPrice = (symbol: string): number => {
    switch (category) {
      case 'Crypto':
        return marketData.crypto?.find(c => c.symbol === symbol)?.price || 0
      case 'Precious Metals':
        return marketData.metals?.find(m => m.metal.toLowerCase() === symbol.toLowerCase())?.price || 0
      case 'Stocks & Indexes':
        return marketData.stocks?.find(s => s.symbol === symbol)?.price || 0
      case 'Cash':
        return marketData.currencies?.find(c => c.symbol === symbol)?.price || 1
      default:
        return 0
    }
  }

  const handleAssetTypeChange = (symbol: string) => {
    setAssetType(symbol)
    const currentPrice = getCurrentPrice(symbol)
    if (currentPrice > 0) {
      setPrice(currentPrice.toString())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!category || !assetType || !quantity || !price || !date) {
      setError('All fields are required')
      return
    }

    const quantityNum = Number(quantity)
    const priceNum = Number(price)

    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Quantity must be greater than 0')
      return
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be greater than 0')
      return
    }

    try {
      setIsLoading(true)
      await onAddAsset({
        category,
        asset_type: assetType,
        quantity: quantityNum,
        price: priceNum,
        date
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add asset')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-md relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Add New Asset</h2>
            <p className="text-xs text-[var(--text-secondary)]">to portfolio: {portfolioName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as AssetCategory)
                setAssetType('')
                setPrice('')
              }}
              className="w-full p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              <option value="Crypto">Crypto</option>
              <option value="Precious Metals">Precious Metals</option>
              <option value="Stocks & Indexes">Stocks & Indexes</option>
              <option value="REIT">REIT</option>
              <option value="Bonds">Bonds</option>
              <option value="Cash">Cash</option>
              <option value="Commodities">Commodities</option>
            </select>
          </div>

          {/* Asset Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Asset
            </label>
            <select
              value={assetType}
              onChange={(e) => handleAssetTypeChange(e.target.value)}
              className="w-full p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              <option value="">Select an asset</option>
              {getAssetOptions(category).map((asset) => (
                <option key={asset.symbol} value={asset.symbol}>
                  {asset.name} ({asset.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              step="any"
              min="0"
              className="w-full p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="Enter quantity"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Purchase Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="any"
              min="0"
              className="w-full p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="Enter price per unit"
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
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
              Add Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}