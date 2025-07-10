// types/index.ts

// Re-export all types from other files
export * from './auth';
export * from './portfolio';
export * from './market';
export * from './debt';
export * from './components';
export * from './budget';
export * from './user';
export * from './realestate'

// Common types used across multiple modules
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'BTC' | 'ETH' | 'GOLD';

export type AssetCategory = 'Crypto' | 'Stocks & Indexes' | 'Precious Metals' | 'Cash' | 'Real Estate' | 'Bonds' | 'Commodities' | 'REIT';

export type MarketCategory = "all" | "crypto" | "stocks" | "metals" | "currencies";

export type SelectedPeriod = "24H" | "7D";

// Transaction type (making sure it's available from main types)
export interface Transaction {
  id: string;
  user_id: string;
  portfolio_id: string;
  category: AssetCategory;
  asset_type: string;
  transaction_type: "BUY" | "SELL";
  quantity: number;
  price: number;
  date: string;
  created_at: string;
  updated_at: string;
  encrypted?: boolean;
}

// Re-export specific types that might be needed for convenience
export type { Portfolio, PortfolioAsset, PortfolioSummary } from './portfolio';
export type { Metal, Crypto, Stock, Currency, MarketData } from './market';
export type { UserProfile, UserSettings, UserSubscription, WatchlistItem, LegacyWatchlistItem } from './user';
export type { BudgetData } from './budget';
export type { DebtData } from './debt';