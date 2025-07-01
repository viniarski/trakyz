// types/portfolio.ts

// Import AssetCategory from the main types file
import type { AssetCategory } from './index'

// Base Portfolio interface
export interface Portfolio {
  id: string
  user_id: string
  name: string
  is_default: boolean
  total_value: number
  total_cost: number
  total_profit_loss: number
  total_profit_loss_percentage: number
  asset_count: number
  created_at: string
  updated_at: string
}

// Individual asset within a portfolio
export interface PortfolioAsset {
  id: string
  portfolio_id: string
  category: AssetCategory
  asset_type: string
  quantity: number
  total_cost: number
  total_value: number
  average_cost: number
  current_price: number
  profit_loss: number
  profit_loss_percentage: number
  last_updated: string
  created_at: string
  updated_at: string
}

// Category summary data
export interface CategorySummary {
  total_value: number;
  total_cost: number;
  profit_loss: number;
  profit_loss_percentage: number;
  asset_count: number;
}

// Portfolio summary with aggregated data and assets
export interface PortfolioSummary {
  id: string
  name: string
  is_default: boolean
  total_value: number
  total_cost: number
  total_profit_loss: number
  total_profit_loss_percentage: number
  asset_count: number
  assets: PortfolioAsset[]
  categories: Record<AssetCategory, CategorySummary>
  created_at: string
  updated_at: string
}

// Simplified portfolio for dropdowns and lists
export interface PortfolioOption {
  id: string
  name: string
  is_default?: boolean
}

// Portfolio creation request
export interface CreatePortfolioRequest {
  name: string
}

// Portfolio update request
export interface UpdatePortfolioRequest {
  name?: string
  is_default?: boolean
}

// Portfolio deletion response
export interface DeletePortfolioResponse {
  success: boolean
  message: string
}

// Portfolio statistics for analytics
export interface PortfolioStats {
  total_portfolios: number
  total_value: number
  total_cost: number
  total_profit_loss: number
  total_profit_loss_percentage: number
  best_performing_asset: {
    asset_type: string
    category: AssetCategory
    profit_loss_percentage: number
  } | null
  worst_performing_asset: {
    asset_type: string
    category: AssetCategory
    profit_loss_percentage: number
  } | null
}

// Portfolio performance over time
export interface PortfolioPerformance {
  date: string
  total_value: number
  total_cost: number
  profit_loss: number
  profit_loss_percentage: number
}

// Asset allocation breakdown
export interface AssetAllocation {
  category: AssetCategory
  total_value: number
  percentage: number
  asset_count: number
  profit_loss: number
  profit_loss_percentage: number
}

// Portfolio comparison data
export interface PortfolioComparison {
  portfolio_id: string
  portfolio_name: string
  total_value: number
  total_cost: number
  profit_loss: number
  profit_loss_percentage: number
  asset_count: number
}

// Portfolio holding for a specific asset
export interface PortfolioHolding {
  portfolio_id: string
  portfolio_name: string
  category: AssetCategory
  asset_type: string
  quantity: number
  average_cost: number
  current_price: number
  total_value: number
  profit_loss: number
  profit_loss_percentage: number
  first_purchase_date: string
  last_transaction_date: string
}

// Portfolio rebalancing suggestion
export interface RebalancingSuggestion {
  asset_type: string
  category: AssetCategory
  current_allocation_percentage: number
  target_allocation_percentage: number
  suggested_action: 'BUY' | 'SELL' | 'HOLD'
  suggested_amount: number
  reason: string
}

// Portfolio diversification metrics
export interface DiversificationMetrics {
  portfolio_id: string
  category_count: number
  asset_count: number
  concentration_risk: number // 0-100, higher means more concentrated
  diversification_score: number // 0-100, higher means more diversified
  largest_holding_percentage: number
  category_allocations: AssetAllocation[]
}

// Portfolio risk metrics
export interface PortfolioRisk {
  portfolio_id: string
  volatility: number
  sharpe_ratio: number
  max_drawdown: number
  var_95: number // Value at Risk (95% confidence)
  beta: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
}

// Export AssetCategory for convenience
export type { AssetCategory }