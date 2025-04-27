// app/dashboard/components/portfolio/PortfolioClient.tsx

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, Plus } from 'lucide-react'

import { PortfolioSummary } from './components/portfolio-summary'
import { CategoryList } from './components/category-list'
import { BuySellModal } from './modals/buy-sell-modal'
import { AddTransactionModal } from '@/components/modals/add-transaction'
import { CreatePortfolioModal } from './modals/create-portfolio-modal'

import type {
  AssetCategory,
  CurrencyCode,
  PortfolioAsset,
  PortfolioSummary as PortfolioSummaryType,
  CategorySummary,
  Metal,
  Crypto,
  Stock,
  Currency,
  Portfolio as PortfolioType,
  Transaction
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
};

interface PortfolioClientProps {
  selectedCurrency: CurrencyCode;
  hideBalances: boolean;
  marketData: {
    metals: Metal[] | null;
    crypto: Crypto[] | null;
    stocks: Stock[] | null;
    currencies: Currency[] | null;
  };
  initialPortfolios: PortfolioType[];
  initialDefaultPortfolio: PortfolioType | null;
  initialTransactions: Transaction[];
}

export function PortfolioClient({ 
  selectedCurrency,
  hideBalances,
  marketData,
  initialPortfolios,
  initialDefaultPortfolio,
  initialTransactions
}: PortfolioClientProps) {
  // State for portfolios
  const [portfolios, setPortfolios] = useState<PortfolioType[]>(initialPortfolios)
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioType | null>(initialDefaultPortfolio)
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false)
  const [portfolioError, setPortfolioError] = useState<string | null>(null)
  
  // State for transactions and assets
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>([])
  const [isSummaryLoading, setIsSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  
  // User preferences
  const [expandedCategories, setExpandedCategories] = useState<AssetCategory[]>([])
  
  // Modal states
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
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false)
  
  // State for portfolio summary
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummaryType>({
    total_value: 0,
    total_cost: 0,
    total_profit_loss: 0,
    total_profit_loss_percentage: 0,
    asset_count: 0,
    categories: DEFAULT_CATEGORIES
  })
  
  // Fetch portfolios
  const fetchPortfolios = useCallback(async () => {
    try {
      setIsPortfolioLoading(true)
      setPortfolioError(null)
      
      const response = await fetch('/api/portfolios')
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolios')
      }
      
      const data = await response.json()
      
      if (data.success && data.portfolios) {
        setPortfolios(data.portfolios)
        
        // Select the default portfolio or the first one if no default exists
        const defaultPortfolio = data.portfolios.find((p: PortfolioType) => p.is_default) || data.portfolios[0]
        
        if (defaultPortfolio && (!selectedPortfolio || data.portfolios.every((p: PortfolioType) => p.id !== selectedPortfolio.id))) {
          setSelectedPortfolio(defaultPortfolio)
        }
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
    if (!portfolioId) return
    
    setIsSummaryLoading(true)
    setSummaryError(null)
    
    try {
      // First fetch the transactions for this portfolio
      const transactionsResponse = await fetch(`/api/transactions?portfolioId=${portfolioId}`)
      
      if (!transactionsResponse.ok) {
        throw new Error('Failed to fetch transactions')
      }
      
      const transactionsData = await transactionsResponse.json()
      
      if (transactionsData.success && transactionsData.transactions) {
        setTransactions(transactionsData.transactions)
      }
      
      // Then fetch the summary data
      const summaryResponse = await fetch(`/api/portfolio-summary?portfolioId=${portfolioId}`)
      
      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch portfolio summary')
      }
      
      const summaryData = await summaryResponse.json()
      
      if (summaryData.success && summaryData.summary) {
        setPortfolioSummary(summaryData.summary)
        
        // Also fetch portfolio assets
        const assetsResponse = await fetch(`/api/portfolio-assets?portfolioId=${portfolioId}`)
        
        if (assetsResponse.ok) {
          const assetsData = await assetsResponse.json()
          
          if (assetsData.success && assetsData.assets) {
            setPortfolioAssets(assetsData.assets)
          }
        }
      } else {
        throw new Error('Invalid summary data')
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
      setSummaryError(error instanceof Error ? error.message : 'Failed to load portfolio data')
    } finally {
      setIsSummaryLoading(false)
    }
  }, [])

  // Handle creating a new portfolio
  const handleCreatePortfolio = async (name: string) => {
    try {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portfolio')
      }

      const data = await response.json()
      
      if (data.success && data.portfolio) {
        // Refresh portfolios list
        fetchPortfolios()
        // Select the newly created portfolio
        setSelectedPortfolio(data.portfolio)
      } else {
        throw new Error('Failed to create portfolio')
      }
      
      return data.portfolio
    } catch (error) {
      console.error('Error creating portfolio:', error)
      throw error
    }
  }

  // Handle renaming a portfolio
  const handleRenamePortfolio = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/portfolios/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error('Failed to rename portfolio')
      }

      const data = await response.json()
      
      if (data.success) {
        // Refresh portfolios list
        fetchPortfolios()
      } else {
        throw new Error('Failed to rename portfolio')
      }
    } catch (error) {
      console.error('Error renaming portfolio:', error)
      throw error
    }
  }

  // Handle deleting a portfolio
  const handleDeletePortfolio = async (id: string) => {
    try {
      const response = await fetch(`/api/portfolios/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete portfolio')
      }

      const data = await response.json()
      
      if (data.success) {
        // Refresh portfolios list
        fetchPortfolios()
      } else {
        throw new Error('Failed to delete portfolio')
      }
    } catch (error) {
      console.error('Error deleting portfolio:', error)
      throw error
    }
  }

  // Add a transaction (buy or sell)
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolio_id: selectedPortfolio.id,
          transaction_type: type,
          category: asset.category,
          asset_type: asset.asset_type,
          quantity: asset.quantity,
          price: asset.price,
          date: asset.date
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add transaction')
      }

      // Refresh portfolio data after transaction
      if (selectedPortfolio) {
        fetchPortfolioSummary(selectedPortfolio.id)
      }
      
      return true
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }

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
    const purchaseTransactions = transactions.filter(
      t => t.category === asset.category && 
           t.asset_type === asset.asset_type && 
           t.transaction_type === 'BUY'
    )
    
    let firstPurchaseDate: string | undefined
    
    if (purchaseTransactions.length > 0) {
      const sortedTransactions = [...purchaseTransactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      firstPurchaseDate = sortedTransactions[0].date
    }
    
    setBuySellModal({
      show: true,
      type: 'SELL',
      asset: {
        category: asset.category,
        asset_type: asset.asset_type,
        current_price: asset.current_price || 0,
        quantity: asset.quantity,
        minDate: firstPurchaseDate
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
      indicator.innerText = 'Adding asset...';
      document.body.appendChild(indicator);
      
      // Add transaction (buying a new asset)
      await handleAddTransaction('BUY', {
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

  // Toggle category expansion
  const toggleCategory = (category: AssetCategory) => {
    setExpandedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // Get available quantity at a specific date (for sell validation)
  const getAvailableQuantityAtDate = (
    dateStr: string,
    category?: AssetCategory,
    assetType?: string
  ): number => {
    if (!category || !assetType) return 0;
    
    const date = new Date(dateStr)
    
    const relevantTransactions = transactions.filter(
      t => t.category === category && 
           t.asset_type === assetType && 
           new Date(t.date) <= date
    )
    
    let quantity = 0
    
    for (const transaction of relevantTransactions) {
      if (transaction.transaction_type === 'BUY') {
        quantity += transaction.quantity
      } else if (transaction.transaction_type === 'SELL') {
        quantity -= transaction.quantity
      }
    }
    
    return quantity
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
      // This is just a first render and we already have transaction data
      // In a real app, call your calculation function here or set isSummaryLoading to false
      // if the initialPortfolioSummary was provided from the server
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
          <p className="text-[var(--text-secondary)] mb-4">You don't have any portfolios yet. Create your first portfolio to get started.</p>
          <button
            onClick={() => setShowCreatePortfolio(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary-10)] text-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-primary-20)] transition-colors"
          >
            <span>Create Portfolio</span>
          </button>
          
          {showCreatePortfolio && (
            <CreatePortfolioModal
              onClose={() => setShowCreatePortfolio(false)}
              onCreatePortfolio={handleCreatePortfolio}
            />
          )}
        </div>
      </div>
    )
  }

  // For empty portfolio
  const isEmptyPortfolio = 
    portfolioSummary.asset_count === 0 && 
    portfolioAssets.length === 0 && 
    (!initialTransactions || initialTransactions.length === 0);

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl mt-4">
      {/* Header with buttons */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex flex-wrap items-center gap-2">
          {/* Add Asset on the left */}
          <button
            onClick={() => setShowAddAsset(true)}
            className={`${baseButtonClass} ${activeButtonClass} flex items-center gap-1.5`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Add Asset</span>
          </button>
          
          {/* Portfolio selector - same style as Transactions */}
          {portfolios.length > 0 && (
            <select
              value={selectedPortfolio?.id || ''}
              onChange={(e) => {
                const portfolio = portfolios.find(p => p.id === e.target.value);
                if (portfolio) setSelectedPortfolio(portfolio);
              }}
              className={`${baseButtonClass} ${inactiveButtonClass} focus:outline-none`}
            >
              {portfolios.map(portfolio => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                </option>
              ))}
            </select>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Right side placeholder for future buttons */}
        </div>
      </div>

      <div className="p-3 sm:p-6 md:p-6">
        {isSummaryLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-[var(--accent-primary)] animate-spin" />
          </div>
        ) : summaryError ? (
          <div className="text-center py-8 text-red-500">
            <p>{summaryError}</p>
            <button 
              onClick={() => selectedPortfolio && fetchPortfolioSummary(selectedPortfolio.id)}
              className="mt-4 px-4 py-2 bg-[var(--accent-primary-10)] text-[var(--accent-primary)] rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : isEmptyPortfolio ? (
          <div className="text-center py-8">
            <p className="text-[var(--text-secondary)] mb-4">
              This portfolio is empty. Add your first asset to get started.
            </p>
            <button
              onClick={() => setShowAddAsset(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary-10)] text-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-primary-20)] transition-colors"
            >
              Add Asset
            </button>
          </div>
        ) : (
          <>
            <PortfolioSummary 
              summary={portfolioSummary} 
              selectedCurrency={selectedCurrency} 
              hideBalances={hideBalances} 
            />

            <CategoryList 
              categories={portfolioSummary.categories}
              portfolioAssets={portfolioAssets}
              expandedCategories={expandedCategories}
              selectedCurrency={selectedCurrency}
              hideBalances={hideBalances}
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
          onConfirm={handleBuySellConfirm}
          getAvailableQuantityAtDate={getAvailableQuantityAtDate}
        />
      )}

      {showAddAsset && selectedPortfolio && (
        <AddTransactionModal
          onClose={() => setShowAddAsset(false)}
          onAddTransaction={handleAddAsset}
          marketData={marketData}
          portfolios={[{ id: selectedPortfolio.id, name: selectedPortfolio.name }]}
          selectedPortfolioId={selectedPortfolio.id}
          title="Add New Asset"
          initialValues={{
            transactionType: 'BUY'
          }}
        />
      )}

      {showCreatePortfolio && (
        <CreatePortfolioModal
          onClose={() => setShowCreatePortfolio(false)}
          onCreatePortfolio={handleCreatePortfolio}
        />
      )}
    </div>
  )
}