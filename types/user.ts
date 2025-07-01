// types/user.ts

import { CurrencyCode, AssetCategory } from './index';

// User Profile interface matching the database schema
export interface UserProfile {
  id: string;
  name?: string | null;
  role: string;
  avatar_url?: string | null;
  selected_currency: CurrencyCode;
  selected_period: SelectedPeriod;
  theme_preference: ThemePreference;
  last_active_tab?: string | null;
  language?: string | null;
  market_show_more: boolean;
  created_at: string;
  updated_at: string;
}

// Standard WatchlistItem interface that matches the database
export interface WatchlistItem {
  id: string;
  user_id: string;
  category: AssetCategory;
  symbol: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Legacy watchlist format (for backward compatibility with components that expect simpler format)
export type LegacyWatchlistItem = {
  id: string;
  category: AssetCategory;
  symbol: string;
  order: number;
};

// Theme and UI preferences
export type ThemePreference = 'blue' | 'dark' | 'light';
export type SelectedPeriod = '24H' | '7D';
export type LayoutType = 'cards' | 'list' | 'detailed';
export type ActiveTabType = 'portfolio' | 'markets' | 'transactions' | 'debt' | 'budget' | 'analytics' | 'real-estate';

// User settings aggregated from various sources (uses legacy format for UI simplicity)
export interface UserSettings {
  marketRatesShowMore: boolean;
  selectedPeriod: SelectedPeriod;
  selectedCurrency: CurrencyCode;
  watchlist: LegacyWatchlistItem[]; // Use legacy format for UI components
  theme_preference: ThemePreference;
  layout: LayoutType;
  lastActiveTab: ActiveTabType;
  expandedPortfolioCategories?: AssetCategory[];
  language?: string;
  notifications?: string[];
}

// User subscription information
export interface UserSubscription {
  id: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status: 'active' | 'inactive' | 'trialing' | 'canceled' | 'past_due';
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  is_trial: boolean;
  trial_ending_notified: boolean;
  trial_until?: string | null;
  created_at: string;
  updated_at: string;
}

// User notification
export interface UserNotification {
  id: string;
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// User preferences for different components
export interface UserPreferences {
  dashboard: {
    defaultTab: ActiveTabType;
    hiddenSections?: string[];
  };
  portfolio: {
    defaultView: LayoutType;
    expandedCategories: AssetCategory[];
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  market: {
    showMore: boolean;
    defaultPeriod: SelectedPeriod;
    defaultCategory: string;
  };
  transactions: {
    defaultFilters: Record<string, any>;
    itemsPerPage: number;
  };
}

// User activity tracking
export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// User session information
export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
  last_active: string;
  device_info?: {
    browser: string;
    os: string;
    device: string;
  };
}