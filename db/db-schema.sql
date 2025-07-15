-- Complete Trakyz Database Schema - Updated Version

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

----------------------- USER TABLES ---------------------------------
-- (Note: auth.users is already created by Supabase)

-- User profiles table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT DEFAULT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url TEXT DEFAULT NULL,
    selected_currency TEXT NOT NULL DEFAULT 'USD' CHECK (selected_currency IN ('USD', 'EUR', 'GBP', 'CHF', 'BTC', 'ETH', 'GOLD')),
    selected_period TEXT NOT NULL DEFAULT '24H' CHECK (selected_period IN ('24H', '7D')),
    theme_preference TEXT NOT NULL DEFAULT 'blue' CHECK (theme_preference IN ('blue', 'dark', 'light')),
    last_active_tab TEXT DEFAULT 'portfolio',
    language TEXT DEFAULT 'en',
    market_show_more BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscription table
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    is_trial BOOLEAN DEFAULT false,
    trial_ending_notified BOOLEAN DEFAULT false,
    trial_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System settings table
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    trial_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------- ASSET TABLES ---------------

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
CREATE TABLE public.real_estate (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
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

-------------------- WATCHLIST TABLES --------------------

-- Create watchlist table
CREATE TABLE public.watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    symbol TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category, symbol)
);

-------------------- BUDGET TABLES --------------------

-- Table storing predefined income options
CREATE TABLE public.income_options (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Table storing predefined expense options
CREATE TABLE public.expense_options (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- budgets table 
CREATE TABLE public.budgets (
    month DATE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    planned_income NUMERIC NOT NULL DEFAULT 0,
    planned_expenses NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (month, user_id)
);

-- User-selected incomes in budgets
CREATE TABLE public.budget_income (
    budget_month DATE NOT NULL,
    user_id UUID NOT NULL,
    income_option_id INT NOT NULL,
    is_selected BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (budget_month, user_id, income_option_id),
    FOREIGN KEY (budget_month, user_id) REFERENCES public.budgets (month, user_id) ON DELETE CASCADE,
    FOREIGN KEY (income_option_id) REFERENCES public.income_options (id) ON DELETE CASCADE
);

-- User-selected expenses in budgets
CREATE TABLE public.budget_expenses (
    budget_month DATE NOT NULL,
    user_id UUID NOT NULL,
    expense_option_id INT NOT NULL,
    is_selected BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (budget_month, user_id, expense_option_id),
    FOREIGN KEY (budget_month, user_id) REFERENCES public.budgets (month, user_id) ON DELETE CASCADE,
    FOREIGN KEY (expense_option_id) REFERENCES public.expense_options (id) ON DELETE CASCADE
);

------------------ MARKET DATA TABLES ------------------

-- Crypto table
CREATE TABLE public.crypto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    symbol VARCHAR NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    price NUMERIC NOT NULL,
    market_cap NUMERIC,
    volume_24h NUMERIC,
    date_day TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_crypto_symbol_date UNIQUE (symbol, date)
);

-- Currencies table
CREATE TABLE public.currencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    price NUMERIC NOT NULL,
    date_day TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metals table
CREATE TABLE public.metals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TIMESTAMPTZ NOT NULL,
    metal VARCHAR NOT NULL,
    price NUMERIC NOT NULL,
    date_day TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stocks table
CREATE TABLE public.stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    symbol VARCHAR NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    price NUMERIC NOT NULL,
    volume NUMERIC,
    date_day TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

---------------------- FUNCTIONS -------------------------

-- Function to create user profile
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    name,
    role,
    avatar_url,
    selected_currency,
    selected_period,
    theme_preference,
    last_active_tab,
    language,
    market_show_more,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'user',
    NEW.raw_user_meta_data->>'avatar_url',
    'USD',
    '24H',
    'blue',
    'portfolio',
    'en',
    false,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create default portfolio for new users
CREATE OR REPLACE FUNCTION create_default_portfolio()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.portfolios (
    user_id, 
    name, 
    is_default, 
    total_value,
    total_cost,
    total_profit_loss,
    total_profit_loss_percentage,
    asset_count,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    'Default Portfolio',
    true,
    0,
    0,
    0,
    0,
    0,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Ensure functions have elevated permission to access RLS tables
-- Revoke default public access
REVOKE ALL ON FUNCTION create_user_profile() FROM public;
REVOKE ALL ON FUNCTION update_updated_at_column() FROM public;
REVOKE ALL ON FUNCTION create_default_portfolio() FROM public;

-- Allow Supabase roles
GRANT EXECUTE ON FUNCTION create_user_profile() TO service_role;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO service_role;
GRANT EXECUTE ON FUNCTION create_default_portfolio() TO service_role;

---------------------- TRIGGERS -------------------------

-- Create user profile when a new user is created
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Create default portfolio when a new user is created
CREATE TRIGGER on_auth_user_created_portfolio
AFTER INSERT ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION create_default_portfolio();

-- Update timestamps automatically
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
BEFORE UPDATE ON public.portfolios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at
BEFORE UPDATE ON public.loans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_cards_updated_at
BEFORE UPDATE ON public.credit_cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_real_estate_updated_at
BEFORE UPDATE ON public.real_estate
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watchlist_updated_at
BEFORE UPDATE ON public.watchlist
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

---------------------- ROW LEVEL SECURITY -------------------------

-- Enable RLS on all user tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_expenses ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- User subscriptions policies
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own subscription"
  ON public.user_subscriptions
  FOR UPDATE
  USING (auth.uid() = id);

-- Portfolios policies
CREATE POLICY "Users can view their own portfolios"
  ON public.portfolios
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolios"
  ON public.portfolios
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
  ON public.portfolios
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
  ON public.portfolios
  FOR DELETE
  USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Loans policies
CREATE POLICY "Users can view their own loans"
  ON public.loans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loans"
  ON public.loans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans"
  ON public.loans
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans"
  ON public.loans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Credit cards policies
CREATE POLICY "Users can view their own credit cards"
  ON public.credit_cards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit cards"
  ON public.credit_cards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit cards"
  ON public.credit_cards
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credit cards"
  ON public.credit_cards
  FOR DELETE
  USING (auth.uid() = user_id);

-- Real estate policies
CREATE POLICY "Users can view their own real estate"
  ON public.real_estate
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own real estate"
  ON public.real_estate
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own real estate"
  ON public.real_estate
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own real estate"
  ON public.real_estate
  FOR DELETE
  USING (auth.uid() = user_id);

-- Watchlist policies
CREATE POLICY "Users can view their own watchlist items"
  ON public.watchlist
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watchlist items"
  ON public.watchlist
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist items"
  ON public.watchlist
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlist items"
  ON public.watchlist
  FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Budget policies
CREATE POLICY "Users can view their own budgets"
  ON public.budgets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets"
  ON public.budgets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
  ON public.budgets
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
  ON public.budgets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Budget income policies
CREATE POLICY "Users can view their own budget income"
  ON public.budget_income
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget income"
  ON public.budget_income
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget income"
  ON public.budget_income
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget income"
  ON public.budget_income
  FOR DELETE
  USING (auth.uid() = user_id);

-- Budget expenses policies
CREATE POLICY "Users can view their own budget expenses"
  ON public.budget_expenses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget expenses"
  ON public.budget_expenses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget expenses"
  ON public.budget_expenses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget expenses"
  ON public.budget_expenses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Market data tables are public read-only
CREATE POLICY "Anyone can view crypto data"
  ON public.crypto
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can view currency data"
  ON public.currencies
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can view metals data"
  ON public.metals
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can view stocks data"
  ON public.stocks
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- System settings - admin only
CREATE POLICY "Only service role can access system settings"
  ON public.system_settings
  FOR ALL
  TO service_role
  USING (true);

---------------------- INDEXES -------------------------

-- Performance indexes
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(id);
CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_portfolio_id ON public.transactions(portfolio_id);
CREATE INDEX idx_loans_user_id ON public.loans(user_id);
CREATE INDEX idx_credit_cards_user_id ON public.credit_cards(user_id);
CREATE INDEX idx_real_estate_user_id ON public.real_estate(user_id);
CREATE INDEX idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);

-- Market data indexes
CREATE INDEX idx_crypto_symbol_date ON public.crypto(symbol, date);
CREATE INDEX idx_currencies_symbol_date ON public.currencies(symbol, date);
CREATE INDEX idx_metals_metal_date ON public.metals(metal, date);
CREATE INDEX idx_stocks_symbol_date ON public.stocks(symbol, date);