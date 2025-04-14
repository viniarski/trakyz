// lib/types/portfolioTypes.ts

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
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
