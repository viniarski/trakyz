// components/Markets/MarketRates.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { MarketHeader } from "./MarketHeader";
import { LoadingState } from "./LoadingState";
import { Watchlist } from "./Watchlist";
import { MarketAssets } from "./MarketModular";
import { useMarketSettingsStore } from "@/lib/stores/useMarketSettingsStore";
import { useWatchlistStore } from "@/lib/stores/useWatchlistStore";
import type { Metal, Stock, Currency, Crypto, CurrencyCode, AssetCategory } from "@/types";

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
    initializeFromDatabase: initializeMarketSettings
  } = useMarketSettingsStore();
  
  // Get watchlist data from Zustand store
  const {
    watchlist,
    toggleWatchlistItem,
    initializeFromDatabase: initializeWatchlist
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
  const [updatedItems, setUpdatedItems] = useState<{
    metals: Set<string>;
    crypto: Set<string>;
    stocks: Set<string>;
    currencies: Set<string>;
  }>({
    metals: new Set(),
    crypto: new Set(),
    stocks: new Set(),
    currencies: new Set(),
  });

  // Initialize settings from database on first load
  useEffect(() => {
    initializeMarketSettings();
    initializeWatchlist();
  }, [initializeMarketSettings, initializeWatchlist]);

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
      try {
        setIsLoading(true);
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
      } catch (err) {
        console.error("Error fetching market data:", err);
        setError("Failed to load market data");
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we don't have data yet
    if (!initialMetals || !initialCrypto || !initialStocks || !initialCurrencies) {
      dataFetch();
    } else {
      setIsLoading(false);
    }

    // Set up a refresh interval
    const refreshInterval = setInterval(() => {
      dataFetch();
    }, 60000); // Refresh every minute

    return () => {
      clearInterval(refreshInterval);
    };
  }, [initialMetals, initialCrypto, initialStocks, initialCurrencies]);

  useEffect(() => {
    if (crypto || currencies) {
      setCurrencyRates({ crypto, currencies });
    }
  }, [crypto, currencies]);

  const handleToggleWatchlist = (category: AssetCategory, symbol: string) => {
    toggleWatchlistItem(category, symbol);
  };

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

  const filteredCurrencies = useMemo(() => {
    return sortedCurrencies
      ? showMore
        ? sortedCurrencies
        : sortedCurrencies.filter((curr) =>
            PREFERRED_CURRENCY_ORDER.slice(0, 7).includes(curr.symbol)
          )
      : null;
  }, [sortedCurrencies, showMore]);

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
              onToggleWatchlist={handleToggleWatchlist}
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
                onToggleWatchlist={handleToggleWatchlist}
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
                onToggleWatchlist={handleToggleWatchlist}
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
                onToggleWatchlist={handleToggleWatchlist}
                selectedCurrency={selectedCurrency}
                currencyRates={currencyRates}
                updatedItems={updatedItems.metals}
                assetType="Precious Metals"
              />
              <MarketAssets
                assets={filteredCurrencies}
                limit={showMore ? 15 : 7}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
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