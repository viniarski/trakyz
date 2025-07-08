// app/dashboard/components/portfolio/Portfolio.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { 
  PortfolioHeader,
  PortfolioSummary,
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
  const [expandedCategories, setExpandedCategories] = useState<AssetCategory[]>(['Crypto', 'Stocks & Indexes'])
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
  const handleDeletePortfolio = async (portfolioId: string) => {
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete portfolio')

      setPortfolios(prev => prev.filter(p => p.id !== portfolioId))
      
      // Select another portfolio if the deleted one was selected
      if (selectedPortfolio?.id === portfolioId) {
        const remainingPortfolios = portfolios.filter(p => p.id !== portfolioId)
        setSelectedPortfolio(getDefaultPortfolio(remainingPortfolios))
      }
    } catch (error) {
      console.error('Error deleting portfolio:', error)
      throw error
    }
  }

  // Add transaction
  const handleAddTransaction = async (
    type: 'BUY' | 'SELL',
    asset: {
      category: AssetCategory
      asset_type: string
      quantity: number
      price: number
      date: string
    }
  ) => {
    if (!selectedPortfolio) return

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio_id: selectedPortfolio.id,
          transaction_type: type,
          category: asset.category,
          asset_type: asset.asset_type,
          quantity: asset.quantity,
          price: asset.price,
          date: asset.date
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add transaction')
      }

      const newTransaction = await response.json()
      setTransactions(prev => [...prev, newTransaction[0]])
      
      // Refresh portfolio summary
      fetchPortfolioSummary(selectedPortfolio.id)
      
      return newTransaction[0]
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error instanceof Error ? error : new Error('Failed to process transaction')
    }
  }

  // Toggle category expansion
  const toggleCategory = (category: AssetCategory) => {
    setExpandedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // Handle portfolio selection
  const handleSelectPortfolio = (portfolio: Portfolio) => {
    if (portfolio && (!selectedPortfolio || portfolio.id !== selectedPortfolio.id)) {
      setSelectedPortfolio(portfolio)
    }
  }

  // Handle buy action
  const handleBuy = (asset: PortfolioAsset) => {
    setBuySellModal({
      show: true,
      type: 'BUY',
      asset: {
        category: asset.category,
        asset_type: asset.asset_type,
        current_price: asset.current_price || 0
      }
    })
  }

  // Handle sell action
  const handleSell = (asset: PortfolioAsset) => {
    const firstPurchaseDate = getFirstPurchaseDate(asset.category, asset.asset_type)
    setBuySellModal({
      show: true,
      type: 'SELL',
      asset: {
        category: asset.category,
        asset_type: asset.asset_type,
        current_price: asset.current_price || 0,
        quantity: asset.quantity,
        minDate: firstPurchaseDate || undefined
      }
    })
  }

  // Handle buy/sell confirmation
  const handleBuySell = async (
    quantity: number,
    price: number,
    date: string,
    type: 'BUY' | 'SELL'
  ) => {
    if (!buySellModal.asset || !selectedPortfolio) return

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
      console.error('Transaction error:', error)
      alert(error instanceof Error ? error.message : 'Failed to process transaction')
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
      <PortfolioHeader 
        setShowAddAsset={setShowAddAsset}
        portfolios={portfolios}
        selectedPortfolio={selectedPortfolio}
        onSelectPortfolio={handleSelectPortfolio}
        onCreatePortfolio={handleCreatePortfolio}
        onRenamePortfolio={handleRenamePortfolio}
        onDeletePortfolio={handleDeletePortfolio}
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
          <>
            <PortfolioSummary 
              summary={portfolioSummary} 
              hideBalances={false} 
            />

            <CategoryList 
              categories={portfolioSummary.categories}
              portfolioAssets={portfolioAssets}
              expandedCategories={expandedCategories}
              hideBalances={false}
              onBuy={handleBuy}
              onSell={handleSell}
              toggleCategory={toggleCategory}
            />
          </>
        )}
      </div>

      {/* Modals */}
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