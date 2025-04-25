// types/index.ts

// Re-export all types from other files
export * from './auth';
export * from './portfolio';
export * from './market';
export * from './debt';
export * from './components';
export * from './budget';
export * from './user';

// Common types used across multiple modules
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'BTC' | 'ETH' | 'GOLD';

export type AssetCategory = 'Crypto' | 'Stocks & Indexes' | 'Precious Metals' | 'Cash' | 'Real Estate' | 'Bonds' | 'Commodities' | 'REIT';

export type MarketCategory = "all" | "crypto" | "stocks" | "metals" | "currencies";