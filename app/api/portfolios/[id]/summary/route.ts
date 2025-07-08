// app/api/portfolios/[id]/summary/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calculateAssetValue, calculateProfitLoss, calculateAveragePurchasePrice } from '@/lib/portfolio-utils'
import type { AssetCategory, CategorySummary, PortfolioAsset } from '@/types'

// Initialize default empty categories object
const DEFAULT_CATEGORIES: Record<AssetCategory, CategorySummary> = {
  'Crypto': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
  'Precious Metals': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
  'Stocks & Indexes': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
  'REIT': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
  'Bonds': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
  'Cash': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
  'Commodities': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
  'Real Estate': { total_value: 0, total_cost: 0, profit_loss: 0, profit_loss_percentage: 0, asset_count: 0 },
}

async function getCurrentPrice(category: AssetCategory, assetType: string): Promise<number> {
  try {
    const supabase = await createClient()
    
    // Fetch current prices from your market data tables
    switch (category) {
      case 'Crypto':
        const { data: cryptoData } = await supabase
          .from('crypto')
          .select('price')
          .eq('symbol', assetType)
          .order('date', { ascending: false })
          .limit(1)
          .single()
        return cryptoData?.price || 0

      case 'Stocks & Indexes':
        const { data: stockData } = await supabase
          .from('stocks')
          .select('price')
          .eq('symbol', assetType)
          .order('date', { ascending: false })
          .limit(1)
          .single()
        return stockData?.price || 0

      case 'Precious Metals':
        const { data: metalData } = await supabase
          .from('metals')
          .select('price')
          .ilike('metal', assetType)
          .order('date', { ascending: false })
          .limit(1)
          .single()
        return metalData?.price || 0

      case 'Cash':
        const { data: currencyData } = await supabase
          .from('currencies')
          .select('price')
          .eq('symbol', assetType)
          .order('date', { ascending: false })
          .limit(1)
          .single()
        return currencyData?.price || 1

      default:
        return 0
    }
  } catch (error) {
    console.error(`Error fetching price for ${category}:${assetType}`, error)
    return 0
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: portfolioId } = await params

    // Verify portfolio belongs to user
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .eq('user_id', user.id)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Get transactions for this portfolio
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    console.log(`Processing ${transactions?.length || 0} transactions for portfolio ${portfolioId}`)

    // Calculate portfolio holdings from transactions
    const holdings = new Map<string, {
      category: AssetCategory
      asset_type: string
      quantity: number
      total_cost: number
      transactions: any[]
    }>()

    // Deduplicate transactions by ID to prevent processing duplicates
    const uniqueTransactions = transactions ? 
      transactions.filter((transaction, index, self) => 
        index === self.findIndex(t => t.id === transaction.id)
      ) : []

    console.log(`Processing ${uniqueTransactions.length} unique transactions`)

    // Process transactions to calculate holdings
    for (const transaction of uniqueTransactions) {
      const key = `${transaction.category}-${transaction.asset_type}`
      
      if (!holdings.has(key)) {
        holdings.set(key, {
          category: transaction.category,
          asset_type: transaction.asset_type,
          quantity: 0,
          total_cost: 0,
          transactions: []
        })
      }

      const holding = holdings.get(key)!
      holding.transactions.push(transaction)

      if (transaction.transaction_type === 'BUY') {
        holding.quantity += transaction.quantity
        holding.total_cost += (transaction.quantity * transaction.price)
      } else if (transaction.transaction_type === 'SELL') {
        // For sells, we need to reduce quantity and cost basis using FIFO
        const soldQuantity = transaction.quantity
        const sellValue = soldQuantity * transaction.price
        
        if (holding.quantity >= soldQuantity) {
          // Calculate average cost before sale
          const avgCostBeforeSale = holding.total_cost / holding.quantity
          
          // Reduce quantity
          holding.quantity -= soldQuantity
          
          // Reduce cost basis proportionally
          holding.total_cost -= (soldQuantity * avgCostBeforeSale)
          
          // Ensure cost basis doesn't go negative
          if (holding.total_cost < 0) holding.total_cost = 0
        } else {
          // If trying to sell more than owned, set to zero
          console.warn(`Attempting to sell ${soldQuantity} of ${transaction.asset_type} but only ${holding.quantity} available`)
          holding.quantity = 0
          holding.total_cost = 0
        }
      }
    }

    // Remove holdings with zero or negative quantity and clean up small amounts
    const holdingsToDelete: string[] = []
    const holdingsEntries = Array.from(holdings.entries())
    for (const [key, holding] of holdingsEntries) {
      if (holding.quantity <= 0.00000001) { // Remove very small amounts due to floating point precision
        holdingsToDelete.push(key)
      }
    }
    
    holdingsToDelete.forEach(key => holdings.delete(key))

    // Calculate portfolio assets with current prices
    const portfolioAssets: PortfolioAsset[] = []
    const categories = { ...DEFAULT_CATEGORIES }

    const finalHoldingsEntries = Array.from(holdings.entries())
    for (const [key, holding] of finalHoldingsEntries) {
      const currentPrice = await getCurrentPrice(holding.category, holding.asset_type)
      const currentValue = calculateAssetValue(holding.quantity, currentPrice)
      const averageCost = calculateAveragePurchasePrice(holding.total_cost, holding.quantity)
      const { amount: profitLoss, percentage: profitLossPercentage } = calculateProfitLoss(currentValue, holding.total_cost)

      const asset: PortfolioAsset = {
        id: key,
        portfolio_id: portfolioId,
        category: holding.category,
        asset_type: holding.asset_type,
        quantity: holding.quantity,
        total_cost: holding.total_cost,
        total_value: currentValue,
        average_cost: averageCost,
        current_price: currentPrice,
        profit_loss: profitLoss,
        profit_loss_percentage: profitLossPercentage,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      portfolioAssets.push(asset)

      // Update category summary - use type assertion for the key
      const categoryKey = holding.category as keyof typeof categories
      if (categories[categoryKey]) {
        const category = categories[categoryKey]
        category.total_value += currentValue
        category.total_cost += holding.total_cost
        category.profit_loss += profitLoss
        category.asset_count += 1
      }
    }

    // Calculate category profit/loss percentages
    Object.values(categories).forEach(category => {
      if (category.total_cost > 0) {
        category.profit_loss_percentage = (category.profit_loss / category.total_cost) * 100
      }
    })

    // Calculate portfolio totals
    const totalValue = portfolioAssets.reduce((sum, asset) => sum + asset.total_value, 0)
    const totalCost = portfolioAssets.reduce((sum, asset) => sum + asset.total_cost, 0)
    const totalProfitLoss = totalValue - totalCost
    const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

    // Update portfolio record
    await supabase
      .from('portfolios')
      .update({
        total_value: totalValue,
        total_cost: totalCost,
        total_profit_loss: totalProfitLoss,
        total_profit_loss_percentage: totalProfitLossPercentage,
        asset_count: portfolioAssets.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', portfolioId)

    const summary = {
      id: portfolio.id,
      name: portfolio.name,
      is_default: portfolio.is_default,
      total_value: totalValue,
      total_cost: totalCost,
      total_profit_loss: totalProfitLoss,
      total_profit_loss_percentage: totalProfitLossPercentage,
      asset_count: portfolioAssets.length,
      assets: portfolioAssets,
      categories,
      created_at: portfolio.created_at,
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error calculating portfolio summary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}