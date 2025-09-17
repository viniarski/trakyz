// components/Analytics/components/AnalyticsHeader.tsx

'use client'

import { DollarSign, TrendingUp, TrendingDown, PieChart, Target } from 'lucide-react'
import { Header } from '@/components/ui/DashboardHeader'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
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
  const { formatPreciseValue } = useCurrencyConverter()

  // Calculate portfolio metrics
  const portfolioMetrics = {
    totalValue: 0,
    totalProfit: 0,
    profitPercentage: 0,
    assetCount: 0,
    categoryCount: 0
  }

  // Helper functions
  const formatCurrency = (value: number) => formatPreciseValue(value)
  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

  // Tab Button Component - Using original styling
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

  // Metric Card Component
  const MetricCard = ({ title, value, change, icon: Icon }: {
    title: string
    value: string
    change?: number
    icon: any
  }) => (
    <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--bg-hover)]">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-[var(--text-secondary)]">{title}</p>
        <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
      </div>
      <p className="text-xl font-bold text-[var(--text-primary)]">{value}</p>
      {change !== undefined && (
        <div className="flex items-center mt-1">
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
        <TabButton id="insights" label="Insights" active={activeTab === 'insights'} onClick={setActiveTab} />
      </div>
    </>
  )

  const rightContent = (
    <>
      {/* Period Selector */}
      <select 
        value={selectedPeriod} 
        onChange={(e) => setSelectedPeriod(e.target.value as '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL')}
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
      <div className="px-6 py-4">
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