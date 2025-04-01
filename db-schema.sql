-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USER TABLES
-- (Note: auth.users is already created by Supabase)

-- User profiles table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    username TEXT, 
    name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url TEXT,
    selected_currency TEXT NOT NULL DEFAULT 'USD' CHECK (selected_currency IN ('USD', 'EUR', 'GBP', 'CHF', 'BTC', 'ETH', 'GOLD')),
    selected_period TEXT NOT NULL DEFAULT '24H' CHECK (selected_period IN ('24H', '7D')),
    theme_preference TEXT NOT NULL DEFAULT 'blue' CHECK (theme_preference IN ('blue', 'dark', 'light')),
    watchlist JSONB DEFAULT '[]'::jsonb,
    last_active_tab TEXT DEFAULT 'portfolio',
    language TEXT DEFAULT 'en',
    expanded_portfolio_categories JSONB DEFAULT '[]'::jsonb,
    market_show_more BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User plan table
CREATE TABLE public.user_plans (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
    plan_start_date TIMESTAMPTZ,
    plan_end_date TIMESTAMPTZ,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT,
    is_early_adopter BOOLEAN DEFAULT false,
    early_adopter_ending_notified BOOLEAN DEFAULT false,
    early_adopter_until TIMESTAMPTZ,
    is_free_trial BOOLEAN DEFAULT false,
    free_trial_ending_notified BOOLEAN DEFAULT false,
    free_trial_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET TABLES

-- Portfolios table
CREATE TABLE public.portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    total_value NUMERIC DEFAULT 0,
    total_cost NUMERIC DEFAULT 0,
    total_profit_loss NUMERIC DEFAULT 0,
    total_profit_loss_percentage NUMERIC DEFAULT 0,
    asset_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    price NUMERIC NOT NULL CHECK (price >= 0),
    date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    encrypted BOOLEAN DEFAULT false
);

-- Loans table
CREATE TABLE public.loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    lender TEXT NOT NULL,
    loan_type TEXT NOT NULL,
    original_amount NUMERIC NOT NULL DEFAULT 0,
    current_balance NUMERIC NOT NULL DEFAULT 0,
    interest_rate NUMERIC NOT NULL DEFAULT 0,
    monthly_payment NUMERIC NOT NULL DEFAULT 0,
    payment_day INTEGER NOT NULL DEFAULT 1,
    term_months INTEGER NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    months_paid INTEGER NOT NULL DEFAULT 0,
    months_remaining INTEGER NOT NULL DEFAULT 0,
    next_payment_date DATE NOT NULL,
    auto_pay BOOLEAN NOT NULL DEFAULT false,
    extra_payments_total NUMERIC NOT NULL DEFAULT 0,
    encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit cards table
CREATE TABLE public.credit_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    last_four TEXT NOT NULL,
    balance NUMERIC NOT NULL DEFAULT 0,
    credit_limit NUMERIC NOT NULL DEFAULT 0,
    interest_rate NUMERIC NOT NULL DEFAULT 0,
    min_payment NUMERIC NOT NULL DEFAULT 0,
    due_date DATE NOT NULL,
    auto_pay BOOLEAN NOT NULL DEFAULT false,
    statement_balance NUMERIC NOT NULL DEFAULT 0,
    annual_fee NUMERIC NOT NULL DEFAULT 0,
    rewards_rate TEXT,
    encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real estate table
CREATE TABLE public.real_estate_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    property_type TEXT NOT NULL,
    property_address TEXT NOT NULL,
    purchase_price NUMERIC NOT NULL,
    current_value NUMERIC NOT NULL,
    purchase_date DATE NOT NULL,
    rental_income NUMERIC NOT NULL DEFAULT 0,
    mortgage_monthly_payment NUMERIC NOT NULL DEFAULT 0,
    mortgage_interest_rate NUMERIC NOT NULL DEFAULT 0,
    property_tax NUMERIC NOT NULL DEFAULT 0,
    insurance NUMERIC NOT NULL DEFAULT 0,
    maintenance_costs NUMERIC NOT NULL DEFAULT 0,
    utilities NUMERIC NOT NULL DEFAULT 0,
    monthly_cash_flow NUMERIC GENERATED ALWAYS AS (
        rental_income - (mortgage_monthly_payment + property_tax + insurance + maintenance_costs + utilities)
    ) STORED,
    yearly_cash_flow NUMERIC GENERATED ALWAYS AS (
        (rental_income - (mortgage_monthly_payment + property_tax + insurance + maintenance_costs + utilities)) * 12
    ) STORED,
    encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget table
CREATE TABLE public.budgets (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    income JSONB NOT NULL DEFAULT '[]'::jsonb,
    expenses JSONB NOT NULL DEFAULT '[]'::jsonb,
    planned_income NUMERIC NOT NULL DEFAULT 0,
    planned_expenses NUMERIC NOT NULL DEFAULT 0,
    encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, month)
);

-- MARKET DATA TABLES

-- Metals table
CREATE TABLE public.metals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metal TEXT NOT NULL,
    date DATE NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(metal, date)
);

-- Crypto table
CREATE TABLE public.crypto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    price NUMERIC NOT NULL,
    market_cap NUMERIC,
    volume_24h NUMERIC,
    date_day TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol, date)
);

-- Currencies table
CREATE TABLE public.currencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol, date)
);

-- Stocks table
CREATE TABLE public.stocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    price NUMERIC NOT NULL,
    volume NUMERIC,
    date_day TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol, date)
);

-- SYSTEM TABLES

-- System settings table
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table (new addition)
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO public.system_settings (key, value) VALUES 
('free_trial_enabled', '{"enabled":true}'::jsonb),
('early_adopter_enabled', '{"enabled":true}'::jsonb);

-- Create RLS policies
-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Example for user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Similar policies for other tables
-- ...