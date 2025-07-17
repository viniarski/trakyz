// app/dashboard/components/analytics/Analytics.tsx

'use client'

import { useState } from 'react'
import { AnalyticsHeader } from '@/components/Analytics/components/AnalyticsHeader'
import { AnalyticsOverview } from '@/components/Analytics/components/AnalyticsOverview'
import { AnalyticsPerformance } from '@/components/Analytics/components/AnalyticsPerformance'
import { AnalyticsAllocation } from '@/components/Analytics/components/AnalyticsAllocation'
import { AnalyticsInsights } from '@/components/Analytics/components/AnalyticsInsights'
import type { Transaction, Portfolio, DebtData } from '@/types'

interface AnalyticsProps {
  transactions: Transaction[]
  portfolios: Portfolio[]
  debtData: DebtData
  userId: string
}

export default function Analytics({ 
  transactions, 
  portfolios, 
  debtData, 
  userId 
}: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState<'1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'>('1M')
  
  // Mock data for current prices and historical data
  const currentPrices: Record<string, number> = {}
  const historicalData = {
    crypto: [],
    stocks: [],
    metals: [],
    currencies: []
  }
  const selectedCurrency = 'USD'

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