// types/user.ts

import { CurrencyCode, AssetCategory } from './index';

export type WatchlistItem = {
  id: string;
  category: AssetCategory;
  symbol: string;
  order: number;
};

export type ThemePreference = 'blue' | 'dark' | 'light';
export type SelectedPeriod = '24H' | '7D';
export type LayoutType = 'cards' | 'list' | 'detailed';
export type ActiveTabType = 'portfolio' | 'market' | 'debt' | 'budget';

export interface UserSettings {
  marketRatesShowMore: boolean;
  selectedPeriod: SelectedPeriod;
  selectedCurrency: CurrencyCode;
  watchlist: WatchlistItem[];
  theme_preference: ThemePreference;
  layout: LayoutType;
  lastActiveTab: ActiveTabType;
  expandedPortfolioCategories?: AssetCategory[];
  language?: string;
  notifications?: string[];
}