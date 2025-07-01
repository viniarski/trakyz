// app/dashboard/components/portfolio/PortfolioClient.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, ChevronDown, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreatePortfolioModal } from './CreatePortfolioModal'
import { AddAsset } from '@/components/AddAsset'
import { BuySellModal } from './BuySellModal'
import { AssetCategory, Portfolio, Transaction, PortfolioAsset, PortfolioSummary, MarketData, CategorySummary } from '@/types'
import { PortfolioDisplay } from './PortfolioDisplay'
import { useTransactionValidation } from '@/hooks/useTransactionValidation'

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
};

interface PortfolioClientProps {
  initialPortfolios: Portfolio[]
  initialDefaultPortfolio: Portfolio | null
  initialTransactions: Transaction[]
  initialPortfolioSummary: PortfolioSummary | null
  marketData: MarketData
  userId: string
}

export default function PortfolioClient({
  initialPortfolios,
  initialDefaultPortfolio,
  initialTransactions,
  initialPortfolioSummary,
  marketData,
  userId
}: PortfolioClientProps) {
  // State management
  const [portfolios, setPortfolios] = useState<Portfolio[]>(initialPortfolios)
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(initialDefaultPortfolio)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  
  // State for portfolio summary - Initialize as null instead of incomplete object
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(initialPortfolioSummary)
  
  // UI state
  const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(false)
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false)
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<AssetCategory[]>(['Crypto', 'Stocks & Indexes'])
  
  // Loading states
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [portfolioError, setPortfolioError] = useState<string | null>(null)

  // Buy/Sell modal state
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

  // Use validation hook
  const {
    validateTransaction,
    validatePortfolioIntegrity,
    getAvailableQuantityAtDate,
    getFirstPurchaseDate,
    getOwnedAssets
  } = useTransactionValidation(transactions)

  // Create a default empty summary for when we need to display something
  const getDefaultSummary = useCallback((): PortfolioSummary => ({
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
    created_at: selectedPortfolio?.created_at || new Date().toISOString(),
    updated_at: selectedPortfolio?.updated_at || new Date().toISOString()
  }), [selectedPortfolio])

  // Use the summary or default
  const displaySummary = portfolioSummary || getDefaultSummary()

  // Check portfolio integrity
  const portfolioIntegrity = validatePortfolioIntegrity()

  // Fetch portfolios
  const fetchPortfolios = useCallback(async () => {
    setIsPortfolioLoading(true)
    setPortfolioError(null)
    
    try {
      const response = await fetch('/api/portfolios')
      if (!response.ok) throw new Error('Failed to fetch portfolios')
      
      const data = await response.json()
      setPortfolios(data)
      
      // Set default portfolio if none selected
      if (!selectedPortfolio && data.length > 0) {
        const defaultPortfolio = data.find((p: Portfolio) => p.is_default) || data[0]
        setSelectedPortfolio(defaultPortfolio)
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error)
      setPortfolioError(error instanceof Error ? error.message : 'Failed to load portfolios')
    } finally {
      setIsPortfolioLoading(false)
    }
  }, [selectedPortfolio])

  // Fetch portfolio summary
  const fetchPortfolioSummary = useCallback(async (portfolioId: string) => {
    setIsSummaryLoading(true)
    
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/summary`)
      if (!response.ok) throw new Error('Failed to fetch portfolio summary')
      
      const data = await response.json()
      setPortfolioSummary(data)
      
      // Also fetch transactions for this portfolio
      const transactionsResponse = await fetch(`/api/transactions?portfolio_id=${portfolioId}`)
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData)
      }
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
      setShowCreatePortfolio(false)
    } catch (error) {
      console.error('Error creating portfolio:', error)
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

      await fetchPortfolios()
    } catch (error) {
      console.error('Error deleting portfolio:', error)
      throw error
    }
  }

  // Add a transaction (buy or sell) with validation
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
    
    // Validate transaction before sending to server
    const validation = validateTransaction(
      type,
      asset.category,
      asset.asset_type,
      asset.quantity,
      asset.price,
      asset.date
    )

    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid transaction')
    }

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
        throw new Error(errorData.message || 'Failed to add transaction')
      }

      // Refresh portfolio data after transaction
      if (selectedPortfolio) {
        await fetchPortfolioSummary(selectedPortfolio.id)
      }
      
      return true
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }

  // Handle adding a new asset/transaction
  const handleAddAsset = async (transaction: {
    transaction_type: 'BUY' | 'SELL'
    category: AssetCategory
    asset_type: string
    quantity: number
    price: number
    date: string
    portfolio_id: string
  }) => {
    if (!selectedPortfolio) return;
    
    try {
      // Close modal first to prevent flash
      setShowAddAsset(false);
      
      // Add indicator
      const indicator = document.createElement('div');
      indicator.className = 'fixed bottom-4 right-4 bg-[var(--accent-primary)] text-white px-4 py-2 rounded shadow z-50';
      indicator.innerText = 'Adding transaction...';
      document.body.appendChild(indicator);
      
      // Add transaction with validation
      await handleAddTransaction(transaction.transaction_type, {
        category: transaction.category,
        asset_type: transaction.asset_type,
        quantity: transaction.quantity,
        price: transaction.price,
        date: transaction.date
      });
      
      // Remove indicator
      document.body.removeChild(indicator);
    } catch (error) {
      console.error('Error adding asset:', error);
      alert(error instanceof Error ? error.message : 'Failed to add asset');
    }
  };

  // Handle buy transaction
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

  // Handle sell transaction
  const handleSell = (asset: PortfolioAsset) => {
    // Find the first purchase date for this asset
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

  // Handle buy/sell transaction submission
  const handleBuySellConfirm = async (
    quantity: number,
    price: number,
    date: string,
    type: 'BUY' | 'SELL'
  ) => {
    if (!buySellModal.asset || !selectedPortfolio) return

    try {
      // First close the modal to prevent flash
      const assetInfo = buySellModal.asset
      setBuySellModal({ show: false, type: 'BUY' })
      
      // Add indicator
      const indicator = document.createElement('div')
      indicator.className = 'fixed bottom-4 right-4 bg-[var(--accent-primary)] text-white px-4 py-2 rounded shadow z-50'
      indicator.innerText = 'Processing transaction...'
      document.body.appendChild(indicator)
      
      // Process transaction
      await handleAddTransaction(type, {
        category: assetInfo.category,
        asset_type: assetInfo.asset_type,
        quantity,
        price,
        date
      })
      
      // Remove indicator
      document.body.removeChild(indicator)
    } catch (error) {
      console.error('Transaction error:', error)
      alert(error instanceof Error ? error.message : 'Failed to process transaction')
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

  // Load user preferences for expanded categories
  useEffect(() => {
    const savedCategories = localStorage.getItem('expandedCategories')
    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories)
        if (Array.isArray(parsed)) {
          setExpandedCategories(parsed)
        }
      } catch (e) {
        console.error('Failed to parse saved categories:', e)
      }
    }
  }, [])

  // Save expanded categories to localStorage when they change
  useEffect(() => {
    localStorage.setItem('expandedCategories', JSON.stringify(expandedCategories))
  }, [expandedCategories])

  // When selectedPortfolio changes, fetch its summary
  useEffect(() => {
    if (selectedPortfolio) {
      fetchPortfolioSummary(selectedPortfolio.id)
    }
  }, [selectedPortfolio, fetchPortfolioSummary])

  // Calculate portfolio summary initially if we have transactions data already
  useEffect(() => {
    if (initialTransactions.length > 0 && initialDefaultPortfolio) {
      setIsSummaryLoading(false)
    }
  }, [initialTransactions, initialDefaultPortfolio])

  // Button styles to match the Transactions component
  const baseButtonClass = "text-sm px-3 py-1.5 rounded-md transition-colors font-medium";
  const activeButtonClass = "bg-[var(--accent-primary-20)] text-[var(--accent-primary)]";
  const inactiveButtonClass = "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]";

  if (isPortfolioLoading) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-xl mt-4 min-h-[300px]">
        <div className="p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-[var(--accent-primary)] animate-spin" />
            <p className="text-[var(--text-secondary)]">Loading portfolio data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (portfolioError) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-xl mt-4">
        <div className="p-6 text-center text-red-500">
          <p>Error: {portfolioError}</p>
          <button 
            onClick={() => fetchPortfolios()}
            className="mt-4 px-4 py-2 bg-[var(--accent-primary-10)] text-[var(--accent-primary)] rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // No portfolios yet
  if (portfolios.length === 0) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-xl mt-4">
        <div className="p-6 text-center">
          <p className="text-[var(--text-secondary)] mb-4">You don't have any portfolios yet.</p>
          <Button
            onClick={() => setShowCreatePortfolio(true)}
            className="bg-[var(--accent-primary)] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Portfolio
          </Button>
        </div>
        
        {showCreatePortfolio && (
          <CreatePortfolioModal
            onClose={() => setShowCreatePortfolio(false)}
            onCreatePortfolio={handleCreatePortfolio}
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="bg-[var(--bg-secondary)] rounded-xl mt-4">
        {/* Portfolio header */}
        <div className="p-4 flex justify-center items-center">
          <div className="flex flex-wrap items-center gap-2 justify-center">
            {/* Portfolio selector */}
            <div className="relative">
              <button
                onClick={() => setIsPortfolioMenuOpen(!isPortfolioMenuOpen)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent-primary-10)] hover:bg-[var(--accent-primary-20)] text-[var(--accent-primary)] rounded-lg text-sm transition-colors"
              >
                <span>{selectedPortfolio?.name || "Select Portfolio"}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isPortfolioMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPortfolioMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--bg-hover)] z-50">
                  <div className="max-h-60 overflow-y-auto p-1">
                    {portfolios.map((portfolio) => (
                      <button
                        key={portfolio.id}
                        onClick={() => {
                          setSelectedPortfolio(portfolio);
                          setIsPortfolioMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md ${
                          selectedPortfolio?.id === portfolio.id
                            ? 'bg-[var(--accent-primary-10)] text-[var(--accent-primary)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        }`}
                      >
                        {portfolio.name}
                      </button>
                    ))}
                    <div className="border-t border-[var(--bg-hover)] mt-1 pt-1">
                      <button
                        onClick={() => {
                          setShowCreatePortfolio(true);
                          setIsPortfolioMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create New
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add Asset button */}
            {selectedPortfolio && (
              <Button
                onClick={() => setShowAddAsset(true)}
                variant="subtle"
                size="sm"
                className="flex items-center gap-1.5 bg-[var(--accent-primary-10)] hover:bg-[var(--accent-primary-20)]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Add Asset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Portfolio integrity warning */}
        {!portfolioIntegrity.isValid && (
          <div className="mx-4 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
              <div className="text-sm text-red-400">
                <p className="font-medium">Portfolio Integrity Issues</p>
                <ul className="mt-1 space-y-1">
                  {portfolioIntegrity.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs">Some transactions may violate chronological order rules.</p>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio content */}
        <div className="border-t border-gray-800/50">
          {selectedPortfolio ? (
            <div className="p-4">
              {isSummaryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 text-[var(--accent-primary)] animate-spin" />
                    <p className="text-[var(--text-secondary)] text-sm">Loading portfolio...</p>
                  </div>
                </div>
              ) : displaySummary.asset_count === 0 && displaySummary.assets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[var(--text-secondary)]">
                    Add your first asset to get started.
                  </p>
                  <Button
                    onClick={() => setShowAddAsset(true)}
                    className="bg-[var(--accent-primary)] text-white mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </div>
              ) : (
                <PortfolioDisplay
                  summary={displaySummary}
                  expandedCategories={expandedCategories}
                  toggleCategory={toggleCategory}
                  onBuy={handleBuy}
                  onSell={handleSell}
                  onDeletePortfolio={() => handleDeletePortfolio(selectedPortfolio.id)}
                  marketData={marketData}
                />
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[var(--text-secondary)]">
                Select a portfolio to view its details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreatePortfolio && (
        <CreatePortfolioModal
          onClose={() => setShowCreatePortfolio(false)}
          onCreatePortfolio={handleCreatePortfolio}
        />
      )}

      {showAddAsset && selectedPortfolio && (
        <AddAsset
          onClose={() => setShowAddAsset(false)}
          onAddTransaction={handleAddAsset}
          marketData={marketData}
          portfolios={[{ id: selectedPortfolio.id, name: selectedPortfolio.name }]}
          selectedPortfolioId={selectedPortfolio.id}
          transactions={transactions}
          title="Add New Asset"
          initialValues={{
            transactionType: 'BUY'
          }}
        />
      )}

      {buySellModal.show && buySellModal.asset && (
        <BuySellModal
          isOpen={buySellModal.show}
          onClose={() => setBuySellModal({ show: false, type: 'BUY' })}
          onConfirm={handleBuySellConfirm}
          type={buySellModal.type}
          asset={buySellModal.asset}
          transactions={transactions}
        />
      )}
    </div>
  );
}