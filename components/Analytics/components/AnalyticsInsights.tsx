// components/Analytics/components/AnalyticsInsights.tsx

'use client'

import { useMemo } from 'react'
import { Award, TrendingUp, TrendingDown, AlertTriangle, Target, Lightbulb, DollarSign, PieChart } from 'lucide-react'
import type { Transaction, Portfolio, DebtData } from '@/types'

interface AnalyticsInsightsProps {
  transactions: Transaction[]
  currentPrices: Record<string, number>
  selectedCurrency: string
  portfolios: Portfolio[]
  debtData: DebtData
}

export function AnalyticsInsights({
  transactions,
  currentPrices,
  selectedCurrency,
  portfolios,
  debtData
}: AnalyticsInsightsProps) {
  
  // Calculate comprehensive portfolio insights
  const insights = useMemo(() => {
    // Portfolio metrics
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
    const categories = new Set<string>()
    const assets = new Set<string>()

    assetHoldings.forEach((holding) => {
      if (holding.quantity > 0) {
        const currentPrice = currentPrices[holding.assetType] || 0
        totalValue += holding.quantity * currentPrice
        totalCost += holding.totalCost
        categories.add(holding.category)
        assets.add(holding.assetType)
      }
    })

    const totalProfit = totalValue - totalCost
    const profitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

    // Category allocation
    const categoryAllocations: Record<string, number> = {}
    assetHoldings.forEach((holding) => {
      if (holding.quantity > 0) {
        const currentPrice = currentPrices[holding.assetType] || 0
        const value = holding.quantity * currentPrice
        categoryAllocations[holding.category] = (categoryAllocations[holding.category] || 0) + value
      }
    })

    // Asset performance
    const assetPerformance: any[] = []
    assetHoldings.forEach((holding) => {
      if (holding.quantity > 0) {
        const currentPrice = currentPrices[holding.assetType] || 0
        const currentValue = holding.quantity * currentPrice
        const profitLoss = currentValue - holding.totalCost
        const profitPercent = holding.totalCost > 0 ? (profitLoss / holding.totalCost) * 100 : 0
        
        assetPerformance.push({
          asset: holding.assetType,
          category: holding.category,
          currentValue,
          profitLoss,
          profitPercent
        })
      }
    })

    // Debt analysis
    const totalDebt = debtData.loans.reduce((sum, loan) => sum + loan.current_balance, 0) +
                     debtData.creditCards.reduce((sum, card) => sum + card.balance, 0)
    const debtToAssetRatio = totalValue > 0 ? (totalDebt / totalValue) * 100 : 0

    return {
      totalValue,
      totalCost,
      totalProfit,
      profitPercentage,
      categoryCount: categories.size,
      assetCount: assets.size,
      categoryAllocations,
      assetPerformance,
      totalDebt,
      debtToAssetRatio
    }
  }, [transactions, currentPrices, debtData])

  // Generate insights and recommendations
  const generateInsights = () => {
    const strengths = []
    const warnings = []
    const recommendations = []

    // Performance insights
    if (insights.profitPercentage > 10) {
      strengths.push('Strong portfolio performance with positive returns')
    } else if (insights.profitPercentage < -10) {
      warnings.push('Portfolio is underperforming with significant losses')
    }

    // Diversification insights
    if (insights.categoryCount >= 5) {
      strengths.push('Well-diversified across multiple asset categories')
    } else if (insights.categoryCount < 3) {
      warnings.push('Low diversification - concentrated in few categories')
      recommendations.push('Consider adding assets from different categories')
    }

    // Asset allocation insights
    const sortedAllocations = Object.entries(insights.categoryAllocations)
      .sort(([, a], [, b]) => b - a)
    
    const largestAllocation = sortedAllocations[0]
    const largestPercentage = (largestAllocation[1] / insights.totalValue) * 100
    
    if (largestPercentage > 50) {
      warnings.push(`Over-concentrated in ${largestAllocation[0]} (${largestPercentage.toFixed(1)}%)`)
      recommendations.push('Consider rebalancing to reduce concentration risk')
    }

    // Debt insights
    if (insights.debtToAssetRatio > 50) {
      warnings.push('High debt-to-asset ratio - focus on debt reduction')
      recommendations.push('Consider using some gains to pay down high-interest debt')
    } else if (insights.debtToAssetRatio < 20) {
      strengths.push('Low debt levels relative to asset value')
    }

    // Asset performance insights
    const profitableAssets = insights.assetPerformance.filter(a => a.profitPercent > 0)
    const losingAssets = insights.assetPerformance.filter(a => a.profitPercent < 0)
    
    if (profitableAssets.length > losingAssets.length) {
      strengths.push('Majority of assets are profitable')
    } else if (losingAssets.length > profitableAssets.length) {
      warnings.push('More assets are losing money than gaining')
    }

    // Best and worst performers
    const bestPerformer = insights.assetPerformance.reduce((best, current) => 
      current.profitPercent > best.profitPercent ? current : best
    )
    const worstPerformer = insights.assetPerformance.reduce((worst, current) => 
      current.profitPercent < worst.profitPercent ? current : worst
    )

    if (bestPerformer.profitPercent > 50) {
      strengths.push(`${bestPerformer.asset} is a top performer (+${bestPerformer.profitPercent.toFixed(1)}%)`)
    }

    if (worstPerformer.profitPercent < -30) {
      warnings.push(`${worstPerformer.asset} is significantly underperforming (${worstPerformer.profitPercent.toFixed(1)}%)`)
      recommendations.push(`Review ${worstPerformer.asset} position and consider rebalancing`)
    }

    // General recommendations
    if (insights.assetCount < 10) {
      recommendations.push('Consider adding more individual assets for better diversification')
    }

    if (insights.categoryCount < 6) {
      recommendations.push('Explore adding assets from underrepresented categories')
    }

    return { strengths, warnings, recommendations }
  }

  const { strengths, warnings, recommendations } = generateInsights()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency === 'BTC' ? 'USD' : selectedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`

  const InsightCard = ({ icon: Icon, title, items, color = 'blue' }: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    items: string[]
    color?: string
  }) => (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-primary)]">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          <Icon className={`h-5 w-5 text-${color}-500`} />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item: string, index: number) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-[var(--text-secondary)] mt-0.5">•</span>
            <span className="text-[var(--text-primary)] text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }: {
    title: string
    value: string
    subtitle?: string
    icon: React.ComponentType<{ className?: string }>
    color?: string
  }) => (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-primary)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">{title}</h3>
        <Icon className={`h-5 w-5 text-${color}-500`} />
      </div>
      <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">{value}</div>
      {subtitle && <div className="text-sm text-[var(--text-secondary)]">{subtitle}</div>}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Portfolio Value"
          value={formatCurrency(insights.totalValue)}
          subtitle={`${formatPercentage(insights.profitPercentage)} return`}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          title="Total Profit/Loss"
          value={formatCurrency(insights.totalProfit)}
          subtitle={`${formatPercentage(insights.profitPercentage)} of cost`}
          icon={insights.totalProfit >= 0 ? TrendingUp : TrendingDown}
          color={insights.totalProfit >= 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="Diversification"
          value={`${insights.categoryCount}/8`}
          subtitle={`${insights.assetCount} total assets`}
          icon={PieChart}
          color="purple"
        />
        <MetricCard
          title="Debt Ratio"
          value={`${insights.debtToAssetRatio.toFixed(1)}%`}
          subtitle={`${formatCurrency(insights.totalDebt)} total debt`}
          icon={AlertTriangle}
          color={insights.debtToAssetRatio > 30 ? 'red' : 'green'}
        />
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strengths */}
        <InsightCard
          icon={Award}
          title="Portfolio Strengths"
          items={strengths.length > 0 ? strengths : ['Review your portfolio to identify strengths']}
          color="green"
        />

        {/* Warnings */}
        <InsightCard
          icon={AlertTriangle}
          title="Risk Factors"
          items={warnings.length > 0 ? warnings : ['No major risk factors identified']}
          color="yellow"
        />

        {/* Recommendations */}
        <InsightCard
          icon={Lightbulb}
          title="Recommendations"
          items={recommendations.length > 0 ? recommendations : ['Portfolio appears well-balanced']}
          color="blue"
        />
      </div>

      {/* Category Allocation Analysis */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-primary)]">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Asset Allocation Analysis</h3>
        <div className="space-y-3">
          {Object.entries(insights.categoryAllocations)
            .sort(([, a], [, b]) => b - a)
            .map(([category, value]) => {
              const percentage = (value / insights.totalValue) * 100
              return (
                <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-hover)]/50">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-[var(--accent-primary)] rounded-full" />
                    <span className="font-medium text-[var(--text-primary)]">{category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-[var(--bg-hover)] rounded-full h-2">
                      <div 
                        className="bg-[var(--accent-primary)] h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-right min-w-20">
                      <div className="text-sm font-medium text-[var(--text-primary)]">
                        {percentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {formatCurrency(value)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Performance Leaders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-primary)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Top Performers</h3>
          <div className="space-y-3">
            {insights.assetPerformance
              .filter(asset => asset.profitPercent > 0)
              .sort((a, b) => b.profitPercent - a.profitPercent)
              .slice(0, 5)
              .map((asset, index) => (
                <div key={asset.asset} className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-green-500">#{index + 1}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[var(--text-primary)]">{asset.asset}</span>
                      <div className="text-sm text-[var(--text-secondary)]">{asset.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-500 font-medium">
                      +{asset.profitPercent.toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-600">
                      {formatCurrency(asset.profitLoss)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-primary)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Underperformers</h3>
          <div className="space-y-3">
            {insights.assetPerformance
              .filter(asset => asset.profitPercent < 0)
              .sort((a, b) => a.profitPercent - b.profitPercent)
              .slice(0, 5)
              .map((asset, index) => (
                <div key={asset.asset} className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-red-500">#{index + 1}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[var(--text-primary)]">{asset.asset}</span>
                      <div className="text-sm text-[var(--text-secondary)]">{asset.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-500 font-medium">
                      {asset.profitPercent.toFixed(1)}%
                    </div>
                    <div className="text-sm text-red-600">
                      {formatCurrency(asset.profitLoss)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-[var(--border-primary)]">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-[var(--text-primary)]">
          <Target className="h-5 w-5 mr-2 text-[var(--accent-primary)]" />
          Suggested Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-[var(--text-primary)]">Short-term (1-3 months)</h4>
            <ul className="space-y-2 text-sm">
              {insights.debtToAssetRatio > 40 && (
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent-primary)] mt-0.5">•</span>
                  <span className="text-[var(--text-primary)]">Focus on debt reduction before new investments</span>
                </li>
              )}
              {Object.entries(insights.categoryAllocations).some(([, value]) => (value / insights.totalValue) > 0.5) && (
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent-primary)] mt-0.5">•</span>
                  <span className="text-[var(--text-primary)]">Rebalance overconcentrated positions</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-primary)] mt-0.5">•</span>
                <span className="text-[var(--text-primary)]">Review and optimize underperforming assets</span>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-[var(--text-primary)]">Long-term (3-12 months)</h4>
            <ul className="space-y-2 text-sm">
              {insights.categoryCount < 5 && (
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent-primary)] mt-0.5">•</span>
                  <span className="text-[var(--text-primary)]">Diversify into new asset categories</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-primary)] mt-0.5">•</span>
                <span className="text-[var(--text-primary)]">Consider tax-loss harvesting opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-primary)] mt-0.5">•</span>
                <span className="text-[var(--text-primary)]">Set up automatic rebalancing schedule</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}