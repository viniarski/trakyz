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
import { Portfolio as NewPortfolio } from "./components/portfolio/Portfolio"
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

  // Fetch market data - needed for multiple tabs
  let marketData: MarketData = {
    metals: [],
    crypto: [],
    currencies: [],
    stocks: [],
  };

  // Conditionally fetch market data when needed
  if (currentTab === "markets" || currentTab === "portfolios") {
    const [
      { data: metals, error: metalsError },
      { data: crypto, error: cryptoError },
      { data: currencies, error: currencyError },
      { data: stocks, error: stocksError },
    ] = await Promise.all([
      supabase.from("metals").select("*").order("date", { ascending: false }),
      supabase.from("crypto").select("*").order("date", { ascending: false }),
      supabase
        .from("currencies")
        .select("*")
        .order("date", { ascending: false }),
      supabase.from("stocks").select("*").order("date", { ascending: false }),
    ]);

    marketData = {
      metals: metals || [],
      crypto: crypto || [],
      currencies: currencies || [],
      stocks: stocks || [],
      selectedCurrency: userProfile?.selected_currency || "USD",
    };

    // Log any market data errors
    if (metalsError) {
      console.error("Error fetching metals data:", metalsError);
    }
    if (cryptoError) {
      console.error("Error fetching crypto data:", cryptoError);
    }
    if (currencyError) {
      console.error("Error fetching currency data:", currencyError);
    }
    if (stocksError) {
      console.error("Error fetching stocks data:", stocksError);
    }
  }

  // Only fetch the data needed for the current tab
  let budgetData: BudgetData[] = [];
  let debtData: DebtData = { loans: [], creditCards: [] };
  let realEstateData: RealEstateProperty[] = [];
  let portfoliosData: Portfolio[] = [];
  let transactionsData: Transaction[] = [];

  // Fetch only the data needed for the currently selected tab
  switch (currentTab) {
    case "budget":
      const { data: budgets, error: budgetError } = await supabase
        .from("budgets")
        .select(
          `
          month, 
          planned_income, 
          planned_expenses, 
          updated_at,
          budget_income (
            income_options (name),
            is_selected
          ),
          budget_expenses (
            expense_options (name),
            is_selected
          )
        `
        )
        .eq("user_id", user.id)
        .order("month", { ascending: false })
        .limit(12);

      budgetData = budgets || [];
      if (budgetError) console.error("Error fetching budget data:", budgetError);
      break;

    case "debt":
      const { data: loans, error: loanError } = await supabase
        .from("loans")
        .select("*")
        .eq("user_id", user.id);

      debtData = {
        loans: loans || [],
        creditCards: [],
      };
      if (loanError) console.error("Error fetching debt data:", loanError);
      break;

    case "real-estate":
      const { data: realEstate, error: realEstateError } = await supabase
        .from("real_estate")
        .select("*")
        .eq("user_id", user.id);

      realEstateData = realEstate || [];
      if (realEstateError) console.error("Error fetching real estate data:", realEstateError);
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
        { data: analyticsDebt },
        { data: analyticsTransactions },
        { data: analyticsPortfolios },
      ] = await Promise.all([
        supabase
          .from("loans")
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
        loans: analyticsDebt || [],
        creditCards: [],
      };
      transactionsData = analyticsTransactions || [];
      portfoliosData = analyticsPortfolios || [];
      break;

    default:
      // For markets tab, we already fetched the data above
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

      {/* Financial Summary Component */}
      <FinancialSummary />

      <div className="flex-1 w-[90%] mx-auto py-8">
        <TabNavigation currentTab={currentTab} />

        <div className="bg-[var(--bg-secondary)] rounded-b-xl p-6 shadow-md">
          {currentTab === "budget" && (
            <Budget userId={user.id} budgets={budgetData} />
          )}

          {currentTab === "markets" && (
            <Market userId={user.id} marketData={marketData} />
          )}

          {currentTab === "debt" && (
            <Debt userId={user.id} debtData={debtData} />
          )}

          {currentTab === "real-estate" && (
            <RealEstate userId={user.id} realEstateData={realEstateData} />
          )}

          {currentTab === "portfolios" && (
            <NewPortfolio 
              marketData={marketData}
              hideBalances={false}
            />
          )}

          {currentTab === "transactions" && (
            <Transactions userId={user.id} transactions={transactionsData} />
          )}

          {currentTab === "analytics" && (
            <Analytics
              userId={user.id}
              debtData={debtData}
              transactions={transactionsData}
              portfolios={portfoliosData}
            />
          )}
        </div>
      </div>
    </div>
  );
}