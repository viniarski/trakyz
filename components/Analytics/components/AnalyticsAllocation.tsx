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

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16']

  const { allocationData, pieData, assetBreakdown, diversificationMetrics } = useMemo(() => {
    // Calculate portfolio allocation
    const assetHoldings = new Map<string, { quantity: number; totalCost: number; category: string }>()
    
    transactions.forEach(transaction => {
      const key = `${transaction.category}-${transaction.asset_type}`
      const existing = assetHoldings.get(key) || { 
        quantity: 0, 
        totalCost: 0, 
        category: transaction.category 
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

    // Calculate category allocations
    const categoryData = new Map<string, { value: number; cost: number; count: number; assets: Set<string> }>()
    
    assetHoldings.forEach((holding, key) => {
      if (holding.quantity > 0) {
        const [category, asset] = key.split('-', 2)
        const currentPrice = currentPrices[asset] || 0
        const currentValue = holding.quantity * currentPrice
        
        const existing = categoryData.get(category) || { value: 0, cost: 0, count: 0, assets: new Set() }
        existing.value += currentValue
        existing.cost += holding.totalCost
        existing.count += 1
        existing.assets.add(asset)
        
        categoryData.set(category, existing)
      }
    })

    const totalValue = Array.from(categoryData.values()).reduce((sum, cat) => sum + cat.value, 0)
    
    // Create allocation data
    const allocations = Array.from(categoryData.entries()).map(([category, data]) => ({
      category,
      value: data.value,
      cost: data.cost,
      count: data.count,
      percentage: (data.value / totalValue) * 100,
      profitLoss: data.value - data.cost,
      profitPercentage: data.cost > 0 ? ((data.value - data.cost) / data.cost) * 100 : 0
    })).sort((a, b) => b.value - a.value)

    // Create pie chart data
    const pieChartData = allocations.map((item, index) => ({
      name: item.category,
      value: item.value,
      percentage: item.percentage,
      color: colors[index % colors.length]
    }))

    // Create asset breakdown by category
    const breakdown: Record<string, Array<{ asset: string; value: number; percentage: number }>> = {}
    
    assetHoldings.forEach((holding, key) => {
      if (holding.quantity > 0) {
        const [category, asset] = key.split('-', 2)
        const currentPrice = currentPrices[asset] || 0
        const currentValue = holding.quantity * currentPrice
        
        if (!breakdown[category]) breakdown[category] = []
        breakdown[category].push({
          asset,
          value: currentValue,
          percentage: (currentValue / totalValue) * 100
        })
      }
    })

    // Sort assets within each category
    Object.keys(breakdown).forEach(category => {
      breakdown[category].sort((a, b) => b.value - a.value)
    })

    // Calculate diversification metrics
    const diversification = {
      categories: categoryData.size,
      totalAssets: Array.from(categoryData.values()).reduce((sum, cat) => sum + cat.assets.size, 0),
      largestAllocation: allocations.length > 0 ? allocations[0].percentage : 0,
      concentration: allocations.slice(0, 3).reduce((sum, item) => sum + item.percentage, 0),
      diversificationScore: Math.min(100, (categoryData.size / 8) * 50 + (1 - (allocations[0]?.percentage || 0) / 100) * 50)
    }

    return {
      allocationData: allocations,
      pieData: pieChartData,
      assetBreakdown: breakdown,
      diversificationMetrics: diversification
    }
  }, [transactions, currentPrices])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency === 'GBP' ? 'GBP' : 'USD'
    }).format(value)
  }

  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: {
    active?: boolean
    payload?: any[]
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--bg-hover)] shadow-lg">
          <p className="text-[var(--text-primary)] font-medium">{payload[0].payload.category}</p>
          <p className="text-[var(--accent-primary)]">
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

  if (allocationData.length === 0) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
        <div className="text-center py-8">
          <PieChart className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No Allocation Data</h3>
          <p className="text-[var(--text-secondary)]">
            Add some transactions to see your portfolio allocation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Allocation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--bg-hover)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Portfolio Allocation</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-[var(--text-primary)]">
                  {item.name} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--bg-hover)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Value Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-hover)" />
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
      </div>

      {/* Diversification Analysis */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--bg-hover)]">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Diversification Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
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
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
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

      {/* Category Performance */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--bg-hover)]">
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
          <div key={category} className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--bg-hover)]">
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
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--bg-hover)]">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-[var(--text-primary)]">
          <Target className="h-5 w-5 mr-2 text-[var(--accent-primary)]" />
          Allocation Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-hover)]/30 rounded-lg p-4">
            <h4 className="font-medium text-green-500 mb-2">✓ Strengths</h4>
            <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
              {diversificationMetrics.categories >= 4 && (
                <li>• Well-diversified across {diversificationMetrics.categories} categories</li>
              )}
              {diversificationMetrics.largestAllocation < 50 && (
                <li>• No over-concentration in single category</li>
              )}
              <li>• Portfolio includes {diversificationMetrics.totalAssets} different assets</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-hover)]/30 rounded-lg p-4">
            <h4 className="font-medium text-orange-500 mb-2">⚠ Areas for Improvement</h4>
            <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
              {diversificationMetrics.categories < 4 && (
                <li>• Consider diversifying into more asset categories</li>
              )}
              {diversificationMetrics.largestAllocation > 60 && (
                <li>• Reduce concentration in {allocationData[0]?.category}</li>
              )}
              <li>• Review underperforming categories</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}