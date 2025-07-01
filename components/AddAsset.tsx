// components/AddAsset.tsx

'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, AlertCircle, Info } from 'lucide-react'
import { AssetCategory, Metal, Crypto, Stock, Currency, Transaction } from '@/types'
import { 
  CRYPTO_ASSETS,
  PRECIOUS_METALS,
  STOCKS_AND_INDEXES,
  REIT_ASSETS,
  BONDS,
  COMMODITIES,
  CURRENCIES 
} from '@/lib/asset-options'
import { useTransactionValidation } from '@/hooks/useTransactionValidation'

type AssetOption = {
  readonly symbol: string;
  readonly name: string;
}

// Convert CURRENCIES to AssetOption format
const CURRENCY_OPTIONS: readonly AssetOption[] = CURRENCIES.map(curr => ({
  symbol: curr.code,
  name: curr.name
}))

interface AddAssetProps {
  onClose: () => void
  onAddTransaction: (transaction: {
    transaction_type: 'BUY' | 'SELL'
    category: AssetCategory
    asset_type: string
    quantity: number
    price: number
    date: string
    portfolio_id: string
  }) => Promise<void>
  marketData: {
    metals: Metal[] | null
    crypto: Crypto[] | null
    stocks: Stock[] | null
    currencies: Currency[] | null
  }
  portfolios: Array<{ id: string, name: string }>
  selectedPortfolioId: string | null
  transactions: Transaction[] // Add transactions for validation
  title?: string
  initialValues?: {
    transactionType?: 'BUY' | 'SELL'
    category?: AssetCategory
    assetType?: string
    price?: string
  }
}

export function AddAsset({ 
  onClose, 
  onAddTransaction, 
  marketData,
  portfolios,
  selectedPortfolioId,
  transactions,
  title = "Add Transaction",
  initialValues = {}
}: AddAssetProps) {
  const [transactionType, setTransactionType] = useState<'BUY' | 'SELL'>(initialValues.transactionType || 'BUY')
  const [category, setCategory] = useState<AssetCategory>(initialValues.category || 'Crypto')
  const [assetType, setAssetType] = useState(initialValues.assetType || '')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState(initialValues.price || '')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [portfolioId, setPortfolioId] = useState(selectedPortfolioId || '')
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Use validation hook
  const {
    validateTransaction,
    getAvailableQuantityAtDate,
    getFirstPurchaseDate,
    getOwnedAssets
  } = useTransactionValidation(transactions)

  // Get available assets for selling
  const ownedAssets = useMemo(() => getOwnedAssets(), [getOwnedAssets])

  // Get available quantity for current selection
  const availableQuantity = useMemo(() => {
    if (transactionType === 'SELL' && category && assetType && date) {
      return getAvailableQuantityAtDate(category, assetType, date)
    }
    return 0
  }, [transactionType, category, assetType, date, getAvailableQuantityAtDate])

  // Get first purchase date for current selection
  const firstPurchaseDate = useMemo(() => {
    if (transactionType === 'SELL' && category && assetType) {
      return getFirstPurchaseDate(category, assetType)
    }
    return null
  }, [transactionType, category, assetType, getFirstPurchaseDate])

  // Get asset options based on transaction type and category
  const getAssetOptions = (category: AssetCategory): readonly AssetOption[] => {
    if (transactionType === 'SELL') {
      // For SELL, only show owned assets in this category
      const owned = ownedAssets.filter(asset => asset.category === category)
      return owned.map(asset => ({
        symbol: asset.asset_type,
        name: asset.asset_type
      }))
    }

    // For BUY, show all available assets
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
        return CURRENCY_OPTIONS
      default:
        return []
    }
  }

  // Get current price from market data
  const getCurrentPrice = (category: AssetCategory, symbol: string): number => {
    try {
      switch (category) {
        case 'Crypto':
          const crypto = marketData.crypto?.find(c => c.symbol === symbol)
          return crypto?.price || 0
        case 'Precious Metals':
          const metal = marketData.metals?.find(m => m.metal.toLowerCase() === symbol.toLowerCase())
          return metal?.price || 0
        case 'Stocks & Indexes':
          const stock = marketData.stocks?.find(s => s.symbol === symbol)
          return stock?.price || 0
        case 'Cash':
          const currency = marketData.currencies?.find(c => c.symbol === symbol)
          return currency?.price || 1 // Use price instead of rate
        default:
          return 0
      }
    } catch (error) {
      console.error('Error getting current price:', error)
      return 0
    }
  }

  // Auto-fill price when asset is selected
  useEffect(() => {
    if (assetType && category) {
      const currentPrice = getCurrentPrice(category, assetType)
      if (currentPrice > 0 && !price) {
        setPrice(currentPrice.toString())
      }
    }
  }, [assetType, category])

  // Clear asset selection when category changes
  useEffect(() => {
    setAssetType('')
  }, [category])

  // Clear asset selection when transaction type changes
  useEffect(() => {
    setAssetType('')
    setValidationError('')
  }, [transactionType])

  // Set minimum date for SELL transactions
  const getMinDate = (): string => {
    if (transactionType === 'SELL' && firstPurchaseDate) {
      return firstPurchaseDate.split('T')[0]
    }
    return ''
  }

  // Real-time validation as user types
  useEffect(() => {
    if (transactionType && category && assetType && quantity && price && date) {
      const validation = validateTransaction(
        transactionType,
        category,
        assetType,
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
  }, [transactionType, category, assetType, quantity, price, date, validateTransaction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setValidationError('')

    // Validate required fields
    if (!portfolioId) {
      setError('Please select a portfolio')
      return
    }

    if (!category || !assetType || !quantity || !price || !date) {
      setError('Please fill in all fields')
      return
    }

    const quantityNum = parseFloat(quantity)
    const priceNum = parseFloat(price)

    // Validate transaction
    const validation = validateTransaction(
      transactionType,
      category,
      assetType,
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
      await onAddTransaction({
        transaction_type: transactionType,
        category,
        asset_type: assetType,
        quantity: quantityNum,
        price: priceNum,
        date,
        portfolio_id: portfolioId
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add transaction')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-md relative animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
            {selectedPortfolioId && portfolios.length > 0 && (
              <p className="text-xs text-[var(--text-secondary)]">
                to portfolio: {portfolios.find(p => p.id === selectedPortfolioId)?.name || 'Selected Portfolio'}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTransactionType('BUY')}
                className={`px-4 py-2 rounded-lg transition-colors text-center ${
                  transactionType === 'BUY'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('SELL')}
                className={`px-4 py-2 rounded-lg transition-colors text-center ${
                  transactionType === 'SELL'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                }`}
              >
                Sell
              </button>
            </div>
          </div>

          {/* Show info for SELL transactions */}
          {transactionType === 'SELL' && ownedAssets.length === 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-400">
                  <p className="font-medium">No assets to sell</p>
                  <p>You need to buy assets first before you can sell them.</p>
                </div>
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
              className="w-full bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--bg-hover)] focus:border-[var(--accent-primary)] rounded-lg py-2 px-3 outline-none transition-colors"
            >
              <option value="Crypto">Cryptocurrency</option>
              <option value="Stocks & Indexes">Stocks & ETFs</option>
              <option value="Precious Metals">Precious Metals</option>
              <option value="Cash">Currencies</option>
              <option value="REIT">REITs</option>
              <option value="Bonds">Bonds</option>
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
              onChange={(e) => setAssetType(e.target.value)}
              className="w-full bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--bg-hover)] focus:border-[var(--accent-primary)] rounded-lg py-2 px-3 outline-none transition-colors"
              disabled={transactionType === 'SELL' && ownedAssets.filter(a => a.category === category).length === 0}
            >
              <option value="">Select an asset</option>
              {getAssetOptions(category).map((option) => (
                <option key={option.symbol} value={option.symbol}>
                  {option.symbol} - {option.name}
                </option>
              ))}
            </select>
          </div>

          {/* Show available quantity for SELL */}
          {transactionType === 'SELL' && assetType && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div className="text-sm text-yellow-400">
                  <p className="font-medium">Available to sell: {availableQuantity.toFixed(8)} {assetType}</p>
                  {firstPurchaseDate && (
                    <p>First purchased: {new Date(firstPurchaseDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Quantity
              {transactionType === 'SELL' && availableQuantity > 0 && (
                <span className="text-xs text-[var(--text-tertiary)]">
                  {' '}(Max: {availableQuantity.toFixed(8)})
                </span>
              )}
            </label>
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--bg-hover)] focus:border-[var(--accent-primary)] rounded-lg py-2 px-3 outline-none transition-colors"
              placeholder="Enter quantity"
              max={transactionType === 'SELL' ? availableQuantity : undefined}
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
            />
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={getMinDate()}
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--bg-hover)] focus:border-[var(--accent-primary)] rounded-lg py-2 px-3 outline-none transition-colors"
            />
          </div>

          {/* Portfolio Selection */}
          {portfolios.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Portfolio
              </label>
              <select
                value={portfolioId}
                onChange={(e) => setPortfolioId(e.target.value)}
                className="w-full bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--bg-hover)] focus:border-[var(--accent-primary)] rounded-lg py-2 px-3 outline-none transition-colors"
              >
                <option value="">Select a portfolio</option>
                {portfolios.map((portfolio) => (
                  <option key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </option>
                ))}
              </select>
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

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !!validationError || (transactionType === 'SELL' && ownedAssets.length === 0)}
              className="flex-1 bg-[var(--accent-primary)] text-white py-2 px-4 rounded-lg hover:bg-[var(--accent-primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : `${transactionType === 'BUY' ? 'Buy' : 'Sell'} Asset`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}