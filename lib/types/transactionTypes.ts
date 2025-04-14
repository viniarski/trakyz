// lib/types/transactionTypes.ts

export interface Transaction {
  id: string;
  user_id: string;
  portfolio_id: string;
  category: string;
  asset_type: string;
  transaction_type: "BUY" | "SELL";
  quantity: number;
  price: number;
  date: string; // ISO date string
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  encrypted: boolean;
}
