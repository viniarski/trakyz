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
  const tabValue = Array.isArray(tabParam) ? tabParam[0] : tabParam;
  
  let currentTab: string;
  
  if (tabValue && validTabs.includes(tabValue)) {
    // URL has a valid tab parameter - use it
    currentTab = tabValue;
  } else if (userProfile?.last_active_tab && validTabs.includes(userProfile.last_active_tab)) {
    // No URL tab, but user has a saved preference - use it
    currentTab = userProfile.last_active_tab;
  } else {
    // No URL tab and no saved preference - use "markets" as default
    currentTab = "markets";
  }

  // Update user's last active tab if it's different (async, don't await)
  if (currentTab !== userProfile?.last_active_tab) {
    supabase
      .from("user_profiles")
      .update({ last_active_tab: currentTab })
      .eq("id", user.id)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating last active tab:", error);
        }
      });
  }

  // Check for checkout success
  const checkoutSuccessParam = searchParams.checkout_success;
  const hasCheckoutSuccess = checkoutSuccessParam === "true";

  // Fetch user subscription status
  const { data: subscriptionData } = await supabase
    .from("user_subscriptions")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const isSubscribed =
    subscriptionData?.subscription_status === "active" ||
    subscriptionData?.subscription_status === "trialing";

  // Initialize data variables
  let marketData: MarketData = {
    metals: [],
    crypto: [],
    currencies: [],
    stocks: [],
    selectedCurrency: userProfile?.selected_currency || "USD",
  };
  let budgetData: BudgetData[] = [];
  let realEstateData: RealEstateProperty[] = [];
  let transactionsData: Transaction[] = [];
  let portfoliosData: Portfolio[] = [];
  let debtData: DebtData = {
    loans: [],
    creditCards: [],
  };

  // Conditionally fetch data based on the current tab for performance
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
      const [
        { data: loans, error: loanError },
        { data: creditCards, error: creditCardError }
      ] = await Promise.all([
        supabase
          .from("loans")
          .select("*")
          .eq("user_id", user.id),
        supabase
          .from("credit_cards")
          .select("*")
          .eq("user_id", user.id)
      ]);

      debtData = {
        loans: loans || [],
        creditCards: creditCards || [],
      };
      
      if (loanError) console.error("Error fetching loan data:", loanError);
      if (creditCardError) console.error("Error fetching credit card data:", creditCardError);
      break;

    case "real-estate":
      const [
        { data: realEstate, error: realEstateError },
        { data: realEstatePortfolios, error: realEstatePortfolioError }
      ] = await Promise.all([
        supabase
          .from("real_estate")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("portfolios")
          .select("*")
          .eq("user_id", user.id)
      ]);

      realEstateData = realEstate || [];
      portfoliosData = realEstatePortfolios || [];
      if (realEstateError) console.error("Error fetching real estate data:", realEstateError);
      if (realEstatePortfolioError) console.error("Error fetching portfolio data:", realEstatePortfolioError);
      break;

    case "portfolios":
      const [
        { data: portfolios, error: portfolioError },
        { data: portfolioTransactions, error: portfolioTransactionError },
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
      ]);

      portfoliosData = portfolios || [];
      transactionsData = portfolioTransactions || [];
      if (portfolioError) console.error("Error fetching portfolio data:", portfolioError);
      if (portfolioTransactionError) console.error("Error fetching portfolio transactions:", portfolioTransactionError);
      break;

    case "transactions":
      const { data: transactions, error: transactionError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(1000);

      transactionsData = transactions || [];
      if (transactionError) console.error("Error fetching transaction data:", transactionError);
      break;

    case "analytics":
      // Analytics needs multiple data sources
      const [
        { data: analyticsLoans },
        { data: analyticsCreditCards },
        { data: analyticsTransactions },
        { data: analyticsPortfolios },
      ] = await Promise.all([
        supabase
          .from("loans")
          .select("*")
          .eq("user_id", user.id),
        supabase
          .from("credit_cards")
          .select("*")
          .eq("user_id", user.id),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(1000),
        supabase
          .from("portfolios")
          .select("*")
          .eq("user_id", user.id),
      ]);

      debtData = {
        loans: analyticsLoans || [],
        creditCards: analyticsCreditCards || [],
      };
      transactionsData = analyticsTransactions || [];
      portfoliosData = analyticsPortfolios || [];
      break;

    default:
      // For default case, fetch minimal market data
      const { data: defaultMetals } = await supabase
        .from("metals")
        .select("*")
        .order("date", { ascending: false })
        .limit(10);
      
      marketData.metals = defaultMetals || [];
      break;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header isSubscribed={isSubscribed} />

      {/* Success message for checkout */}
      {hasCheckoutSuccess && (
        <div className="bg-green-600/20 border border-green-600/30 text-green-400 p-4 rounded-lg mb-6 mx-4">
          <p className="text-center font-medium">
            🎉 Success! Thank you for subscribing to Trakyz!
          </p>
        </div>
      )}

      {/* Financial Summary */}
      <FinancialSummary />

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
              userId={user.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}