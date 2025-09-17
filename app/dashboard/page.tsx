// app/dashboard/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header/index";
import Budget from "@/app/dashboard/components/budget/Budget";
import {
  BudgetData,
  MarketData,
  RealEstateProperty,
  Transaction,
  DebtData,
  Portfolio,
} from "@/types";
import { UserResponse } from "@supabase/supabase-js";
import Market from "./components/market/Market";
import RealEstate from "./components/real-estate/RealEstate";
import NewPortfolio from "./components/portfolio/Portfolio";
import Transactions from "./components/transactions/Transactions";
import TabNavigation from "@/components/TabNavigation";
import Analytics from "./components/analytics/Analytics";
import Debt from "./components/debt/Debt";
import FinancialSummary from "@/components/FinancialSummary";

// Define valid tab names
const validTabs = [
  "budget",
  "markets", 
  "debt",
  "real-estate",
  "portfolios",
  "transactions",
  "analytics",
];

// Create a direct export page function
export default async function Page(props: any) {
  // Use the props in a type-safe way
  const searchParams = (await props.searchParams) || {};

  const supabase = await createClient();

  // Fetch the authenticated user
  const {
    data: { user },
  }: UserResponse = await supabase.auth.getUser();

  // redirect users to sign in if not authenticated
  if (!user) {
    return redirect("/sign-in");
  }

  // Get user's last active tab from their profile
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("last_active_tab, selected_currency")
    .eq("id", user.id)
    .single();

  // Get the current tab from URL, with smart fallback logic
  const tabParam = searchParams.tab;
  const tabValue = Array.isArray(tabParam) ? 
    tabParam[0] : 
    tabParam;

  // Determine current tab
  const currentTab = validTabs.includes(tabValue) ? 
    tabValue : 
    (userProfile?.last_active_tab && validTabs.includes(userProfile.last_active_tab) ? 
      userProfile.last_active_tab : 
      "budget");

  // Update user's last active tab if it's different
  if (currentTab !== userProfile?.last_active_tab && validTabs.includes(currentTab)) {
    await supabase
      .from("user_profiles")
      .update({ last_active_tab: currentTab })
      .eq("id", user.id);
  }

  // FETCH ALL DATA FOR FINANCIAL SUMMARY (ALWAYS NEEDED)
  const [
    { data: summaryTransactions },
    { data: summaryDebts },
    { data: summaryCreditCards },
    { data: summaryRealEstate },
    { data: summaryMetals },
    { data: summaryCrypto },
    { data: summaryStocks },
    { data: summaryCurrencies }
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(1000),
    supabase
      .from("loans")
      .select("*")
      .eq("user_id", user.id),
    supabase
      .from("credit_cards")
      .select("*")
      .eq("user_id", user.id),
    supabase
      .from("real_estate")
      .select("*")
      .eq("user_id", user.id),
    // Get latest market prices for portfolio calculation
    supabase.from("metals").select("*").order("date", { ascending: false }).limit(20),
    supabase.from("crypto").select("*").order("date", { ascending: false }).limit(50),
    supabase.from("stocks").select("*").order("date", { ascending: false }).limit(50),
    supabase.from("currencies").select("*").order("date", { ascending: false }).limit(30)
  ]);

  // Set up basic data for FinancialSummary
  const summaryData = {
    transactions: summaryTransactions || [],
    debtData: {
      loans: summaryDebts || [],
      creditCards: summaryCreditCards || []
    },
    realEstateData: summaryRealEstate || [],
    marketData: {
      metals: summaryMetals || [],
      crypto: summaryCrypto || [],
      stocks: summaryStocks || [],
      currencies: summaryCurrencies || []
    }
  };

  // Generate currentPrices for FinancialSummary
  const summaryCurrentPrices: Record<string, number> = {};

  // Get latest prices for each asset type
  if (summaryData.marketData.crypto) {
    summaryData.marketData.crypto.forEach(crypto => {
      if (!summaryCurrentPrices[crypto.symbol] || new Date(crypto.date) > new Date(summaryData.marketData.crypto.find(c => c.symbol === crypto.symbol && summaryCurrentPrices[c.symbol])?.date || '')) {
        summaryCurrentPrices[crypto.symbol] = crypto.price;
      }
    });
  }

  if (summaryData.marketData.stocks) {
    summaryData.marketData.stocks.forEach(stock => {
      if (!summaryCurrentPrices[stock.symbol] || new Date(stock.date) > new Date(summaryData.marketData.stocks.find(s => s.symbol === stock.symbol && summaryCurrentPrices[s.symbol])?.date || '')) {
        summaryCurrentPrices[stock.symbol] = stock.price;
      }
    });
  }

  if (summaryData.marketData.metals) {
    summaryData.marketData.metals.forEach(metal => {
      const key = metal.metal.toUpperCase();
      if (!summaryCurrentPrices[key] || new Date(metal.date) > new Date(summaryData.marketData.metals.find(m => m.metal.toUpperCase() === key && summaryCurrentPrices[key])?.date || '')) {
        summaryCurrentPrices[key] = metal.price;
      }
    });
  }

  if (summaryData.marketData.currencies) {
    summaryData.marketData.currencies.forEach(currency => {
      if (!summaryCurrentPrices[currency.symbol] || new Date(currency.date) > new Date(summaryData.marketData.currencies.find(c => c.symbol === currency.symbol && summaryCurrentPrices[c.symbol])?.date || '')) {
        summaryCurrentPrices[currency.symbol] = currency.price;
      }
    });
  }

  // Initialize component-specific data
  let budgetData: BudgetData[] = [];
  let marketData: MarketData = {
    metals: [],
    crypto: [],
    currencies: [],
    stocks: [],
    selectedCurrency: userProfile?.selected_currency || "USD",
  };
  let debtData: DebtData = {
    loans: [],
    creditCards: [],
  };
  let realEstateData: RealEstateProperty[] = [];
  let portfoliosData: Portfolio[] = [];
  let transactionsData: Transaction[] = [];

  // Fetch tab-specific data based on current tab
  switch (currentTab) {
    case "markets":
      const [
        { data: metals, error: metalsError },
        { data: crypto, error: cryptoError },
        { data: currencies, error: currencyError },
        { data: stocks, error: stocksError },
      ] = await Promise.all([
        supabase.from("metals").select("*").order("date", { ascending: false }),
        supabase.from("crypto").select("*").order("date", { ascending: false }),
        supabase.from("currencies").select("*").order("date", { ascending: false }),
        supabase.from("stocks").select("*").order("date", { ascending: false }),
      ]);

      marketData = {
        metals: metals || [],
        crypto: crypto || [],
        currencies: currencies || [],
        stocks: stocks || [],
        selectedCurrency: userProfile?.selected_currency || "USD",
      };

      if (metalsError) console.error("Error fetching metals data:", metalsError);
      if (cryptoError) console.error("Error fetching crypto data:", cryptoError);
      if (currencyError) console.error("Error fetching currency data:", currencyError);
      if (stocksError) console.error("Error fetching stocks data:", stocksError);
      break;

    case "budget":
      const { data: budgets, error: budgetError } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .order("month", { ascending: false });

      budgetData = budgets || [];
      if (budgetError) console.error("Error fetching budget data:", budgetError);
      break;

    case "debt":
      // Use summary data for debt tab
      debtData = summaryData.debtData;
      break;

    case "real-estate":
      const [
        { data: realEstate, error: realEstateError },
        { data: realEstatePortfolios, error: realEstatePortfoliosError }
      ] = await Promise.all([
        supabase
          .from("real_estate")
          .select("*")
          .eq("user_id", user.id),
        supabase
          .from("portfolios")
          .select("*")
          .eq("user_id", user.id)
      ]);

      realEstateData = realEstate || [];
      portfoliosData = realEstatePortfolios || [];
      if (realEstateError) console.error("Error fetching real estate data:", realEstateError);
      if (realEstatePortfoliosError) console.error("Error fetching real estate portfolios data:", realEstatePortfoliosError);
      break;

    case "portfolios":
      const [
        { data: portfolios, error: portfolioError },
        { data: portfolioTransactions, error: portfolioTransactionError },
        { data: portfolioMetals, error: portfolioMetalsError },
        { data: portfolioCrypto, error: portfolioCryptoError },
        { data: portfolioCurrencies, error: portfolioCurrenciesError },
        { data: portfolioStocks, error: portfolioStocksError },
      ] = await Promise.all([
        supabase
          .from("portfolios")
          .select("*")
          .eq("user_id", user.id),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(1000),
        supabase.from("metals").select("*").order("date", { ascending: false }),
        supabase.from("crypto").select("*").order("date", { ascending: false }),
        supabase.from("currencies").select("*").order("date", { ascending: false }),
        supabase.from("stocks").select("*").order("date", { ascending: false }),
      ]);

      portfoliosData = portfolios || [];
      transactionsData = portfolioTransactions || [];
      marketData = {
        metals: portfolioMetals || [],
        crypto: portfolioCrypto || [],
        currencies: portfolioCurrencies || [],
        stocks: portfolioStocks || [],
        selectedCurrency: userProfile?.selected_currency || "USD",
      };

      if (portfolioError) console.error("Error fetching portfolio data:", portfolioError);
      if (portfolioTransactionError) console.error("Error fetching portfolio transaction data:", portfolioTransactionError);
      if (portfolioMetalsError) console.error("Error fetching portfolio metals data:", portfolioMetalsError);
      if (portfolioCryptoError) console.error("Error fetching portfolio crypto data:", portfolioCryptoError);
      if (portfolioCurrenciesError) console.error("Error fetching portfolio currencies data:", portfolioCurrenciesError);
      if (portfolioStocksError) console.error("Error fetching portfolio stocks data:", portfolioStocksError);
      break;

    case "transactions":
      // Use summary data for transactions
      transactionsData = summaryData.transactions;
      break;

    case "analytics":
      // Analytics needs both transaction data AND market data for historical prices
      const [
        { data: analyticsPortfolios },
        // Add market data fetching for analytics
        { data: analyticsMetals, error: analyticsMetalsError },
        { data: analyticsCrypto, error: analyticsCryptoError },
        { data: analyticsCurrencies, error: analyticsCurrenciesError },
        { data: analyticsStocks, error: analyticsStocksError },
      ] = await Promise.all([
        supabase
          .from("portfolios")
          .select("*")
          .eq("user_id", user.id),
        // Fetch all market data for historical analysis
        supabase.from("metals").select("*").order("date", { ascending: false }),
        supabase.from("crypto").select("*").order("date", { ascending: false }),
        supabase.from("currencies").select("*").order("date", { ascending: false }),
        supabase.from("stocks").select("*").order("date", { ascending: false }),
      ]);

      // Use summary data for analytics
      transactionsData = summaryData.transactions;
      debtData = summaryData.debtData;
      portfoliosData = analyticsPortfolios || [];
      
      marketData = {
        metals: analyticsMetals || [],
        crypto: analyticsCrypto || [],
        currencies: analyticsCurrencies || [],
        stocks: analyticsStocks || [],
        selectedCurrency: userProfile?.selected_currency || "USD",
      };

      if (analyticsMetalsError) console.error("Error fetching analytics metals data:", analyticsMetalsError);
      if (analyticsCryptoError) console.error("Error fetching analytics crypto data:", analyticsCryptoError);
      if (analyticsCurrenciesError) console.error("Error fetching analytics currencies data:", analyticsCurrenciesError);
      if (analyticsStocksError) console.error("Error fetching analytics stocks data:", analyticsStocksError);
      break;

    default:
      // For budget tab, no additional data needed
      break;
  }

  // Check if user has made their first transaction
  const hasTransactions = summaryData.transactions.length > 0;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Header />
      
      {/* Welcome message for first-time users */}
      {!hasTransactions && (
        <div className="w-[90%] mx-auto mt-6 bg-[var(--accent-primary)] text-white p-4 rounded-lg">
          <p className="text-center">
            Thank you for subscribing to Trakyz!
          </p>
        </div>
      )}

      {/* Financial Summary with Real Data - ALWAYS SHOWS COMPLETE DATA */}
      <FinancialSummary 
        transactions={summaryData.transactions}
        debtData={summaryData.debtData}
        realEstateData={summaryData.realEstateData}
        currentPrices={summaryCurrentPrices}
      />

      {/* Main Content with proper width constraint */}
      <div className="flex-1 w-[90%] mx-auto py-8">
        {/* Tab Navigation */}
        <TabNavigation currentTab={currentTab} />

        {/* Content Area */}
        <div className="bg-[var(--bg-secondary)] rounded-b-xl px-6 py-2 shadow-md">
          {currentTab === "budget" && (
            <Budget budgets={budgetData} userId={user.id} />
          )}
          
          {currentTab === "markets" && (
            <Market marketData={marketData} userId={user.id} />
          )}
          
          {currentTab === "debt" && (
            <Debt debtData={debtData} userId={user.id} />
          )}
          
          {currentTab === "real-estate" && (
            <RealEstate 
              portfolios={portfoliosData} 
              userId={user.id} 
              initialProperties={realEstateData}
            />
          )}
          
          {currentTab === "portfolios" && (
            <NewPortfolio
              portfolios={portfoliosData}
              transactions={transactionsData}
              marketData={marketData}
              userId={user.id}
            />
          )}
          
          {currentTab === "transactions" && (
            <Transactions 
              transactions={transactionsData} 
              userId={user.id} 
            />
          )}
          
          {currentTab === "analytics" && (
            <Analytics
              portfolios={portfoliosData}
              transactions={transactionsData}
              debtData={debtData}
              marketData={marketData}
              userId={user.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}