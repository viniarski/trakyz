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

const PREFERRED_CURRENCY_ORDER = ["EUR", "GBP", "CHF", "JPY", "CNY", "PLN", "CAD"];
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
}: MarketRatesProps) {
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

    const dataFetch = async () => {
      const [metalsRes, cryptoRes, stocksRes, currenciesRes] =
        await Promise.all([
          fetch("/api/market/metals"),
          fetch("/api/market/crypto"),
          fetch("/api/market/stocks"),
          fetch("/api/market/currencies"),
        ]);

      const [metalsData, cryptoData, stocksData, currenciesData] =
        await Promise.all([
          metalsRes.json(),
          cryptoRes.json(),
          stocksRes.json(),
          currenciesRes.json(),
        ]);

      if (metalsData.success && metalsData.data) setMetals(metalsData.data);
      if (cryptoData.success && cryptoData.data) setCrypto(cryptoData.data);
      if (stocksData.success && stocksData.data) setStocks(stocksData.data);
      if (currenciesData.success && currenciesData.data)
        setCurrencies(currenciesData.data);
    };

    const fetchInitialData = async () => {
      setIsLoading(true);
      console.log("Fetching initial data...");
      try {
        dataFetch();
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load initial market data");
      } finally {
        setIsLoading(false);
      }
    };

    const backgroundRefresh = async () => {
      if (realtimeConnected) {
        console.log("Realtime connected, skipping background refresh");
        return;
      }
      console.log("Executing background refresh...");
      try {
        dataFetch();
      } catch (err) {
        console.error("Error during background refresh:", err);
      }
    };

    fetchInitialData();
    const refreshInterval = setInterval(backgroundRefresh, 60000);

    // This part handles real-time updates from Supabase
    type DataType = Metal | CryptoType | Stock | Currency;
    type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T[] | null>>;
    type MergeFunction<T> = (current: T[], newData: T) => T[];
    type RemoveFunction<T> = (current: T[], oldData: T) => T[];

    const createGenericChangeHandler = <T extends DataType>(
      setState: SetStateFunction<T>,
      mergeFunction: MergeFunction<T>,
      removeFunction: RemoveFunction<T>,
      label: string
    ) => {
      return (payload: Record<string, unknown>) => {
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          console.log(`Handling ${label} ${payload.eventType}:`, payload.new);
          setState((current) => {
            const currentArray = current ?? [];
            return mergeFunction(currentArray, payload.new as T);
          });
        } else if (payload.eventType === "DELETE") {
          setState((current) => {
            if (!current) return null;
            const updatedArray = removeFunction(current, payload.old as T);
            return updatedArray.length > 0 ? updatedArray : null;
          });
        }
      };
    };

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
      clearInterval(refreshInterval);
      clearInterval(statusCheckInterval);
      if (process.env.NODE_ENV !== "development") {
        cleanupChannels();
      }
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

  // Sort stocks by preferred order
  const sortedStocks = useMemo(() => {
    return stocks
      ? [...stocks].sort((a, b) => {
          const indexA = PREFERRED_STOCKS_ORDER.indexOf(a.symbol);
          const indexB = PREFERRED_STOCKS_ORDER.indexOf(b.symbol);
          if (indexA === -1 && indexB === -1)
            return a.symbol.localeCompare(b.symbol);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        })
      : null;
  }, [stocks]);

  // Sort currencies by preferred order
  const sortedCurrencies = useMemo(() => {
    return currencies
      ? [...currencies].sort((a, b) => {
          const indexA = PREFERRED_CURRENCY_ORDER.indexOf(a.symbol);
          const indexB = PREFERRED_CURRENCY_ORDER.indexOf(b.symbol);
          if (indexA === -1 && indexB === -1)
            return a.symbol.localeCompare(b.symbol);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        })
      : null;
  }, [currencies]);

  // Sort metals by preferred order
  const sortedMetals = useMemo(() => {
    return metals
      ? [...metals].sort((a, b) => {
          const indexA = PREFERRED_METALS_ORDER.indexOf(a.metal.toUpperCase());
          const indexB = PREFERRED_METALS_ORDER.indexOf(b.metal.toUpperCase());
          if (indexA === -1 && indexB === -1)
            return a.metal.localeCompare(b.metal);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        })
      : null;
  }, [metals]);

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
      crypto?.filter((c) =>
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
    crypto,
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
      {/* Header with period selector and view tabs */}
      <MarketHeader
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={handlePeriodChange}
        view={view}
        setView={setView}
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
                crypto,
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Crypto Assets */}
            <div className="transition-all duration-300 ease-in-out">
              <MarketAssets
                assets={crypto}
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
              />
            </div>
          </div>
        )}
      </div>

      {/* Show More/Less Button */}
      {view === "market" && (
        <div className="sm:flex hidden justify-center py-3 border-t border-gray-800/50">
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
      )}
    </div>
  );
}