// components/Analytics/components/AnalyticsPerformance.tsx

'use client'

import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import type { Transaction, Crypto, Stock, Metal, Currency } from '@/types'

interface AnalyticsPerformanceProps {
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

export function AnalyticsPerformance({
  transactions,
  currentPrices,
  selectedCurrency,
  selectedPeriod,
  historicalData
}: AnalyticsPerformanceProps) {
  const [showBenchmarks, setShowBenchmarks] = useState(true)
  const [normalizeData, setNormalizeData] = useState(false)

  // Calculate portfolio performance over time
  const portfolioChartData = useMemo(() => {
    const now = new Date()
    let startDate = new Date()
    
    switch(selectedPeriod) {
      case '1W':
        startDate.setDate(now.getDate() - 7)
        break
      case '1M':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3M':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6M':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'ALL':
        const dates = transactions.map(t => new Date(t.date).getTime())
        if (dates.length > 0) {
          startDate = new Date(Math.min(...dates))
        } else {
          startDate.setFullYear(now.getFullYear() - 1)
        }
        break
    }

    // Generate date range
    const dateRange: Date[] = []
    const tempDate = new Date(startDate)
    const dateStep = selectedPeriod === '1W' ? 1 : 
                     selectedPeriod === '1M' ? 1 : 
                     selectedPeriod === '3M' ? 3 : 
                     selectedPeriod === '6M' ? 7 : 14
    
    while (tempDate <= now) {
      dateRange.push(new Date(tempDate))
      tempDate.setDate(tempDate.getDate() + dateStep)
    }

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Calculate portfolio value for each date
    const chartData = dateRange.map(date => {
      const relevantTransactions = sortedTransactions.filter(
        t => new Date(t.date) <= date
      )

      let portfolioValue = 0
      const assetQuantities: Record<string, number> = {}

      relevantTransactions.forEach(transaction => {
        const assetKey = `${transaction.category}-${transaction.asset_type}`
        
        if (!assetQuantities[assetKey]) {
          assetQuantities[assetKey] = 0
        }
        
        if (transaction.transaction_type === 'BUY') {
          assetQuantities[assetKey] += transaction.quantity
        } else if (transaction.transaction_type === 'SELL') {
          assetQuantities[assetKey] -= transaction.quantity
        }
      })

      // Calculate value using current prices (ideally would use historical prices for the specific date)
      Object.entries(assetQuantities).forEach(([assetKey, quantity]) => {
        if (quantity <= 0) return
        
        const assetType = assetKey.split('-')[1]
        const price = currentPrices[assetType] || 0
        
        if (price > 0) {
          portfolioValue += quantity * price
        }
      })

      return {
        date: date.toISOString().slice(0, 10),
        portfolio: portfolioValue
      }
    })

    return chartData
  }, [transactions, selectedPeriod, currentPrices])

  // Generate benchmark data (sample data - you could replace with real benchmark APIs)
  const benchmarkData = useMemo(() => {
    return portfolioChartData.map((point, index) => ({
      ...point,
      'S&P 500': 100 * (1 + (index * 0.005) + (Math.random() * 0.02 - 0.01)), // Sample S&P 500
      'NASDAQ': 100 * (1 + (index * 0.007) + (Math.random() * 0.03 - 0.015)), // Sample NASDAQ
      'Bitcoin': 100 * (1 + (index * 0.01) + (Math.random() * 0.05 - 0.025)), // Sample Bitcoin
    }))
  }, [portfolioChartData])

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (portfolioChartData.length < 2) return null

    const firstValue = portfolioChartData[0].portfolio
    const lastValue = portfolioChartData[portfolioChartData.length - 1].portfolio
    
    if (firstValue <= 0) return null

    const totalReturn = lastValue - firstValue
    const totalReturnPercent = (totalReturn / firstValue) * 100
    
    // Calculate volatility (standard deviation of daily returns)
    const returns = []
    for (let i = 1; i < portfolioChartData.length; i++) {
      const prevValue = portfolioChartData[i - 1].portfolio
      const currentValue = portfolioChartData[i].portfolio
      if (prevValue > 0) {
        returns.push((currentValue - prevValue) / prevValue)
      }
    }
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    const volatility = Math.sqrt(variance) * 100

    // Calculate max drawdown
    let maxDrawdown = 0
    let peak = firstValue
    
    portfolioChartData.forEach(point => {
      if (point.portfolio > peak) {
        peak = point.portfolio
      }
      const drawdown = ((peak - point.portfolio) / peak) * 100
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    })

    return {
      totalReturn,
      totalReturnPercent,
      volatility,
      maxDrawdown,
      sharpeRatio: volatility > 0 ? (totalReturnPercent / volatility) : 0
    }
  }, [portfolioChartData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency === 'BTC' ? 'USD' : selectedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

  const CustomTooltip = ({ active, payload }: {
    active?: boolean
    payload?: any[]
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-primary)] shadow-lg">
          <p className="text-[var(--text-secondary)] text-sm">{payload[0]?.payload?.date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-[var(--text-primary)]" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Performance Chart */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-primary)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Portfolio Performance</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBenchmarks(!showBenchmarks)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                showBenchmarks 
                  ? 'bg-[var(--accent-primary)] text-white' 
                  : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              Benchmarks
            </button>
            <button
              onClick={() => setNormalizeData(!normalizeData)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                normalizeData 
                  ? 'bg-[var(--accent-primary)] text-white' 
                  : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              Normalize
            </button>
          </div>
        </div>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={showBenchmarks ? benchmarkData : portfolioChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="portfolio" 
                stroke="var(--accent-primary)" 
                strokeWidth={3} 
                name="Portfolio" 
                dot={false}
              />
              {showBenchmarks && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="S&P 500" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    name="S&P 500" 
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="NASDAQ" 
                    stroke="#F59E0B" 
                    strokeWidth={2} 
                    name="NASDAQ" 
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Bitcoin" 
                    stroke="#EF4444" 
                    strokeWidth={2} 
                    name="Bitcoin" 
                    dot={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-primary)]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-[var(--accent-primary)]" />
              <h4 className="text-sm font-medium text-[var(--text-secondary)]">Total Return</h4>
            </div>
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {formatCurrency(performanceMetrics.totalReturn)}
            </div>
            <div className={`text-sm ${performanceMetrics.totalReturnPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(performanceMetrics.totalReturnPercent)}
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-primary)]">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              <h4 className="text-sm font-medium text-[var(--text-secondary)]">Volatility</h4>
            </div>
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {performanceMetrics.volatility.toFixed(2)}%
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Annualized</div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-primary)]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <h4 className="text-sm font-medium text-[var(--text-secondary)]">Max Drawdown</h4>
            </div>
            <div className="text-xl font-bold text-red-500">
              -{performanceMetrics.maxDrawdown.toFixed(2)}%
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Peak to trough</div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-primary)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-4 bg-blue-500 rounded-full" />
              <h4 className="text-sm font-medium text-[var(--text-secondary)]">Sharpe Ratio</h4>
            </div>
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {performanceMetrics.sharpeRatio.toFixed(2)}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Risk-adjusted</div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-primary)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-4 bg-purple-500 rounded-full" />
              <h4 className="text-sm font-medium text-[var(--text-secondary)]">Period</h4>
            </div>
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {selectedPeriod}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Time frame</div>
          </div>
        </div>
      )}
    </div>
  )
}