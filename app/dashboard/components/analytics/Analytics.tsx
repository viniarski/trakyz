// app/dashboard/components/analytics/Analytics.tsx

'use client'

import { useState, useEffect } from 'react'
import { Crown, Loader2 } from 'lucide-react'
import { 
  AnalyticsHeader,
  AnalyticsOverview,
  AnalyticsPerformance,
  AnalyticsAllocation,
  AnalyticsAssets,
  AnalyticsInsights
} from '@/components/Analytics'
import type { 
  DebtData, 
  Portfolio, 
  Transaction, 
  MarketData,
  Currency,
  Crypto,
  Stock,
  Metal
} from '@/types'

interface AnalyticsProps {
  portfolios: Portfolio[]
  transactions: Transaction[]
  debtData: DebtData
  userId: string
}

interface HistoricalData {
  crypto: Crypto[]
  stocks: Stock[]
  metals: Metal[]
  currencies: Currency[]
}

interface CurrencyRates {
  currencies: Currency[] | null
  crypto: Crypto[] | null
}

export default function Analytics({
  portfolios,
  transactions,
  debtData,
  userId,
}: AnalyticsProps) {
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({})
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null)
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates>({
    currencies: null,
    crypto: null
  })
  // Remove the duplicate selectedCurrency declaration
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState<'1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'>('3M')

  // You can integrate with your actual subscription system here
  // Based on your code, you have: subscription_status, is_trial, trial_until, etc.
  const isPro = true // Replace with actual subscription check

  // Fetch market data and historical prices
  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !isPro) return

      try {
        setIsLoading(true)
        
        // Fetch current prices from all market endpoints
        const [metalsRes, cryptoRes, stocksRes, currenciesRes] = await Promise.all([
          fetch('/api/market/metals'),
          fetch('/api/market/crypto'),
          fetch('/api/market/stocks'),
          fetch('/api/market/currencies')
        ])

        const [metalsData, cryptoData, stocksData, currenciesData] = await Promise.all([
          metalsRes.json(),
          cryptoRes.json(),
          stocksRes.json(),
          currenciesRes.json()
        ])

        // Combine all price data
        const prices: Record<string, number> = {}

        metalsData.data?.forEach((metal: any) => {
          if (metal.metal) {
            prices[metal.metal.toLowerCase()] = metal.price
          }
        })

        cryptoData.data?.forEach((crypto: any) => {
          if (crypto.symbol) {
            prices[crypto.symbol] = crypto.price
          }
        })

        stocksData.data?.forEach((stock: any) => {
          if (stock.symbol) {
            prices[stock.symbol] = stock.price
          }
        })

        currenciesData.data?.forEach((currency: any) => {
          if (currency.symbol) {
            prices[currency.symbol] = currency.price
          }
        })

        setCurrentPrices(prices)
        setCurrencyRates({
          currencies: currenciesData.data || null,
          crypto: cryptoData.data || null
        })

        // Set historical data for portfolio value calculation
        setHistoricalData({
          crypto: cryptoData.data || [],
          stocks: stocksData.data || [],
          metals: metalsData.data || [],
          currencies: currenciesData.data || []
        })

      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId && isPro) {
      fetchData()
    } else {
      setIsLoading(false)
    }
  }, [userId, isPro])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
          <span className="text-[var(--text-secondary)]">Loading analytics...</span>
        </div>
      </div>
    )
  }

  // Pro feature notice for non-Pro users
  if (!isPro) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="bg-[var(--bg-secondary)] p-8 rounded-xl text-center max-w-md">
          <div className="mb-4 flex justify-center">
            <Crown className="h-16 w-16 text-yellow-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Pro Feature</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Analytics is available exclusively to Pro subscribers.
          </p>
          <button
            onClick={() => {/* Add your routing logic here */}}
            className="bg-[var(--accent-primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--accent-secondary)] transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    )
  }

  // No transactions state
  if (!transactions || transactions.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="bg-[var(--bg-secondary)] p-8 rounded-xl text-center max-w-md">
          <div className="mb-4 flex justify-center">
            <div className="p-4 bg-[var(--bg-hover)] rounded-full">
              <svg className="h-16 w-16 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">No Transaction Data</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Add some transactions to see your portfolio analytics.
          </p>
          <button
            onClick={() => {/* Add your routing logic here */}}
            className="bg-[var(--accent-primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--accent-secondary)] transition-colors"
          >
            Add Transactions
          </button>
        </div>
      </div>
    )
  }

  const selectedCurrency = 'USD' // Replace with user's selected currency from your system

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        transactions={transactions}
        currentPrices={currentPrices}
        selectedCurrency={selectedCurrency}
      />

      {activeTab === 'overview' && (
        <AnalyticsOverview
          transactions={transactions}
          currentPrices={currentPrices}
          selectedCurrency={selectedCurrency}
          selectedPeriod={selectedPeriod}
          historicalData={historicalData}
        />
      )}

      {activeTab === 'performance' && (
        <AnalyticsPerformance
          transactions={transactions}
          currentPrices={currentPrices}
          selectedCurrency={selectedCurrency}
          selectedPeriod={selectedPeriod}
          historicalData={historicalData}
        />
      )}

      {activeTab === 'allocation' && (
        <AnalyticsAllocation
          transactions={transactions}
          currentPrices={currentPrices}
          selectedCurrency={selectedCurrency}
        />
      )}

      {activeTab === 'assets' && (
        <AnalyticsAssets
          transactions={transactions}
          currentPrices={currentPrices}
          selectedCurrency={selectedCurrency}
        />
      )}

      {activeTab === 'insights' && (
        <AnalyticsInsights
          transactions={transactions}
          currentPrices={currentPrices}
          selectedCurrency={selectedCurrency}
          portfolios={portfolios}
          debtData={debtData}
        />
      )}
    </div>
  )
}