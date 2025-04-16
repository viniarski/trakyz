// app/dashboard/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header/index";
import Budget from "@/app/dashboard/components/budget/Budget";
import { BudgetData, MarketData, RealEstateProperty, Transaction, DebtData, Portfolio } from "@/types";
import { UserResponse } from "@supabase/supabase-js";
import Markets from "./components/market/Market";
import RealEstate from "./components/real-estate/RealEstate";
import Portfolios from "./components/portfolio";
import Transactions from "./components/transactions/Transactions";
import TabNavigation from "@/components/TabNavigation";
import Analytics from "./components/analytics/Analytics";
import Debt from "./components/debt/Debt";

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
// In Next.js, this special export can work around some type issues
export default async function Page(props: any) {
  // Use the props in a type-safe way
  const searchParams = (await props.searchParams) || {};

  // Get the current tab from URL, default to 'budget' if not set or invalid
  const tabParam = searchParams.tab;
  const tabValue = Array.isArray(tabParam) ? tabParam[0] : tabParam;
  const currentTab = validTabs.includes(tabValue || "") ? tabValue : "budget";

  // Check for checkout success
  const checkoutSuccessParam = searchParams.checkout_success;
  const hasCheckoutSuccess = checkoutSuccessParam === "true";

  const supabase = await createClient();

  // Fetch the authenticated user
  const {
    data: { user },
  }: UserResponse = await supabase.auth.getUser();

  // redirect users to sign in if not authenticated
  if (!user) {
    return redirect("/sign-in");
  }

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
      supabase.from("currencies").select("*").order("date", { ascending: false }),
      supabase.from("stocks").select("*").order("date", { ascending: false }),
    ]);

    marketData = {
      metals: metals || [],
      crypto: crypto || [],
      currencies: currencies || [],
      stocks: stocks || [],
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
        .order("month", { ascending: false });
      // log budget errors
      budgetData = budgets || [];
      if (budgetError) console.error("Error fetching budget data", budgetError);
      break;

    case "debt":
      const [
        { data: loans, error: loanError },
        { data: cards, error: cardsError },
      ] = await Promise.all([
        supabase.from("loans").select("*").eq("user_id", user.id),
        supabase.from("credit_cards").select("*").eq("user_id", user.id),
      ]);

      debtData = {
        loans: loans || [],
        creditCards: cards || [],
      };

      // Log any debt data errors
      if (loanError) {
        console.error("Error fetching loan data:", loanError);
      }
      if (cardsError) {
        console.error("Error fetching credit card data:", cardsError);
      }
      break;

    case "real-estate":
      const { data: realEstate, error: realEstateError } = await supabase
        .from("real_estate_properties")
        .select("*")
        .eq("user_id", user.id);

      realEstateData = realEstate || [];

      if (realEstateError) {
        console.error("Error fetching real estate data:", realEstateError);
      }
      break;

    case "portfolios":
      const { data: portfolios, error: portfolioError } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      portfoliosData = portfolios || [];

      if (portfolioError) {
        console.error("Error fetching portfolio data:", portfolioError);
      }
      break;

    case "transactions":
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      transactionsData = transactions || [];

      if (transactionsError) {
        console.error("Error fetching transactions data:", transactionsError);
      }
      break;

    case "analytics":
      // Fetch all required data for analytics
      const [
        { data: portfolioAnalytics, error: portfolioAnalyticsError },
        { data: transactionsAnalytics, error: transactionsAnalyticsError },
        { data: loansAnalytics, error: loansAnalyticsError },
        { data: cardsAnalytics, error: cardsAnalyticsError },
      ] = await Promise.all([
        supabase.from("portfolios").select("*").eq("user_id", user.id),
        supabase.from("transactions").select("*").eq("user_id", user.id),
        supabase.from("loans").select("*").eq("user_id", user.id),
        supabase.from("credit_cards").select("*").eq("user_id", user.id),
      ]);

      // Log errors
      if (portfolioAnalyticsError)
        console.error(
          "Error fetching portfolio data for analytics:",
          portfolioAnalyticsError
        );
      if (transactionsAnalyticsError)
        console.error(
          "Error fetching transactions data for analytics:",
          transactionsAnalyticsError
        );
      if (loansAnalyticsError)
        console.error(
          "Error fetching loans data for analytics:",
          loansAnalyticsError
        );
      if (cardsAnalyticsError)
        console.error(
          "Error fetching credit cards data for analytics:",
          cardsAnalyticsError
        );

      portfoliosData = portfolioAnalytics || [];
      transactionsData = transactionsAnalytics || [];
      debtData = {
        loans: loansAnalytics || [],
        creditCards: cardsAnalytics || [],
      };
      break;
  }

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen">
      <Header
        userEmail={user.email}
        userRole={user.user_metadata?.role || null}
        isSubscribed={isSubscribed}
      />

      {hasCheckoutSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mx-auto w-[90%] my-2">
          <p className="font-bold">Success!</p>
          <p>
            Your subscription has been activated. Thank you for subscribing to
            Trakyz!
          </p>
        </div>
      )}

      <div className="flex-1 w-[90%] mx-auto py-8">
        <TabNavigation currentTab={currentTab} />

        <div className="bg-[var(--bg-secondary)] rounded-b-xl p-6 shadow-md">
          {currentTab === "budget" && (
            <Budget userId={user.id} budgets={budgetData} />
          )}

          {currentTab === "markets" && (
            <Markets userId={user.id} marketData={marketData} />
          )}

          {currentTab === "debt" && (
            <Debt userId={user.id} debtData={debtData} />
          )}

          {currentTab === "real-estate" && (
            <RealEstate userId={user.id} realEstateData={realEstateData} />
          )}

          {currentTab === "portfolios" && (
            <Portfolios userId={user.id} portfolios={portfoliosData} />
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