// types/components.ts

import { CurrencyCode } from './index';

// Header and menu types
export interface HeaderProps {
  userEmail?: string | null;
  userRole?: string | null;
  isSubscribed?: boolean;
}

export interface CurrencyMetadata {
  code: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface UserMenuProps {
  userEmail?: string | null;
  userRole?: string | null;
}

export interface MobileMenuProps {
  userEmail?: string | null;
  userRole?: string | null;
  onClose: () => void;
  isMobile?: boolean;
  onSelectCallback?: () => void;
}

export interface CurrencySwitcherProps {
  isMobile?: boolean;
  onSelectCallback?: () => void;
}

export interface BalanceToggleProps {
  hideBalances: boolean;
  toggleBalances: () => void;
}

export interface NotificationsButtonProps {
  // Add any props needed for notifications
}

// Real Estate property types
export interface RealEstateProperty {
  id: string; 
  user_id: string; 
  asset_id: string; 
  property_type: string; 
  property_address: string; 
  purchase_price: number; 
  current_value: number; 
  purchase_date: string; 
  rental_income: number; 
  mortgage_monthly_payment: number; 
  mortgage_interest_rate: number; 
  property_tax: number; 
  insurance: number; 
  maintenance_costs: number; 
  utilities: number; 
  monthly_cash_flow: number; 
  yearly_cash_flow: number; 
  encrypted: boolean; 
  created_at: string; 
  updated_at: string; 
}