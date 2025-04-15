// app/dashboard/components/portfolio/Portfolio.tsx
// This is a server component that fetches data and passes to client components

import { createClient } from "@/lib/utils/supabase/server";
import { PortfolioClient } from "./PortfolioClient";
import { getDefaultPortfolio } from "@/lib/portfolio-utils";

import type {
  AssetCategory,
  CurrencyCode,
  Metal,
  Crypto,
  Stock,
  Currency,
} from '@/types';

interface PortfolioProps {
  selectedCurrency: CurrencyCode;
  hideBalances: boolean;
  marketData: {
    metals: Metal[] | null;
    crypto: Crypto[] | null;
    stocks: Stock[] | null;
    currencies: Currency[] | null;
  };
}

export async function Portfolio({
  selectedCurrency,
  hideBalances,
  marketData,
}: PortfolioProps) {
  const supabase = await createClient();
  
  // Fetch portfolios from database
  const { data: portfolios, error: portfoliosError } = await supabase
    .from('portfolios')
    .select('*')
    .order('name', { ascending: true });
  
  // Get the default or first portfolio
  const defaultPortfolio = getDefaultPortfolio(portfolios || []);
  
  // If a portfolio exists, fetch its transactions
  let portfolioTransactions = [];
  if (defaultPortfolio) {
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('portfolio_id', defaultPortfolio.id)
      .order('date', { ascending: false });
    
    if (!transactionsError) {
      portfolioTransactions = transactions || [];
    }
  }
  
  // Pass data to client component
  return (
    <PortfolioClient
      selectedCurrency={selectedCurrency}
      hideBalances={hideBalances}
      marketData={marketData}
      initialPortfolios={portfolios || []}
      initialDefaultPortfolio={defaultPortfolio}
      initialTransactions={portfolioTransactions}
    />
  );
}