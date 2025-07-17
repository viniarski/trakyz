// app/dashboard/components/analytics/Analytics.tsx

'use client'

import { useState, useMemo } from 'react'
import { AnalyticsHeader } from '@/components/Analytics/components/AnalyticsHeader'
import { AnalyticsOverview } from '@/components/Analytics/components/AnalyticsOverview'
import { AnalyticsPerformance } from '@/components/Analytics/components/AnalyticsPerformance'
import { AnalyticsAllocation } from '@/components/Analytics/components/AnalyticsAllocation'
import { AnalyticsInsights } from '@/components/Analytics/components/AnalyticsInsights'
import type { Transaction, Portfolio, DebtData, MarketData } from '@/types'

interface AnalyticsProps {
  transactions: Transaction[]
  portfolios: Portfolio[]
  debtData: DebtData
  marketData: MarketData  // Add marketData prop
  userId: string
}

export default function Analytics({ 
  transactions, 
  portfolios, 
  debtData, 
  marketData,  // Receive marketData
  userId 
}: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState<'1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'>('1M')
  
  // Process market data to create currentPrices lookup and historicalData
  const { currentPrices, historicalData } = useMemo(() => {
    const prices: Record<string, number> = {}
    
    // Get latest prices for each asset
    if (marketData.crypto) {
      marketData.crypto.forEach(crypto => {
        if (!prices[crypto.symbol] || new Date(crypto.date) > new Date(marketData.crypto.find(c => c.symbol === crypto.symbol && prices[c.symbol])?.date || '')) {
          prices[crypto.symbol] = crypto.price
        }
      })
    }
    
    if (marketData.stocks) {
      marketData.stocks.forEach(stock => {
        if (!prices[stock.symbol] || new Date(stock.date) > new Date(marketData.stocks.find(s => s.symbol === stock.symbol && prices[s.symbol])?.date || '')) {
          prices[stock.symbol] = stock.price
        }
      })
    }
    
    if (marketData.metals) {
      marketData.metals.forEach(metal => {
        const key = metal.metal.toUpperCase()
        if (!prices[key] || new Date(metal.date) > new Date(marketData.metals.find(m => m.metal.toUpperCase() === key && prices[key])?.date || '')) {
          prices[key] = metal.price
        }
      })
    }
    
    if (marketData.currencies) {
      marketData.currencies.forEach(currency => {
        if (!prices[currency.symbol] || new Date(currency.date) > new Date(marketData.currencies.find(c => c.symbol === currency.symbol && prices[c.symbol])?.date || '')) {
          prices[currency.symbol] = currency.price
        }
      })
    }

    const historical = {
      crypto: marketData.crypto || [],
      stocks: marketData.stocks || [],
      metals: marketData.metals || [],
      currencies: marketData.currencies || []
    }

    return { currentPrices: prices, historicalData: historical }
  }, [marketData])

  const selectedCurrency = marketData.selectedCurrency || 'USD'

  // Show empty state if no transactions
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-[var(--bg-hover)] rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No Analytics Available</h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md">
            Start by adding some transactions to your portfolio to see detailed analytics and insights about your investments.
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

  return (
    <>
      {/* Header with title, metrics, and navigation tabs */}
      <AnalyticsHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        transactions={transactions}
        currentPrices={currentPrices}
        selectedCurrency={selectedCurrency}
      />

      {/* Content area for tab content */}
      <div className="px-6 py-4">
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
    </>
  )
}