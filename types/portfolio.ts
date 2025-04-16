// types/portfolio.ts

import { CurrencyCode } from './index';

// Asset categories
export type AssetCategory = 
  | 'Crypto' 
  | 'Precious Metals' 
  | 'Stocks & Indexes' 
  | 'REIT' 
  | 'Bonds' 
  | 'Cash' 
  | 'Commodities'
  | 'Real Estate';

// Portfolio types
export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  total_value: number;
  total_cost: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
  asset_count: number;
  created_at: string;
  updated_at: string;
}

// Category summary data
export interface CategorySummary {
  total_value: number;
  total_cost: number;
  profit_loss: number;
  profit_loss_percentage: number;
  asset_count: number;
}

// Portfolio summary data
export interface PortfolioSummary {
  total_value: number;
  total_cost: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
  asset_count: number;
  categories: Record<AssetCategory, CategorySummary>;
}

// Portfolio asset data
export interface PortfolioAsset {
  category: AssetCategory;
  asset_type: string;
  quantity: number;
  current_price?: number;
  avg_purchase_price?: number;
  current_value?: number;
  total_cost?: number;
  profit_loss?: number;
  profit_loss_percentage?: number;
}

// Transaction data
export interface Transaction {
  id: string;
  user_id: string;
  portfolio_id: string;
  category: AssetCategory;
  asset_type: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  date: string;
  created_at: string;
  updated_at: string;
  encrypted?: boolean;
}