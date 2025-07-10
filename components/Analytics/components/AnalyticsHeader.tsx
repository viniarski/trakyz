// components/Analytics/components/AnalyticsHeader.tsx

'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, DollarSign, PieChart, Target } from 'lucide-react'
import { Header } from '@/components/Header'
import type { Transaction } from '@/types'

interface AnalyticsHeaderProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  selectedPeriod: '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'
  setSelectedPeriod: (period: '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL') => void
  transactions: Transaction[]
  currentPrices: Record<string, number>
  selectedCurrency: string
}

export function AnalyticsHeader({
  activeTab,
  setActiveTab,
  selectedPeriod,
  setSelectedPeriod,
  transactions,
  currentPrices,
  selectedCurrency
}: AnalyticsHeaderProps) {
  
  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    const assetHoldings = new Map<string, { quantity: number; totalCost: number; category: string; assetType: string }>()
    
    transactions.forEach(transaction => {
      const key = `${transaction.category}-${transaction.asset_type}`
      const existing = assetHoldings.get(key) || { 
        quantity: 0, 
        totalCost: 0, 
        category: transaction.category,
        assetType: transaction.asset_type
      }
      
      if (transaction.transaction_type === 'BUY') {
        existing.quantity += transaction.quantity
        existing.totalCost += transaction.quantity * transaction.price
      } else if (transaction.transaction_type === 'SELL') {
        existing.quantity -= transaction.quantity
        existing.totalCost -= transaction.quantity * transaction.price
      }
      
      assetHoldings.set(key, existing)
    })

    let totalValue = 0
    let totalCost = 0
    let assetCount = 0
    const categories = new Set<string>()

    assetHoldings.forEach((holding) => {
      if (holding.quantity > 0) {
        const currentPrice = currentPrices[holding.assetType] || 0
        totalValue += holding.quantity * currentPrice
        totalCost += holding.totalCost
        assetCount++
        categories.add(holding.category)
      }
    })

    const totalProfit = totalValue - totalCost
    const profitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

    return {
      totalValue,
      totalCost,
      totalProfit,
      profitPercentage,
      assetCount,
      categoryCount: categories.size
    }
  }, [transactions, currentPrices])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency === 'BTC' ? 'USD' : selectedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

  const TabButton = ({ id, label, active, onClick }: {
    id: string
    label: string
    active: boolean
    onClick: (id: string) => void
  }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        active
          ? 'bg-[var(--accent-primary-10)] text-[var(--accent-primary)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
      }`}
    >
      {label}
    </button>
  )

  const MetricCard = ({ title, value, change, icon: Icon }: {
    title: string
    value: string
    change?: number
    icon: React.ComponentType<{ className?: string }>
  }) => (
    <div className="bg-[var(--bg-hover)]/30 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{title}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-[var(--accent-primary)]" />
      </div>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          {change >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatPercentage(change)}
          </span>
        </div>
      )}
    </div>
  )

  const leftContent = (
    <>
      {/* Analytics Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="overview" label="Overview" active={activeTab === 'overview'} onClick={setActiveTab} />
        <TabButton id="performance" label="Performance" active={activeTab === 'performance'} onClick={setActiveTab} />
        <TabButton id="allocation" label="Allocation" active={activeTab === 'allocation'} onClick={setActiveTab} />
        <TabButton id="assets" label="Assets" active={activeTab === 'assets'} onClick={setActiveTab} />
        <TabButton id="insights" label="Insights" active={activeTab === 'insights'} onClick={setActiveTab} />
      </div>
    </>
  )

  const rightContent = (
    <>
      {/* Period Selector */}
      <select 
        value={selectedPeriod} 
        onChange={(e) => setSelectedPeriod(e.target.value as any)}
        className="text-sm px-3 py-1.5 rounded-md transition-colors font-medium bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none"
      >
        <option value="1W">1 Week</option>
        <option value="1M">1 Month</option>
        <option value="3M">3 Months</option>
        <option value="6M">6 Months</option>
        <option value="1Y">1 Year</option>
        <option value="ALL">All Time</option>
      </select>
    </>
  )

  return (
    <div>
      {/* Header with tabs and period selector */}
      <Header leftContent={leftContent} rightContent={rightContent} />
      
      {/* Key Metrics Cards */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Value"
            value={formatCurrency(portfolioMetrics.totalValue)}
            change={portfolioMetrics.profitPercentage}
            icon={DollarSign}
          />
          <MetricCard
            title="Total Return"
            value={formatCurrency(portfolioMetrics.totalProfit)}
            change={portfolioMetrics.profitPercentage}
            icon={TrendingUp}
          />
          <MetricCard
            title="Total Assets"
            value={portfolioMetrics.assetCount.toString()}
            icon={PieChart}
          />
          <MetricCard
            title="Categories"
            value={`${portfolioMetrics.categoryCount}/8`}
            icon={Target}
          />
        </div>
      </div>
    </div>
  )
}