// components/Markets/MarketRates.tsx

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  registerHandler,
  unregisterHandler,
  cleanupChannels,
  getSubscriptionStatus,
} from "@/lib/realtime";
import { MarketHeader } from "./MarketHeader";
import { LoadingState } from "./LoadingState";
import { Watchlist } from "./Watchlist";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useCurrencyStore } from "@/lib/stores/useCurrencyStore";
import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";
import type {
  MarketRatesProps,
  AssetCategory,
  Metal,
  Stock,
  Currency,
  Crypto as CryptoType,
} from "@/types";
import useMergeData from "./MarketRatesMerge";
import { MarketAssets } from "./MarketModular";
import {
  createGenericChangeHandler,
  sortByPreferredOrder,
} from "@/lib/utils/market";

const PREFERRED_CURRENCY_ORDER = [
  "EUR",
  "GBP",
  "CHF",
  "JPY",
  "CNY",
  "PLN",
  "CAD",
];
const PREFERRED_METALS_ORDER = ["GOLD", "SILVER", "PLATINUM", "PALLADIUM"];
const PREFERRED_STOCKS_ORDER = [
  "SPY",
  "NOBL",
  "FTSE",
  "AAPL",
  "AMZN",
  "GOOGL",
  "TSLA",
  "NVDA",
  "MSFT",
  "META",
];

export function MarketRates({
  metals: initialMetals,
  crypto: initialCrypto,
  stocks: initialStocks,
  currencies: initialCurrencies,
  loading: initialLoading,
  selectedCurrency: initialSelectedCurrency,
  currencyRates: initialCurrencyRates,
  activeCategory,
  setActiveCategory,
}: MarketRatesProps & {
  activeCategory: "all" | "crypto" | "stocks" | "metals" | "currencies";
  setActiveCategory: (category: "all" | "crypto" | "stocks" | "metals" | "currencies") => void;
}) {
  const {
    settings,
    updateSettings,
    isLoading: isSettingsLoading,
  } = useUserSettings();

  // Use currency from Zustand store (this will come from the CurrencySwitcher)
  const { currency } = useCurrencyStore();

  // Use our new currency converter hook
  const { convertValue, convertAndFormat } = useCurrencyConverter();

  const [showMore, setShowMore] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"24H" | "7D">("24H");
  const [view, setView] = useState<"market" | "watchlist">("market");

  const [metals, setMetals] = useState<Metal[] | null>(initialMetals || null);
  const [crypto, setCrypto] = useState<CryptoType[] | null>(
    initialCrypto || null
  );
  const [stocks, setStocks] = useState<Stock[] | null>(initialStocks || null);
  const [currencies, setCurrencies] = useState<Currency[] | null>(
    initialCurrencies || null
  );

  const [isLoading, setIsLoading] = useState(initialLoading);
  const [currencyRatesState, setCurrencyRatesState] = useState<{
    currencies: Currency[] | null;
    crypto: CryptoType[] | null;
    metals?: Metal[] | null;
  }>(initialCurrencyRates);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Initialize settings when they're loaded
  useEffect(() => {
    if (!isSettingsLoading && settings) {
      setShowMore(settings.marketRatesShowMore || false);
      setSelectedPeriod(settings.selectedPeriod || "24H");
    }
  }, [isSettingsLoading, settings]);

  const {
    mergeMetalData,
    mergeCryptoData,
    mergeStockData,
    mergeCurrencyData,
    updatedItems,
  } = useMergeData();

  // Fix the remove functions to match the expected signature
  const removeMetalData = useCallback(
    (current: Metal[] | null, oldItem: Metal): Metal[] => {
      if (!current) return [];
      return current.filter(
        (item) =>
          item.id !== oldItem.id &&
          item.metal.toLowerCase() !== oldItem.metal.toLowerCase()
      );
    },
    []
  );

  const removeCryptoData = useCallback(
    (current: CryptoType[] | null, oldItem: CryptoType): CryptoType[] => {
      if (!current) return [];
      return current.filter(
        (item) => item.id !== oldItem.id && item.symbol !== oldItem.symbol
      );
    },
    []
  );

  const removeStockData = useCallback(
    (current: Stock[] | null, oldItem: Stock): Stock[] => {
      if (!current) return [];
      return current.filter(
        (item) => item.id !== oldItem.id && item.symbol !== oldItem.symbol
      );
    },
    []
  );

  const removeCurrencyData = useCallback(
    (current: Currency[] | null, oldItem: Currency): Currency[] => {
      if (!current) return [];
      return current.filter(
        (item) => item.id !== oldItem.id && item.symbol !== oldItem.symbol
      );
    },
    []
  );

  useEffect(() => {
    console.log("Initializing MarketRates with initial data:", {
      metals: initialMetals?.length,
      crypto: initialCrypto?.length,
      stocks: initialStocks?.length,
      currencies: initialCurrencies?.length,
    });

    if (initialMetals) setMetals(initialMetals);
    if (initialCrypto) setCrypto(initialCrypto);
    if (initialStocks) setStocks(initialStocks);
    if (initialCurrencies) setCurrencies(initialCurrencies);
    if (initialMetals && initialCrypto && initialStocks && initialCurrencies)
      setIsLoading(false);

    // This part handles real-time updates from Supabase
    const handleMetalsChanges = createGenericChangeHandler<Metal>(
      setMetals,
      mergeMetalData,
      removeMetalData,
      "metals"
    );

    const handleCryptoChanges = createGenericChangeHandler<CryptoType>(
      setCrypto,
      mergeCryptoData,
      removeCryptoData,
      "crypto"
    );

    const handleStocksChanges = createGenericChangeHandler<Stock>(
      setStocks,
      mergeStockData,
      removeStockData,
      "stocks"
    );

    const handleCurrenciesChanges = createGenericChangeHandler<Currency>(
      setCurrencies,
      mergeCurrencyData,
      removeCurrencyData,
      "currencies"
    );

    // Register real-time handlers with Supabase
    registerHandler("metals", handleMetalsChanges);
    registerHandler("crypto", handleCryptoChanges);
    registerHandler("stocks", handleStocksChanges);
    registerHandler("currencies", handleCurrenciesChanges);

    // Check subscription status to avoid unnecessary polling
    const statusCheckInterval = setInterval(() => {
      const categories: ("metals" | "crypto" | "stocks" | "currencies")[] = [
        "metals",
        "crypto",
        "stocks",
        "currencies",
      ];
      const allSubscribed = categories.every(
        (cat) => getSubscriptionStatus(cat) === "SUBSCRIBED"
      );
      setRealtimeConnected(allSubscribed);
      if (!allSubscribed) {
        console.log(
          "Subscription status:",
          categories.map((cat) => `${cat}: ${getSubscriptionStatus(cat)}`)
        );
      }
    }, 10000);

    // Cleanup function for when component unmounts
    return () => {
      unregisterHandler("metals", handleMetalsChanges);
      unregisterHandler("crypto", handleCryptoChanges);
      unregisterHandler("stocks", handleStocksChanges);
      unregisterHandler("currencies", handleCurrenciesChanges);
      if (process.env.NODE_ENV !== "development") {
        cleanupChannels();
      }
      clearInterval(statusCheckInterval);
    };
  }, [
    initialMetals,
    initialCrypto,
    initialStocks,
    initialCurrencies,
    mergeMetalData,
    mergeCryptoData,
    mergeStockData,
    mergeCurrencyData,
    removeMetalData,
    removeCryptoData,
    removeStockData,
    removeCurrencyData,
    realtimeConnected,
  ]);

  // Update currency rates when crypto, currencies, or metals change
  useEffect(() => {
    if (crypto || currencies || metals) {
      setCurrencyRatesState({ crypto, currencies, metals });
    }
  }, [crypto, currencies, metals]);

  // Handler for toggling show more/less
  const handleShowMore = (value: boolean) => {
    setShowMore(value);
    updateSettings({ marketRatesShowMore: value });
  };

  // Handler for changing period
  const handlePeriodChange = (period: "24H" | "7D") => {
    setSelectedPeriod(period);
    updateSettings({ selectedPeriod: period });
  };

  // Handler for toggling watchlist items
  const handleToggleWatchlist = (category: AssetCategory, symbol: string) => {
    if (!settings?.watchlist) return;
    const watchlist = Array.isArray(settings.watchlist)
      ? settings.watchlist
      : [];
    const existingItem = watchlist.find(
      (item) => item.category === category && item.symbol === symbol
    );

    if (existingItem) {
      // Remove item if it exists
      const updatedWatchlist = watchlist.filter(
        (item) => item.id !== existingItem.id
      );
      updateSettings({ watchlist: updatedWatchlist });
    } else {
      // Add new item to watchlist
      const newItem = {
        id: `${category}-${symbol}`,
        category: category,
        symbol,
        order: watchlist.length,
      };
      const updatedWatchlist = [...watchlist, newItem];
      updateSettings({ watchlist: updatedWatchlist });
    }
  };

  // Sort cryptocurrencies by market cap
  const sortedCrypto = useMemo(() => {
    return crypto
      ? [...crypto].sort((a, b) => {
          // Handle undefined market caps
          const marketCapA = a.market_cap || 0;
          const marketCapB = b.market_cap || 0;
          
          // Sort by market cap (descending)
          return marketCapB - marketCapA;
        })
      : null;
  }, [crypto]);

  // Sort stocks by preferred order
  const sortedStocks = useMemo(
    () =>
      stocks
        ? sortByPreferredOrder(stocks, PREFERRED_STOCKS_ORDER, (s) => s.symbol)
        : null,
    [stocks]
  );

  // Sort currencies by preferred order
  const sortedCurrencies = useMemo(
    () =>
      currencies
        ? sortByPreferredOrder(
            currencies,
            PREFERRED_CURRENCY_ORDER,
            (s) => s.symbol
          )
        : null,
    [currencies]
  );

  // Sort metals by preferred order
  const sortedMetals = useMemo(
    () =>
      metals
        ? sortByPreferredOrder(metals, PREFERRED_METALS_ORDER, (s) =>
            s.metal.toUpperCase()
          )
        : null,
    [metals]
  );

  // Filter currencies based on showMore state
  const filteredCurrencies = useMemo(() => {
    return sortedCurrencies
      ? showMore
        ? sortedCurrencies
        : sortedCurrencies.filter((curr) =>
            PREFERRED_CURRENCY_ORDER.slice(0, 7).includes(curr.symbol)
          )
      : null;
  }, [sortedCurrencies, showMore]);

  // Determine which assets to show in watchlist
  const watchlistData = useMemo(() => {
    if (!settings?.watchlist)
      return { crypto: null, stocks: null, metals: null, currencies: null };
    const watchlist = Array.isArray(settings.watchlist)
      ? settings.watchlist
      : [];
    const cryptoWatchlist =
      sortedCrypto?.filter((c) =>
        watchlist.some(
          (item) => item.category === "Crypto" && item.symbol === c.symbol
        )
      ) || null;
    const stocksWatchlist =
      sortedStocks?.filter((s) =>
        watchlist.some(
          (item) =>
            item.category === "Stocks & Indexes" && item.symbol === s.symbol
        )
      ) || null;
    const metalsWatchlist =
      sortedMetals?.filter((m) =>
        watchlist.some(
          (item) =>
            item.category === "Precious Metals" &&
            item.symbol.toLowerCase() === m.metal.toLowerCase()
        )
      ) || null;
    const currenciesWatchlist =
      filteredCurrencies?.filter((c) =>
        watchlist.some(
          (item) => item.category === "Cash" && item.symbol === c.symbol
        )
      ) || null;
    return {
      crypto: cryptoWatchlist,
      stocks: stocksWatchlist,
      metals: metalsWatchlist,
      currencies: currenciesWatchlist,
    };
  }, [
    settings?.watchlist,
    sortedCrypto,
    sortedStocks,
    sortedMetals,
    filteredCurrencies,
  ]);

  // Check if watchlist has any items
  const hasWatchlistItems =
    view === "watchlist" &&
    ((watchlistData.crypto && watchlistData.crypto.length > 0) ||
      (watchlistData.stocks && watchlistData.stocks.length > 0) ||
      (watchlistData.metals && watchlistData.metals.length > 0) ||
      (watchlistData.currencies && watchlistData.currencies.length > 0));

  if (error) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-xl mt-3 p-6 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl mt-3">
      {/* Header with period selector, view tabs, and category filters */}
      <MarketHeader
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={handlePeriodChange}
        view={view}
        setView={setView}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <div className="p-6 border-t border-gray-800/50">
        {isLoading ? (
          <LoadingState />
        ) : view === "watchlist" ? (
          hasWatchlistItems ? (
            <Watchlist
              watchlist={
                Array.isArray(settings?.watchlist) ? settings.watchlist : []
              }
              onToggleWatchlist={handleToggleWatchlist}
              marketData={{
                metals: sortedMetals,
                crypto: sortedCrypto,
                stocks: sortedStocks,
                currencies: sortedCurrencies,
              }}
              selectedCurrency={currency}
              currencyRates={currencyRatesState}
              selectedPeriod={selectedPeriod}
              updatedItems={updatedItems}
            />
          ) : (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              No assets in watchlist yet
            </div>
          )
        ) : activeCategory === "all" ? (
          // "All" view - 3-column grid layout (original)
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Crypto Assets */}
              <div className="transition-all duration-300 ease-in-out">
                <MarketAssets
                  assets={sortedCrypto}
                  limit={showMore ? 20 : 10}
                  watchlist={
                    Array.isArray(settings?.watchlist) ? settings.watchlist : []
                  }
                  onToggleWatchlist={handleToggleWatchlist}
                  selectedCurrency={currency}
                  currencyRates={currencyRatesState}
                  selectedPeriod={selectedPeriod}
                  updatedItems={updatedItems.crypto}
                  assetType="Crypto"
                  isSubtabView={false} // Keep original styling for "All" view
                />
              </div>

              {/* Stocks & ETFs */}
              <div className="transition-all duration-300 ease-in-out">
                <MarketAssets
                  assets={sortedStocks}
                  limit={showMore ? 20 : 10}
                  watchlist={
                    Array.isArray(settings?.watchlist) ? settings.watchlist : []
                  }
                  onToggleWatchlist={handleToggleWatchlist}
                  selectedCurrency={currency}
                  currencyRates={currencyRatesState}
                  selectedPeriod={selectedPeriod}
                  updatedItems={updatedItems.stocks}
                  assetType="Stocks & Indexes"
                  isSubtabView={false}
                />
              </div>

              {/* Metals and Currencies */}
              <div className="space-y-7 transition-all duration-300 ease-in-out">
                <MarketAssets
                  assets={sortedMetals}
                  limit={showMore ? 4 : 2}
                  watchlist={
                    Array.isArray(settings?.watchlist) ? settings.watchlist : []
                  }
                  onToggleWatchlist={handleToggleWatchlist}
                  selectedCurrency={currency}
                  currencyRates={currencyRatesState}
                  selectedPeriod={selectedPeriod}
                  updatedItems={updatedItems.metals}
                  assetType="Precious Metals"
                  isSubtabView={false}
                />
                <MarketAssets
                  assets={filteredCurrencies}
                  limit={showMore ? 15 : 7}
                  watchlist={
                    Array.isArray(settings?.watchlist) ? settings.watchlist : []
                  }
                  onToggleWatchlist={handleToggleWatchlist}
                  selectedCurrency={currency}
                  currencyRates={currencyRatesState}
                  selectedPeriod={selectedPeriod}
                  updatedItems={updatedItems.currencies}
                  assetType="Cash"
                  isSubtabView={false}
                />
              </div>
            </div>
            
            {/* Show More/Less Button centered across all columns */}
            <div className="flex justify-center pt-6">
              <button
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                onClick={() => handleShowMore(!showMore)}
              >
                {showMore ? "Show Less" : "Show More"}
                <span
                  className={`inline-block transition-transform ${
                    showMore ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
            </div>
          </>
        ) : (
          // Individual category subtab views - enhanced styling
          <div className="space-y-6">
            {activeCategory === "crypto" && (
              <MarketAssets
                assets={sortedCrypto}
                limit={showMore ? 50 : 20}
                watchlist={
                  Array.isArray(settings?.watchlist) ? settings.watchlist : []
                }
                onToggleWatchlist={handleToggleWatchlist}
                selectedCurrency={currency}
                currencyRates={currencyRatesState}
                selectedPeriod={selectedPeriod}
                updatedItems={updatedItems.crypto}
                assetType="Crypto"
                isSubtabView={true} // Enhanced styling for crypto subtab
              />
            )}

            {activeCategory === "stocks" && (
              <MarketAssets
                assets={sortedStocks}
                limit={showMore ? 50 : 20}
                watchlist={
                  Array.isArray(settings?.watchlist) ? settings.watchlist : []
                }
                onToggleWatchlist={handleToggleWatchlist}
                selectedCurrency={currency}
                currencyRates={currencyRatesState}
                selectedPeriod={selectedPeriod}
                updatedItems={updatedItems.stocks}
                assetType="Stocks & Indexes"
                isSubtabView={true}
              />
            )}

            {activeCategory === "metals" && (
              <MarketAssets
                assets={sortedMetals}
                limit={showMore ? 10 : 5}
                watchlist={
                  Array.isArray(settings?.watchlist) ? settings.watchlist : []
                }
                onToggleWatchlist={handleToggleWatchlist}
                selectedCurrency={currency}
                currencyRates={currencyRatesState}
                selectedPeriod={selectedPeriod}
                updatedItems={updatedItems.metals}
                assetType="Precious Metals"
                isSubtabView={true}
              />
            )}

            {activeCategory === "currencies" && (
              <MarketAssets
                assets={sortedCurrencies}
                limit={showMore ? 30 : 15}
                watchlist={
                  Array.isArray(settings?.watchlist) ? settings.watchlist : []
                }
                onToggleWatchlist={handleToggleWatchlist}
                selectedCurrency={currency}
                currencyRates={currencyRatesState}
                selectedPeriod={selectedPeriod}
                updatedItems={updatedItems.currencies}
                assetType="Cash"
                isSubtabView={true}
              />
            )}

            {/* Show More/Less Button for subtab views */}
            <div className="flex justify-center pt-4">
              <button
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                onClick={() => handleShowMore(!showMore)}
              >
                {showMore ? "Show Less" : "Show More"}
                <span
                  className={`inline-block transition-transform ${
                    showMore ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}