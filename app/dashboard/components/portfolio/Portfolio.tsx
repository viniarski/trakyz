// app/dashboard/components/portfolio/Portfolio.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { 
  PortfolioHeader,
  CategoryList,
  BuySellModal,
  AddAssetModal
} from '@/components/Portfolios'
import { useTransactionValidation } from '@/hooks/useTransactionValidation'
import { getDefaultPortfolio } from '@/lib/portfolio-utils'
import type {
  Portfolio,
  Transaction,
  AssetCategory,
  PortfolioSummary as PortfolioSummaryType,
  PortfolioAsset,
  CategorySummary,
  MarketData
} from '@/types'

// Initialize default empty categories object
const DEFAULT_CATEGORIES: Record<AssetCategory, CategorySummary> = {
  'Crypto': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
  'Precious Metals': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
  'Stocks & Indexes': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
  'REIT': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
  'Bonds': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
  'Cash': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
  'Commodities': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
  'Real Estate': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
}

interface PortfolioProps {
  portfolios: Portfolio[]
  transactions: Transaction[]
  marketData: MarketData
  userId: string
}

export default function Portfolio({ 
  portfolios: initialPortfolios,
  transactions: initialTransactions,
  marketData,
  userId 
}: PortfolioProps) {
  // State management
  const [portfolios, setPortfolios] = useState<Portfolio[]>(initialPortfolios)
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(
    getDefaultPortfolio(initialPortfolios)
  )
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummaryType>({
    id: selectedPortfolio?.id || '',
    name: selectedPortfolio?.name || '',
    is_default: selectedPortfolio?.is_default || false,
    total_value: 0,
    total_cost: 0,
    total_profit_loss: 0,
    total_profit_loss_percentage: 0,
    asset_count: 0,
    assets: [],
    categories: DEFAULT_CATEGORIES,
    created_at: selectedPortfolio?.created_at || '',
    updated_at: selectedPortfolio?.updated_at || ''
  })
  const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>([])
  
  // UI state
  const [expandedCategories, setExpandedCategories] = useState<AssetCategory[]>([]) // Empty array = all closed by default
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [buySellModal, setBuySellModal] = useState<{
    show: boolean
    type: 'BUY' | 'SELL'
    asset?: {
      category: AssetCategory
      asset_type: string
      current_price: number
      quantity?: number
      minDate?: string
    }
  }>({ show: false, type: 'BUY' })
  
  // Loading states
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)

  // Use validation hook
  const {
    validateTransaction,
    getAvailableQuantityAtDate,
    getFirstPurchaseDate
  } = useTransactionValidation(transactions)

  // Fetch portfolio summary
  const fetchPortfolioSummary = useCallback(async (portfolioId: string) => {
    setIsSummaryLoading(true)
    
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/summary`)
      if (!response.ok) throw new Error('Failed to fetch portfolio summary')
      
      const data = await response.json()
      setPortfolioSummary(data)
      setPortfolioAssets(data.assets || [])
    } catch (error) {
      console.error('Error fetching portfolio summary:', error)
    } finally {
      setIsSummaryLoading(false)
    }
  }, [])

  // Create portfolio
  const handleCreatePortfolio = async (name: string) => {
    try {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      if (!response.ok) throw new Error('Failed to create portfolio')

      const newPortfolio = await response.json()
      setPortfolios(prev => [...prev, newPortfolio])
      setSelectedPortfolio(newPortfolio)
    } catch (error) {
      console.error('Error creating portfolio:', error)
      throw error
    }
  }

  // Rename portfolio
  const handleRenamePortfolio = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/portfolios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      if (!response.ok) throw new Error('Failed to rename portfolio')

      const updatedPortfolio = await response.json()
      setPortfolios(prev => prev.map(p => p.id === id ? updatedPortfolio : p))
      if (selectedPortfolio?.id === id) {
        setSelectedPortfolio(updatedPortfolio)
      }
    } catch (error) {
      console.error('Error renaming portfolio:', error)
      throw error
    }
  }

  // Delete portfolio
  const handleDeletePortfolio = async (id: string) => {
    try {
      const response = await fetch(`/api/portfolios/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete portfolio')

      setPortfolios(prev => prev.filter(p => p.id !== id))
      
      // If we deleted the selected portfolio, select another one
      if (selectedPortfolio?.id === id) {
        const remainingPortfolios = portfolios.filter(p => p.id !== id)
        setSelectedPortfolio(getDefaultPortfolio(remainingPortfolios))
      }
    } catch (error) {
      console.error('Error deleting portfolio:', error)
      throw error
    }
  }

  // Select portfolio
  const handleSelectPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio)
  }

  // Toggle category expansion
  const toggleCategory = (category: AssetCategory) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // Handle buy action
  const handleBuy = (asset: PortfolioAsset) => {
    setBuySellModal({
      show: true,
      type: 'BUY',
      asset: {
        category: asset.category,
        asset_type: asset.asset_type,
        current_price: asset.current_price,
        quantity: asset.quantity,
        minDate: getFirstPurchaseDate(asset.category, asset.asset_type) || undefined
      }
    })
  }

  // Handle sell action
  const handleSell = (asset: PortfolioAsset) => {
    setBuySellModal({
      show: true,
      type: 'SELL',
      asset: {
        category: asset.category,
        asset_type: asset.asset_type,
        current_price: asset.current_price,
        quantity: asset.quantity,
        minDate: getFirstPurchaseDate(asset.category, asset.asset_type) || undefined
      }
    })
  }

  // Handle buy/sell confirmation - FIXED: Updated to match BuySellModal interface
  const handleBuySell = async (quantity: number, price: number, date: string, type: 'BUY' | 'SELL') => {
    if (!selectedPortfolio || !buySellModal.asset) return

    try {
      await handleAddTransaction(type, {
        category: buySellModal.asset.category,
        asset_type: buySellModal.asset.asset_type,
        quantity,
        price,
        date
      })
      setBuySellModal({ show: false, type: 'BUY' })
    } catch (error) {
      console.error('Error processing buy/sell:', error)
      alert(error instanceof Error ? error.message : 'Failed to process transaction')
    }
  }

  // Add transaction helper
  const handleAddTransaction = async (
    type: 'BUY' | 'SELL',
    transactionData: {
      category: AssetCategory
      asset_type: string
      quantity: number
      price: number
      date: string
    }
  ) => {
    if (!selectedPortfolio) return

    // Validate transaction
    const validation = validateTransaction(
      type,
      transactionData.category,
      transactionData.asset_type,
      transactionData.quantity,
      transactionData.price,
      transactionData.date
    )

    if (!validation.isValid) {
      throw new Error(validation.error || 'Transaction validation failed')
    }

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_type: type,
          portfolio_id: selectedPortfolio.id,
          user_id: userId,
          ...transactionData
        })
      })

      if (!response.ok) throw new Error('Failed to add transaction')

      const newTransaction = await response.json()
      setTransactions(prev => [newTransaction, ...prev])
      
      // Refresh portfolio summary
      await fetchPortfolioSummary(selectedPortfolio.id)
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to process transaction')
    }
  }

  // Handle add asset
  const handleAddAsset = async (newAsset: {
    category: AssetCategory
    asset_type: string
    quantity: number
    price: number
    date: string
  }) => {
    if (!selectedPortfolio) return

    try {
      await handleAddTransaction('BUY', newAsset)
      setShowAddAsset(false)
    } catch (error) {
      console.error('Error adding asset:', error)
      alert(error instanceof Error ? error.message : 'Failed to add asset')
    }
  }

  // Fetch portfolio summary when selected portfolio changes
  useEffect(() => {
    if (selectedPortfolio) {
      fetchPortfolioSummary(selectedPortfolio.id)
    }
  }, [selectedPortfolio, fetchPortfolioSummary])

  // No portfolios yet
  if (portfolios.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--text-secondary)] mb-4">You don't have any portfolios yet.</p>
        <button
          onClick={() => handleCreatePortfolio('My Portfolio')}
          className="px-4 py-2 bg-[var(--accent-primary-10)] text-[var(--accent-primary)] rounded-lg"
        >
          Create Your First Portfolio
        </button>
      </div>
    )
  }

  // If no selected portfolio yet
  if (!selectedPortfolio) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--text-secondary)]">No portfolio selected. Please select or create a portfolio.</p>
      </div>
    )
  }

  // For newly created portfolios with no transactions, show empty state
  const isEmptyPortfolio = transactions.length === 0 || portfolioSummary.asset_count === 0

  return (
    <div>
      {/* Updated PortfolioHeader with summary - FIXED: Added summary prop */}
      <PortfolioHeader 
        setShowAddAsset={setShowAddAsset}
        portfolios={portfolios}
        selectedPortfolio={selectedPortfolio}
        onSelectPortfolio={handleSelectPortfolio}
        onCreatePortfolio={handleCreatePortfolio}
        onRenamePortfolio={handleRenamePortfolio}
        onDeletePortfolio={handleDeletePortfolio}
        summary={portfolioSummary}
        hideBalances={false}
      />

      <div className="p-3 sm:p-6 md:p-6">
        {isSummaryLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-[var(--accent-primary)] animate-spin" />
          </div>
        ) : isEmptyPortfolio ? (
          <div className="text-center py-8">
            <p className="text-[var(--text-secondary)] mb-4">
              This portfolio is empty. Add your first asset to get started.
            </p>
          </div>
        ) : (
          <CategoryList 
            categories={portfolioSummary.categories}
            portfolioAssets={portfolioAssets}
            expandedCategories={expandedCategories}
            hideBalances={false}
            onBuy={handleBuy}
            onSell={handleSell}
            toggleCategory={toggleCategory}
          />
        )}
      </div>

      {/* Modals - FIXED: Updated BuySellModal props */}
      {buySellModal.show && buySellModal.asset && (
        <BuySellModal
          assetType={buySellModal.asset.asset_type}
          category={buySellModal.asset.category}
          action={buySellModal.type}
          current_price={buySellModal.asset.current_price}
          maxQuantity={buySellModal.asset.quantity}
          minDate={buySellModal.asset.minDate}
          onClose={() => setBuySellModal({ show: false, type: 'BUY' })}
          onConfirm={handleBuySell}
          getAvailableQuantityAtDate={(date) => 
            getAvailableQuantityAtDate(
              buySellModal.asset!.category,
              buySellModal.asset!.asset_type,
              date
            )
          }
        />
      )}

      {showAddAsset && selectedPortfolio && (
        <AddAssetModal
          onClose={() => setShowAddAsset(false)}
          onAddAsset={handleAddAsset}
          marketData={marketData}
          portfolioName={selectedPortfolio.name}
        />
      )}
    </div>
  )
}