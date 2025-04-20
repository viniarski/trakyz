// components/Markets/MarketRates.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { MarketHeader } from "./MarketHeader";
import { LoadingState } from "./LoadingState";
import { Watchlist } from "./Watchlist";
import { MarketAssets } from "./MarketModular";
import { useMarketSettingsStore } from "@/lib/stores/useMarketSettingsStore";
import { useWatchlistStore } from "@/lib/stores/useWatchlistStore";
import { 
  registerHandler, 
  unregisterHandler, 
  cleanupChannels, 
  getSubscriptionStatus,
  checkDataFreshness
} from "@/lib/realtime";
import useMergeData from "@/hooks/use-merge-data";
import type { 
  Metal, 
  Stock, 
  Currency, 
  Crypto, 
  CurrencyCode, 
  AssetCategory 
} from "@/types";

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

interface MarketRatesProps {
  metals: Metal[] | null;
  crypto: Crypto[] | null;
  stocks: Stock[] | null;
  currencies: Currency[] | null;
  loading: boolean;
  selectedCurrency: CurrencyCode;
  currencyRates: {
    currencies: Currency[] | null;
    crypto: Crypto[] | null;
  };
}

export function MarketRates({
  metals: initialMetals,
  crypto: initialCrypto,
  stocks: initialStocks,
  currencies: initialCurrencies,
  loading: initialLoading,
  selectedCurrency,
  currencyRates: initialCurrencyRates,
}: MarketRatesProps) {
  // Get market settings from Zustand store
  const { 
    showMore, 
    setShowMore,
    selectedPeriod,
    setSelectedPeriod
  } = useMarketSettingsStore();
  
  // Get watchlist data from Zustand store
  const {
    watchlist,
    toggleWatchlistItem
  } = useWatchlistStore();
  
  const [view, setView] = useState<"market" | "watchlist">("market");

  const [metals, setMetals] = useState<Metal[] | null>(initialMetals || null);
  const [crypto, setCrypto] = useState<Crypto[] | null>(
    initialCrypto || null
  );
  const [stocks, setStocks] = useState<Stock[] | null>(initialStocks || null);
  const [currencies, setCurrencies] = useState<Currency[] | null>(
    initialCurrencies || null
  );

  const [isLoading, setIsLoading] = useState(initialLoading);
  const [currencyRates, setCurrencyRates] = useState(initialCurrencyRates);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Record<string, Date>>({
    metals: new Date(),
    crypto: new Date(),
    stocks: new Date(),
    currencies: new Date()
  });

  const {
    mergeMetalData,
    mergeCryptoData,
    mergeStockData,
    mergeCurrencyData,
    updatedItems,
  } = useMergeData();

  // Fetch data for a specific market category
  const fetchData = async (category: "metals" | "crypto" | "stocks" | "currencies") => {
    try {
      // Set local loading state just for this category
      setIsLoading(true);
      
      const response = await fetch(`/api/market/${category}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${category} data: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Update the state based on the category
        switch (category) {
          case "metals":
            setMetals(data.data);
            break;
          case "crypto":
            setCrypto(data.data);
            break;
          case "stocks":
            setStocks(data.data);
            break;
          case "currencies":
            setCurrencies(data.data);
            break;
        }
        
        // Update last refresh time
        setLastRefresh(prev => ({
          ...prev,
          [category]: new Date()
        }));
      }
    } catch (err) {
      console.error(`Error fetching ${category} data:`, err);
      setError(`Failed to load ${category} data`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize data and set up realtime
  useEffect(() => {
    // Store the initial data if provided
    if (initialMetals) setMetals(initialMetals);
    if (initialCrypto) setCrypto(initialCrypto);
    if (initialStocks) setStocks(initialStocks);
    if (initialCurrencies) setCurrencies(initialCurrencies);
    
    // Function to check freshness and refresh all data categories if needed
    const checkAllDataFreshness = async () => {
      try {
        setIsLoading(true);
        const categories: ("metals" | "crypto" | "stocks" | "currencies")[] = [
          "metals", "crypto", "stocks", "currencies"
        ];
        
        const refreshPromises = categories.map(async category => {
          const needsRefresh = await checkDataFreshness(category);
          if (needsRefresh) {
            console.log(`${category} needs refresh, fetching...`);
            return fetchData(category);
          }
          return Promise.resolve();
        });
        
        await Promise.all(refreshPromises);
      } catch (err) {
        console.error("Error checking data freshness:", err);
        setError("Failed to check data freshness");
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check of data freshness
    checkAllDataFreshness();
    
    // Set up realtime listeners
    const setupRealtime = () => {
      type DataType = Metal | Crypto | Stock | Currency;
      
      // Generic handler creation
      const createChangeHandler = <T extends DataType>(
        stateSetter: React.Dispatch<React.SetStateAction<T[] | null>>,
        mergeFn: (current: T[] | null, newData: T) => T[],
        category: string
      ) => {
        return (payload: any) => {
          const eventType = payload.eventType;
          if (eventType === "INSERT" || eventType === "UPDATE") {
            console.log(`Handling ${category} ${eventType}:`, payload.new);
            stateSetter((current) => {
              return mergeFn(current, payload.new as T);
            });
          }
        };
      };
      
      // Create handlers for each data type
      const handleMetalsChanges = createChangeHandler(
        setMetals,
        mergeMetalData,
        "metals"
      );
      
      const handleCryptoChanges = createChangeHandler(
        setCrypto,
        mergeCryptoData,
        "crypto"
      );
      
      const handleStocksChanges = createChangeHandler(
        setStocks,
        mergeStockData,
        "stocks"
      );
      
      const handleCurrenciesChanges = createChangeHandler(
        setCurrencies,
        mergeCurrencyData,
        "currencies"
      );
      
      // Register all handlers
      registerHandler("metals", handleMetalsChanges);
      registerHandler("crypto", handleCryptoChanges);
      registerHandler("stocks", handleStocksChanges);
      registerHandler("currencies", handleCurrenciesChanges);
      
      // Return cleanup function
      return () => {
        unregisterHandler("metals", handleMetalsChanges);
        unregisterHandler("crypto", handleCryptoChanges);
        unregisterHandler("stocks", handleStocksChanges);
        unregisterHandler("currencies", handleCurrenciesChanges);
        if (process.env.NODE_ENV !== "development") {
          cleanupChannels();
        }
      };
    };
    
    // Setup realtime
    const realtimeCleanup = setupRealtime();
    
    // Set up periodic checks for realtime status
    const statusInterval = setInterval(() => {
      const categories: ("metals" | "crypto" | "stocks" | "currencies")[] = [
        "metals", "crypto", "stocks", "currencies"
      ];
      
      const allSubscribed = categories.every(
        (cat) => getSubscriptionStatus(cat) === "SUBSCRIBED"
      );
      
      setRealtimeConnected(allSubscribed);
      
      // If realtime is not connected, check if data needs refresh
      if (!allSubscribed && !isLoading) {
        checkAllDataFreshness();
      }
    }, 10000);
    
    // Set up a periodic data refresh as a fallback
    const refreshInterval = setInterval(() => {
      checkAllDataFreshness();
    }, 300000); // Every 5 minutes as a fallback
    
    // Cleanup
    return () => {
      realtimeCleanup();
      clearInterval(statusInterval);
      clearInterval(refreshInterval);
    };
  }, [
    initialMetals, 
    initialCrypto, 
    initialStocks, 
    initialCurrencies,
    mergeMetalData,
    mergeCryptoData,
    mergeStockData,
    mergeCurrencyData
  ]);

  // Update currency rates when relevant data changes
  useEffect(() => {
    if (crypto || currencies) {
      setCurrencyRates({ crypto, currencies });
    }
  }, [crypto, currencies]);

  // Sort cryptocurrencies by market cap
  const sortedCrypto = useMemo(() => {
    return crypto
      ? [...crypto].sort((a, b) => {
          // Primary sort by market cap (descending)
          if (a.market_cap && b.market_cap) {
            return b.market_cap - a.market_cap;
          }
          
          // If market cap is missing for either, fallback to using the volume
          if (a.volume_24h && b.volume_24h) {
            return b.volume_24h - a.volume_24h;
          }
          
          // Last resort: alphabetical sort by symbol
          return a.symbol.localeCompare(b.symbol);
        })
      : null;
  }, [crypto]);

  // Sort stocks based on preferred order
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

  // Sort currencies based on preferred order
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

  // Sort metals based on preferred order
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

  // Filter currencies based on show more setting
  const filteredCurrencies = useMemo(() => {
    return sortedCurrencies
      ? showMore
        ? sortedCurrencies
        : sortedCurrencies.filter((curr) =>
            PREFERRED_CURRENCY_ORDER.slice(0, 7).includes(curr.symbol)
          )
      : null;
  }, [sortedCurrencies, showMore]);

  // Prepare watchlist data
  const watchlistData = useMemo(() => {
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
    watchlist,
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

  // Handle error case
  if (error) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-xl mt-3 p-6 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl mt-3">
      <MarketHeader
        view={view}
        setView={setView}
      />

      <div className="p-6 border-t border-gray-800/50">
        {isLoading ? (
          <LoadingState />
        ) : view === "watchlist" ? (
          hasWatchlistItems ? (
            <Watchlist
              watchlist={watchlist}
              onToggleWatchlist={toggleWatchlistItem}
              marketData={{
                metals: sortedMetals,
                crypto: sortedCrypto,
                stocks: sortedStocks,
                currencies: sortedCurrencies,
              }}
              selectedCurrency={selectedCurrency}
              currencyRates={currencyRates}
              updatedItems={updatedItems}
            />
          ) : (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              No assets in watchlist yet
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="transition-all duration-300 ease-in-out">
              <MarketAssets
                assets={sortedCrypto}
                limit={showMore ? 20 : 10}
                watchlist={watchlist}
                onToggleWatchlist={toggleWatchlistItem}
                selectedCurrency={selectedCurrency}
                currencyRates={currencyRates}
                updatedItems={updatedItems.crypto}
                assetType="Crypto"
              />
            </div>
            <div className="transition-all duration-300 ease-in-out">
              <MarketAssets
                assets={sortedStocks}
                limit={showMore ? 20 : 10}
                watchlist={watchlist}
                onToggleWatchlist={toggleWatchlistItem}
                selectedCurrency={selectedCurrency}
                currencyRates={currencyRates}
                updatedItems={updatedItems.stocks}
                assetType="Stocks & Indexes"
              />
            </div>
            <div className="space-y-7 transition-all duration-300 ease-in-out">
              <MarketAssets
                assets={sortedMetals}
                limit={showMore ? 4 : 2}
                watchlist={watchlist}
                onToggleWatchlist={toggleWatchlistItem}
                selectedCurrency={selectedCurrency}
                currencyRates={currencyRates}
                updatedItems={updatedItems.metals}
                assetType="Precious Metals"
              />
              <MarketAssets
                assets={filteredCurrencies}
                limit={showMore ? 15 : 7}
                watchlist={watchlist}
                onToggleWatchlist={toggleWatchlistItem}
                selectedCurrency={selectedCurrency}
                currencyRates={currencyRates}
                updatedItems={updatedItems.currencies}
                assetType="Cash"
              />
            </div>
          </div>
        )}
      </div>

      {view === "market" && (
        <div className="sm:flex hidden justify-center py-3 border-t border-gray-800/50">
          <button
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            onClick={() => setShowMore(!showMore)}
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