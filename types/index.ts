// types/index.ts

// Re-export all types from other files
export * from './auth';
export * from './portfolio';
export * from './market';
export * from './debt';
export * from './components';
export * from './budget';

// Common types used across multiple modules
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'BTC' | 'ETH' | 'GOLD';