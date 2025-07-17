// components/Analytics/components/AnalyticsPerformance.tsx

'use client'

import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Eye, EyeOff } from 'lucide-react'
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

interface BenchmarkSettings {
  'S&P 500': boolean
  'Bitcoin': boolean
  'Gold': boolean
}

interface ChartDataPoint {
  date: string
  portfolio: number
  'S&P 500': number
  'Bitcoin': number
  'Gold': number
}

type TimePeriod = '1D' | '7D' | '1M' | '3M' | '1Y' | 'ALL'

export function AnalyticsPerformance({
  transactions,
  currentPrices,
  selectedCurrency,
  selectedPeriod,
  historicalData
}: AnalyticsPerformanceProps) {
  const [benchmarkSettings, setBenchmarkSettings] = useState<BenchmarkSettings>({
    'S&P 500': true,
    'Bitcoin': true,
    'Gold': true
  })
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('3M')

  const toggleBenchmark = (benchmark: keyof BenchmarkSettings) => {
    setBenchmarkSettings(prev => ({
      ...prev,
      [benchmark]: !prev[benchmark]
    }))
  }

  // Calculate portfolio performance over time using your working approach
  const portfolioChartData = useMemo(() => {
    if (!historicalData || transactions.length === 0) {
      console.log('No historical data or transactions')
      return []
    }

    console.log('=== PORTFOLIO CALCULATION DEBUG ===')
    console.log('Transactions count:', transactions.length)
    console.log('Sample transaction:', transactions[0])

    // Get date range based on selected period
    const now = new Date()
    let startDate = new Date()
    
    switch(timePeriod) {
      case '1D':
        startDate.setDate(now.getDate() - 1)
        break
      case '7D':
        startDate.setDate(now.getDate() - 7)
        break
      case '1M':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3M':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'ALL':
        // Find earliest transaction date
        const dates = transactions.map(t => new Date(t.date).getTime())
        if (dates.length > 0) {
          startDate = new Date(Math.min(...dates))
        } else {
          startDate.setFullYear(now.getFullYear() - 1)
        }
        break
    }

    console.log('Date range:', startDate.toISOString().slice(0, 10), 'to', now.toISOString().slice(0, 10))

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Generate date range - use fewer points for better performance
    const dateRange: Date[] = []
    const tempDate = new Date(startDate)
    const dateStep = timePeriod === '1D' ? 1 : 
                     timePeriod === '7D' ? 1 : 
                     timePeriod === '1M' ? 2 : 
                     timePeriod === '3M' ? 5 : 
                     timePeriod === '1Y' ? 7 : 10
    
    while (tempDate <= now) {
      dateRange.push(new Date(tempDate))
      tempDate.setDate(tempDate.getDate() + dateStep)
    }

    console.log('Generated', dateRange.length, 'data points')

    // Calculate portfolio value for each date
    const chartData = dateRange.map(date => {
      // Get transactions up to this date
      const relevantTransactions = sortedTransactions.filter(
        t => new Date(t.date) <= date
      )

      // Calculate portfolio holdings for this date
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

      // Calculate value using CURRENT PRICES (simplified approach)
      // This is what your working version likely does
      Object.entries(assetQuantities).forEach(([assetKey, quantity]) => {
        if (quantity <= 0) return
        
        const assetType = assetKey.split('-')[1]
        const price = currentPrices[assetType] || 0
        
        if (price > 0) {
          portfolioValue += quantity * price
        }
      })

      // Debug first data point
      if (date.getTime() === dateRange[0]?.getTime()) {
        console.log('=== FIRST DATA POINT DEBUG ===')
        console.log('Date:', date.toISOString().slice(0, 10))
        console.log('Relevant transactions:', relevantTransactions.length)
        console.log('Asset quantities:', assetQuantities)
        console.log('Current prices:', currentPrices)
        console.log('Portfolio value:', portfolioValue)
      }

      return {
        date: date.toISOString().slice(0, 10),
        portfolio: portfolioValue
      }
    })

    console.log('Chart data sample:', chartData.slice(0, 3))
    return chartData
  }, [transactions, timePeriod, currentPrices])

  // Generate benchmark data using actual historical data with performance over time
  const benchmarkData = useMemo((): ChartDataPoint[] => {
    if (!historicalData || portfolioChartData.length === 0) return []

    console.log('=== BENCHMARK CALCULATION ===')

    return portfolioChartData.map(point => {
      const targetDate = new Date(point.date)
      const dateStr = targetDate.toISOString().slice(0, 10)
      
      // Find closest available historical prices for each benchmark on this date
      const findClosestPrice = (data: any[], symbol: string, symbolField: string = 'symbol') => {
        // First try exact date match
        let exactMatch = data.find(item => 
          item[symbolField] === symbol && item.date.startsWith(dateStr)
        )
        if (exactMatch) return exactMatch.price

        // If no exact match, find closest date before target date
        const beforeTarget = data
          .filter(item => item[symbolField] === symbol && new Date(item.date) <= targetDate)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        if (beforeTarget.length > 0) return beforeTarget[0].price

        // Fallback to latest available
        const latest = data
          .filter(item => item[symbolField] === symbol)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        return latest.length > 0 ? latest[0].price : 0
      }

      const spyPrice = findClosestPrice(historicalData.stocks, 'SPY')
      const btcPrice = findClosestPrice(historicalData.crypto, 'Bitcoin') || 
                      findClosestPrice(historicalData.crypto, 'BTC') ||
                      findClosestPrice(historicalData.crypto, 'bitcoin')
      const goldPrice = findClosestPrice(historicalData.metals, 'gold', 'metal')

      // Debug first point
      if (point.date === portfolioChartData[0]?.date) {
        console.log('Benchmark prices for', dateStr, ':', {
          spy: spyPrice,
          bitcoin: btcPrice,
          gold: goldPrice
        })
        
        // Debug Bitcoin specifically
        const bitcoinData = historicalData.crypto.filter(c => 
          c.symbol === 'Bitcoin' || c.symbol === 'BTC' || c.symbol === 'bitcoin'
        )
        console.log('Available Bitcoin data:', bitcoinData.length, 'records')
        if (bitcoinData.length > 0) {
          console.log('Sample Bitcoin data:', bitcoinData.slice(0, 3))
        }
      }

      return {
        ...point,
        'S&P 500': spyPrice,
        'Bitcoin': btcPrice,
        'Gold': goldPrice,
      }
    })
  }, [portfolioChartData, historicalData])

  // Normalize all data to start from 100% for fair comparison
  const normalizedData = useMemo((): ChartDataPoint[] => {
    if (benchmarkData.length === 0) return []

    const firstPoint = benchmarkData[0]
    if (!firstPoint) return []

    console.log('=== NORMALIZATION ===')
    console.log('First point values:', {
      portfolio: firstPoint.portfolio,
      spy: firstPoint['S&P 500'],
      bitcoin: firstPoint['Bitcoin'],
      gold: firstPoint['Gold']
    })

    return benchmarkData.map(point => ({
      date: point.date,
      portfolio: firstPoint.portfolio > 0 ? (point.portfolio / firstPoint.portfolio) * 100 : 100,
      'S&P 500': firstPoint['S&P 500'] > 0 ? (point['S&P 500'] / firstPoint['S&P 500']) * 100 : 100,
      'Bitcoin': firstPoint['Bitcoin'] > 0 ? (point['Bitcoin'] / firstPoint['Bitcoin']) * 100 : 100,
      'Gold': firstPoint['Gold'] > 0 ? (point['Gold'] / firstPoint['Gold']) * 100 : 100,
    }))
  }, [benchmarkData])

  const formatPercentage = (value: number) => `${(value - 100).toFixed(1)}%`

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
              {entry.name}: {formatPercentage(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const timePeriods: TimePeriod[] = ['1D', '7D', '1M', '3M', '1Y', 'ALL']

  return (
    <div className="space-y-6">
      {/* Performance Chart */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Portfolio Performance</h3>
          
          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Time Period Selector */}
            <div className="flex gap-1">
              {timePeriods.map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    timePeriod === period
                      ? 'bg-[var(--accent-primary)] text-white' 
                      : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            
            {/* Benchmark Toggles */}
            <div className="flex gap-1">
              {Object.entries(benchmarkSettings).map(([benchmark, enabled]) => (
                <button
                  key={benchmark}
                  onClick={() => toggleBenchmark(benchmark as keyof BenchmarkSettings)}
                  className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                    enabled 
                      ? 'bg-[var(--accent-primary)] text-white' 
                      : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {benchmark}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={normalizedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-secondary)"
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => {
                  const d = new Date(date)
                  return d.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })
                }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="var(--text-secondary)" 
                domain={['dataMin - 5', 'dataMax + 5']}
                tickFormatter={(value) => `${(value - 100).toFixed(0)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Portfolio Line - Always Shown */}
              <Line 
                type="monotone" 
                dataKey="portfolio" 
                stroke="var(--accent-primary)" 
                strokeWidth={3} 
                name="Portfolio" 
                dot={false}
              />
              
              {/* Conditional Benchmark Lines */}
              {benchmarkSettings['S&P 500'] && (
                <Line 
                  type="monotone" 
                  dataKey="S&P 500" 
                  stroke="#10B981" 
                  strokeWidth={2} 
                  name="S&P 500" 
                  dot={false}
                />
              )}
              
              {benchmarkSettings['Bitcoin'] && (
                <Line 
                  type="monotone" 
                  dataKey="Bitcoin" 
                  stroke="#EF4444" 
                  strokeWidth={2} 
                  name="Bitcoin" 
                  dot={false}
                />
              )}
              
              {benchmarkSettings['Gold'] && (
                <Line 
                  type="monotone" 
                  dataKey="Gold" 
                  stroke="#D97706" 
                  strokeWidth={2} 
                  name="Gold" 
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}