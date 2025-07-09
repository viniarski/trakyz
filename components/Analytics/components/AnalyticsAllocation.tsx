// components/Analytics/components/AnalyticsAllocation.tsx

'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, Target, AlertCircle } from 'lucide-react'
import type { Transaction } from '@/types'

interface AnalyticsAllocationProps {
  transactions: Transaction[]
  currentPrices: Record<string, number>
  selectedCurrency: string
}

export function AnalyticsAllocation({
  transactions,
  currentPrices,
  selectedCurrency
}: AnalyticsAllocationProps) {
  
  // Calculate category analytics
  const categoryAnalytics = useMemo(() => {
    const analytics: Record<string, any> = {}
    
    transactions.forEach(transaction => {
      if (!analytics[transaction.category]) {
        analytics[transaction.category] = {
          totalValue: 0,
          totalCost: 0,
          percentChange: 0,
          valueChange: 0,
          count: 0,
          assets: {}
        }
      }
      
      const currentPrice = currentPrices[transaction.asset_type] || transaction.price
      const value = transaction.quantity * currentPrice
      const cost = transaction.quantity * transaction.price
      
      if (transaction.transaction_type === 'BUY') {
        analytics[transaction.category].totalValue += value
        analytics[transaction.category].totalCost += cost
        analytics[transaction.category].count += 1
        analytics[transaction.category].assets[transaction.asset_type] = 
          (analytics[transaction.category].assets[transaction.asset_type] || 0) + value
      } else if (transaction.transaction_type === 'SELL') {
        analytics[transaction.category].totalValue -= value
        analytics[transaction.category].totalCost -= cost
        analytics[transaction.category].count -= 1
        analytics[transaction.category].assets[transaction.asset_type] = 
          (analytics[transaction.category].assets[transaction.asset_type] || 0) - value
      }
    })

    // Calculate percentage changes
    Object.keys(analytics).forEach(category => {
      const categoryData = analytics[category]
      if (categoryData.totalCost > 0) {
        categoryData.valueChange = categoryData.totalValue - categoryData.totalCost
        categoryData.percentChange = (categoryData.valueChange / categoryData.totalCost) * 100
      }
    })

    return analytics
  }, [transactions, currentPrices])

  // Calculate allocation data for charts
  const allocationData = useMemo(() => {
    const totalValue = Object.values(categoryAnalytics).reduce((sum: number, data: any) => sum + Math.max(0, data.totalValue), 0)

    return Object.entries(categoryAnalytics)
      .filter(([_, data]: [string, any]) => data.totalValue > 0)
      .map(([category, data]: [string, any]) => ({
        category,
        value: data.totalValue,
        percentage: totalValue > 0 ? ((data.totalValue / totalValue) * 100) : 0,
        count: data.count,
        profitLoss: data.valueChange,
        profitPercentage: data.percentChange
      }))
      .sort((a, b) => b.value - a.value)
  }, [categoryAnalytics])

  // Asset breakdown within categories
  const assetBreakdown = useMemo(() => {
    const breakdown: Record<string, any[]> = {}
    
    Object.entries(categoryAnalytics).forEach(([category, data]: [string, any]) => {
      if (data.totalValue > 0) {
        breakdown[category] = Object.entries(data.assets)
          .filter(([_, value]: [string, any]) => value > 0)
          .map(([asset, value]: [string, any]) => ({
            asset,
            value,
            percentage: data.totalValue > 0 ? ((value / data.totalValue) * 100) : 0
          }))
          .sort((a, b) => b.value - a.value)
      }
    })
    
    return breakdown
  }, [categoryAnalytics])

  // Diversification analysis
  const diversificationMetrics = useMemo(() => {
    const totalValue = allocationData.reduce((sum, item) => sum + item.value, 0)
    const categories = allocationData.length
    const totalAssets = Object.values(categoryAnalytics).reduce((sum: number, data: any) => sum + Object.keys(data.assets).length, 0)
    
    // Calculate concentration (Herfindahl index)
    const concentration = allocationData.reduce((sum, item) => {
      const weight = item.value / totalValue
      return sum + (weight * weight)
    }, 0)
    
    const diversificationScore = Math.max(0, 100 - (concentration * 100))
    const largestAllocation = allocationData.length > 0 ? allocationData[0].percentage : 0
    
    return {
      categories,
      totalAssets,
      diversificationScore,
      largestAllocation,
      concentration: concentration * 100
    }
  }, [allocationData, categoryAnalytics])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency === 'BTC' ? 'USD' : selectedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
            Percentage: {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Allocation Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-primary)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Category Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
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
        </div>

        {/* Bar Chart */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-primary)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Value Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                <XAxis 
                  dataKey="category" 
                  stroke="var(--text-secondary)" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  fontSize={12}
                />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="var(--accent-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diversification Metrics */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-primary)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Diversification</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Diversification Score</span>
              <span className="text-xl font-bold text-[var(--accent-primary)]">
                {diversificationMetrics.diversificationScore.toFixed(0)}/100
              </span>
            </div>
            <div className="w-full bg-[var(--bg-hover)] rounded-full h-2">
              <div 
                className="bg-[var(--accent-primary)] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${diversificationMetrics.diversificationScore}%` }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-[var(--bg-hover)]/50 rounded-lg">
                <div className="text-lg font-semibold text-[var(--accent-primary)]">
                  {diversificationMetrics.categories}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">Categories</div>
              </div>
              <div className="text-center p-3 bg-[var(--bg-hover)]/50 rounded-lg">
                <div className="text-lg font-semibold text-[var(--accent-primary)]">
                  {diversificationMetrics.totalAssets}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">Assets</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[var(--bg-hover)]/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-[var(--text-primary)]">Risk Analysis</span>
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                Largest allocation: {diversificationMetrics.largestAllocation.toFixed(1)}%
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                Concentration: {diversificationMetrics.concentration.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-primary)]">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Category Performance</h3>
        <div className="space-y-3">
          {allocationData.map((item, index) => (
            <div key={item.category} className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-hover)]/50">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <div>
                  <span className="font-medium text-[var(--text-primary)]">{item.category}</span>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {item.count} asset{item.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-medium text-[var(--text-primary)]">
                    {formatCurrency(item.value)}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {item.profitLoss >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-sm ${item.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercentage(item.profitPercentage)}
                    </span>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {formatCurrency(Math.abs(item.profitLoss))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(assetBreakdown).map(([category, assets]) => (
          <div key={category} className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-primary)]">
            <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">{category} Assets</h3>
            <div className="space-y-2">
              {assets.map((asset, index) => (
                <div key={asset.asset} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-hover)]/30">
                  <span className="text-[var(--text-primary)]">{asset.asset}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      {formatCurrency(asset.value)}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {asset.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Allocation Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-[var(--border-primary)]">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-[var(--text-primary)]">
          <Target className="h-5 w-5 mr-2 text-[var(--accent-primary)]" />
          Allocation Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">✓ Strengths</h4>
            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              <li>• Diversified across {diversificationMetrics.categories} categories</li>
              <li>• {diversificationMetrics.totalAssets} individual assets</li>
              <li>• Diversification score: {diversificationMetrics.diversificationScore.toFixed(0)}/100</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">⚠ Recommendations</h4>
            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              {diversificationMetrics.largestAllocation > 40 && (
                <li>• Consider reducing largest allocation ({diversificationMetrics.largestAllocation.toFixed(1)}%)</li>
              )}
              {diversificationMetrics.categories < 4 && (
                <li>• Consider diversifying into more asset categories</li>
              )}
              <li>• Monitor concentration risk regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}