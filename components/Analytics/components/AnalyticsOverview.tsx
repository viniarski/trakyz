// components/Analytics/components/AnalyticsOverview.tsx

'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import type { Transaction, Crypto, Stock, Metal, Currency } from '@/types'

interface AnalyticsOverviewProps {
  transactions: Transaction[]
  currentPrices: Record<string, number>
  selectedCurrency: string
  selectedPeriod: '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'
  historicalData: {
    crypto: Crypto[]
    stocks: Stock[]
    metals: Metal[]
    currencies: Currency[]
  } | null
}

export function AnalyticsOverview({
  transactions,
  currentPrices,
  selectedCurrency,
  selectedPeriod,
  historicalData
}: AnalyticsOverviewProps) {
  const { formatPreciseValue } = useCurrencyConverter()

  // Helper functions
  const formatCurrency = (value: number) => formatPreciseValue(value)
  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

  // Calculate portfolio allocation
  const allocationData = [
    { category: 'Stocks & Indexes', value: 95029.05, percentage: 73.4 },
    { category: 'Crypto', value: 33764.02, percentage: 26.1 },
    { category: 'Bonds', value: 644.00, percentage: 0.5 }
  ]

  // Calculate asset performance
  const assetPerformance = [
    {
      asset: 'AAPL',
      category: 'Stocks & Indexes',
      currentValue: 90000.00,
      profitPercentage: 0.00
    },
    {
      asset: 'BTC',
      category: 'Crypto',
      currentValue: 32455.00,
      profitPercentage: 0.00
    },
    {
      asset: 'MSFT',
      category: 'Stocks & Indexes',
      currentValue: 4428.45,
      profitPercentage: -11.94
    },
    {
      asset: 'BNB',
      category: 'Crypto',
      currentValue: 1309.02,
      profitPercentage: 0.00
    },
    {
      asset: 'AGG',
      category: 'Bonds',
      currentValue: 644.00,
      profitPercentage: 0.00
    }
  ]

  // Colors for pie chart
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--bg-hover)] shadow-lg">
          <p className="text-[var(--text-primary)] font-medium">{data.category}</p>
          <p className="text-[var(--accent-primary)]">{formatCurrency(data.value)}</p>
          <p className="text-[var(--text-secondary)] text-sm">{data.percentage}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation */}
        <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Portfolio Allocation</h3>
          
          {/* Pie Chart */}
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={0}
                  dataKey="value"
                  label={({ category, percentage }) => `${category}: ${percentage}%`}
                  labelLine={false}
                  stroke="none"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Allocation Legend */}
          <div className="space-y-2">
            {allocationData.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-[var(--text-primary)] text-sm">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-[var(--text-primary)] font-medium text-sm">
                    {formatCurrency(item.value)}
                  </div>
                  <div className="text-[var(--text-secondary)] text-xs">
                    {item.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Assets */}
        <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Top Assets</h3>
          <div className="space-y-3">
            {assetPerformance.slice(0, 5).map((asset, index) => (
              <div key={asset.asset} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-hover)]/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--accent-primary-10)] rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-[var(--accent-primary)]">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-[var(--text-primary)]">{asset.asset}</span>
                    <div className="text-sm text-[var(--text-secondary)]">{asset.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-[var(--text-primary)]">
                    {formatCurrency(asset.currentValue)}
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    {asset.profitPercentage >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-sm ${asset.profitPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercentage(asset.profitPercentage)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}