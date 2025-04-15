// types/index.ts

// Currency types
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'BTC' | 'ETH' | 'GOLD';

// Asset categories
export type AssetCategory = 
  | 'Crypto' 
  | 'Precious Metals' 
  | 'Stocks & Indexes' 
  | 'REIT' 
  | 'Bonds' 
  | 'Cash' 
  | 'Commodities'
  | 'Real Estate';

// Portfolio types
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
  created_at: string;
  updated_at: string;
}

// Category summary data
export interface CategorySummary {
  total_value: number;
  total_cost: number;
  profit_loss: number;
  profit_loss_percentage: number;
  asset_count: number;
}

// Portfolio summary data
export interface PortfolioSummary {
  total_value: number;
  total_cost: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
  asset_count: number;
  categories: Record<AssetCategory, CategorySummary>;
}

// Portfolio asset data
export interface PortfolioAsset {
  category: AssetCategory;
  asset_type: string;
  quantity: number;
  current_price?: number;
  avg_purchase_price?: number;
  current_value?: number;
  total_cost?: number;
  profit_loss?: number;
  profit_loss_percentage?: number;
}

// Transaction data
export interface Transaction {
  id: string;
  user_id: string;
  portfolio_id: string;
  category: AssetCategory;
  asset_type: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  date: string;
  created_at: string;
  updated_at: string;
  encrypted?: boolean;
}

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

// Real Estate property types
export interface RealEstateProperty {
    id: string; // UUID for the property
    user_id: string; // UUID for the user owning the property
    asset_id: string; // UUID referencing the asset in the transactions table
    property_type: string; // Type of the property (e.g., 'Residential', 'Commercial')
    property_address: string; // The address of the property
    purchase_price: number; // The purchase price of the property
    current_value: number; // The current market value of the property
    purchase_date: string; // The date the property was purchased (ISO format string)
    rental_income: number; // Monthly rental income generated from the property
    mortgage_monthly_payment: number; // Monthly mortgage payment
    mortgage_interest_rate: number; // Interest rate on the mortgage
    property_tax: number; // Monthly property tax
    insurance: number; // Monthly property insurance
    maintenance_costs: number; // Monthly maintenance costs for the property
    utilities: number; // Monthly utilities cost for the property
    monthly_cash_flow: number; // Computed value: rental_income minus the monthly expenses (stored column)
    yearly_cash_flow: number; // Computed value: monthly_cash_flow * 12 (stored column)
    encrypted: boolean; // Boolean indicating if the data is encrypted
    created_at: string; // ISO format string of the record creation date
    updated_at: string; // ISO format string of the last record update date
}
  
// System settings types
export type SystemSetting = {
    id: string;
    key: string;
    trial_enabled: boolean;
    created_at: string;
    updated_at: string;
};
  
export type Notifications = {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
};
  
// this is the type format that the {User} import outputs from @supabase/supabase-js
// leaving it here for future reference (can be deleted later)

export interface SupabaseUser {
    id: string; // UUID of the user
    aud: string; // Audience claim (typically "authenticated")
    role: string; // Role assigned to the user (e.g., "authenticated")
    email: string | null;
    phone: string | null;
    created_at: string; // ISO timestamp
    confirmed_at: string | null;
    last_sign_in_at: string | null;
    app_metadata: Record<string, any>; // Metadata from authentication provider
    user_metadata: Record<string, any>; // Custom user metadata
    identities?: Array<{
      id: string;
      identity_data: Record<string, any>;
      provider: string; // e.g., "google", "github"
      last_sign_in_at: string;
      created_at: string;
      updated_at: string;
    }>;
}

// User profiles types
export type UserSubscription = {
  id: string; // UUID
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string; // Consider using a union type if you have a finite list of statuses
  subscription_start_date: string | null; // ISO string from TIMESTAMPTZ
  subscription_end_date: string | null; // ISO string from TIMESTAMPTZ
  is_trial: boolean;
  trial_ending_notified: boolean;
  trial_until: string | null; // TIMESTAMPTZ
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
};

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
  
export interface Currency {
    id: string;
    symbol: string;
    name: string;
    date: string;
    price: number;
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
  
export interface MarketData {
    metals: Metal[];
    crypto: Crypto[];
    currencies: Currency[];
    stocks: Stock[];
}

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

// Debt types
export type Loan = {
  id: string;
  user_id: string;
  portfolio_id: string;
  name: string;
  lender: string;
  loan_type: string;
  original_amount: number;
  current_balance: number;
  interest_rate: number;
  monthly_payment: number;
  payment_day: number;
  term_months: number;
  start_date: string;
  maturity_date: string;
  months_paid: number;
  months_remaining: number;
  next_payment_date: string;
  auto_pay: boolean;
  extra_payments_total: number;
  encrypted: boolean;
  created_at: string;
  updated_at: string;
};

export type CreditCard = {
  id: string;
  user_id: string;
  portfolio_id: string;
  name: string;
  issuer: string;
  last_four: string;
  balance: number;
  credit_limit: number;
  interest_rate: number;
  min_payment: number;
  due_date: string;
  auto_pay: boolean;
  statement_balance: number;
  annual_fee: number;
  rewards_rate: string | null;
  encrypted: boolean;
  created_at: string;
  updated_at: string;
};

export type DebtData = {
  loans: Loan[];
  creditCards: CreditCard[];
};

// Budget types
export interface BudgetData {
  month: string; // YYYY-MM-DD format
  planned_income: number;
  planned_expenses: number;
  updated_at: string; // ISO timestamp
  budget_income: IncomeSelection[];
  budget_expenses: ExpenseSelection[];
}

export interface IncomeSelection {
  income_options: {
    name: string;
  }[];
  is_selected: boolean;
}

export interface ExpenseSelection {
  expense_options: {
    name: string;
  }[];
  is_selected: boolean;
}
