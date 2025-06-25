// types/market.ts

import { CurrencyCode, SelectedPeriod } from './index';

// Market data types
export interface Metal {
  id: string;
  metal: string;
  date: string;
  price: number;
  created_at: string;
}

export interface Crypto {
  id: string;
  symbol: string;
  name: string;
  date: string;
  price: number;
  market_cap?: number;
  volume_24h?: number;
  date_day?: string;
  created_at: string;
  updated_at?: string;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  date: string;
  price: number;
  volume?: number;
  date_day?: string;
  created_at: string;
  updated_at?: string;
}

export interface Currency {
  id: string;
  symbol: string;
  name: string;
  date: string;
  price: number;
  created_at: string;
}

export interface MarketData {
  metals: Metal[];
  crypto: Crypto[];
  currencies: Currency[];
  stocks: Stock[];
  selectedCurrency?: CurrencyCode;
}

export interface MarketRatesProps {
  metals: Metal[] | null;
  crypto: Crypto[] | null;
  stocks: Stock[] | null;
  currencies: Currency[] | null;
  loading: boolean;
  selectedCurrency: CurrencyCode;
  currencyRates: {
    currencies: Currency[] | null;
    crypto: Crypto[] | null;
  };
}

export interface WatchlistProps {
  watchlist: Array<{
    id: string;
    category: string;
    symbol: string;
    order: number;
  }>;
  onToggleWatchlist: (category: string, symbol: string) => void;
  marketData: {
    metals: Metal[] | null;
    crypto: Crypto[] | null;
    stocks: Stock[] | null;
    currencies: Currency[] | null;
  };
  selectedCurrency: CurrencyCode;
  currencyRates: {
    currencies: Currency[] | null;
    crypto: Crypto[] | null;
  };
  selectedPeriod: SelectedPeriod;
  updatedItems?: Record<string, Set<string>>;
}