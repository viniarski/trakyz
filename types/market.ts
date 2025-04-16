// types/market.ts

// Market data types
export interface Metal {
    id: string;
    metal: string;
    date: string;
    price: number;
    created_at: string;
    updated_at: string;
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
    updated_at: string;
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
    updated_at: string;
  }
  
  export interface Currency {
    id: string;
    symbol: string;
    name: string;
    date: string;
    price: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface MarketData {
    metals: Metal[];
    crypto: Crypto[];
    currencies: Currency[];
    stocks: Stock[];
  }