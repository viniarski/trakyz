// components/Analytics/components/AnalyticsOverview.tsx

'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
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
  
  // Calculate allocation data
  const allocationData = useMemo(() => {
    const allocation: Record<string, number> = {}
    
    transactions.forEach(transaction => {
      const currentPrice = currentPrices[transaction.asset_type] || transaction.price
      const value = transaction.quantity * currentPrice
      
      if (transaction.transaction_type === 'BUY') {
        allocation[transaction.category] = (allocation[transaction.category] || 0) + value
      } else if (transaction.transaction_type === 'SELL') {
        allocation[transaction.category] = (allocation[transaction.category] || 0) - value
      }
    })

    const totalValue = Object.values(allocation).reduce((sum, value) => sum + Math.max(0, value), 0)

    return Object.entries(allocation)
      .filter(([_, value]) => value > 0)
      .map(([category, value]) => ({
        category,
        value,
        percentage: totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, currentPrices])

  // Calculate asset performance
  const assetPerformance = useMemo(() => {
    const performance: Record<string, any> = {}
    
    transactions.forEach(transaction => {
      if (!performance[transaction.asset_type]) {
        performance[transaction.asset_type] = {
          asset: transaction.asset_type,
          category: transaction.category,
          quantity: 0,
          totalCost: 0,
          currentValue: 0
        }
      }
      
      const cost = transaction.quantity * transaction.price
      if (transaction.transaction_type === 'BUY') {
        performance[transaction.asset_type].quantity += transaction.quantity
        performance[transaction.asset_type].totalCost += cost
      } else {
        performance[transaction.asset_type].quantity -= transaction.quantity
        performance[transaction.asset_type].totalCost -= cost
      }
      
      const currentPrice = currentPrices[transaction.asset_type] || transaction.price
      performance[transaction.asset_type].currentValue = 
        performance[transaction.asset_type].quantity * currentPrice
    })

    return Object.values(performance)
      .filter((p: any) => p.quantity > 0)
      .map((p: any) => ({
        ...p,
        profitLoss: p.currentValue - p.totalCost,
        profitPercentage: p.totalCost > 0 ? ((p.currentValue - p.totalCost) / p.totalCost) * 100 : 0
      }))
      .sort((a: any, b: any) => b.currentValue - a.currentValue)
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

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#EC4899']

  const CustomTooltip = ({ active, payload }: {
    active?: boolean
    payload?: any[]
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-primary)] shadow-lg">
          <p className="text-[var(--text-primary)] font-medium">{payload[0].payload.category}</p>
          <p className="text-[var(--text-secondary)]">
            Value: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-[var(--text-secondary)]">
            Percentage: {payload[0].payload.percentage}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Portfolio Allocation */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Portfolio Allocation</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
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
        <div className="mt-4 space-y-2">
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
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {assetPerformance.slice(0, 10).map((asset, index) => (
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
                <div className="flex items-center gap-1">
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

      {/* Quick Stats */}
      <div className="lg:col-span-2">
        <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[var(--bg-hover)]/30 rounded-lg">
              <div className="text-2xl font-bold text-[var(--accent-primary)]">
                {allocationData.length}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">Categories</div>
            </div>
            <div className="text-center p-4 bg-[var(--bg-hover)]/30 rounded-lg">
              <div className="text-2xl font-bold text-[var(--accent-primary)]">
                {assetPerformance.length}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">Assets</div>
            </div>
            <div className="text-center p-4 bg-[var(--bg-hover)]/30 rounded-lg">
              <div className="text-2xl font-bold text-green-500">
                {assetPerformance.filter(a => a.profitPercentage > 0).length}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">Profitable</div>
            </div>
            <div className="text-center p-4 bg-[var(--bg-hover)]/30 rounded-lg">
              <div className="text-2xl font-bold text-red-500">
                {assetPerformance.filter(a => a.profitPercentage < 0).length}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">Losing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}