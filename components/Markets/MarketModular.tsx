// component/Markets/MarketModular.tsx

"use client";

import { useMemo, memo } from "react";
import {
  Bitcoin,
  DollarSign,
  Coins,
  LineChart,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type {
  Metal,
  Stock,
  Currency,
  CurrencyCode,
  AssetCategory,
  Crypto as CryptoType,
} from "@/types";
import { formatCurrency, convertCurrency } from "@/lib/utils";
import { AssetContextMenu } from "../ui/context-menu";

type Asset = Currency | CryptoType | Metal | Stock;

type MarketAssetsProps = {
  assets: Asset[] | null;
  limit: number;
  watchlist: {
    id: string;
    category: AssetCategory;
    symbol: string;
    order: number;
  }[];
  onToggleWatchlist: (category: AssetCategory, symbol: string) => void;
  selectedCurrency: CurrencyCode;
  currencyRates: {
    currencies: Currency[] | null;
    crypto: CryptoType[] | null;
  };
  selectedPeriod: "24H" | "7D";
  updatedItems?: Set<string>;
  assetType: AssetCategory;
};

export const MarketAssets = memo(
  function MarketAssets({
    assets,
    limit,
    watchlist,
    onToggleWatchlist,
    selectedCurrency,
    currencyRates,
    selectedPeriod,
    updatedItems = new Set(),
    assetType,
  }: MarketAssetsProps) {
    const calculatePriceChange = useMemo(
      () =>
        (symbol: string): { changePercent: number; isPositive: boolean } => {
          const allPricesForSymbol = (assets || [])
            .filter((a) =>
              // filtering logic for different asset types
              assetType === "Crypto"
                ? (a as CryptoType).symbol === symbol
                : assetType === "Cash"
                ? (a as Currency).symbol === symbol
                : assetType === "Precious Metals"
                ? (a as Metal).metal.toLowerCase() === symbol.toLowerCase()
                : assetType === "Stocks & Indexes"
                ? (a as Stock).symbol === symbol
                : false
            )
            .sort(
              (a, b) =>
                new Date((b as Asset).date).getTime() -
                new Date((a as Asset).date).getTime()
            );

          if (allPricesForSymbol.length === 0)
            return { changePercent: 0, isPositive: true };

          const currentPrice = (allPricesForSymbol[0] as Asset).price;
          const comparisonDate = new Date();

          if (selectedPeriod === "24H") {
            comparisonDate.setHours(comparisonDate.getHours() - 24);
          } else {
            comparisonDate.setDate(comparisonDate.getDate() - 7);
          }

          const oldPriceData = allPricesForSymbol.find(
            (p) => new Date((p as Asset).date) <= comparisonDate
          );
          if (!oldPriceData) return { changePercent: 0, isPositive: true };

          const changePercent =
            ((currentPrice - (oldPriceData as Asset).price) /
              (oldPriceData as Asset).price) *
            100;
          return {
            changePercent,
            isPositive: changePercent >= 0,
          };
        },
      [assets, selectedPeriod, assetType]
    );

    const displayAssets = useMemo(() => {
      if (!assets) return [];

      const uniqueAssets = Array.from(
        assets.reduce((map, asset) => {
          let key: string;
          switch (assetType) {
            case "Crypto":
              key = (asset as CryptoType).symbol;
              break;
            case "Cash":
              key = (asset as Currency).symbol;
              break;
            case "Precious Metals":
              key = (asset as Metal).metal;
              break;
            case "Stocks & Indexes":
              key = (asset as Stock).symbol;
              break;
            default:
              key = "";
          }

          const existingAsset = map.get(key);
          if (
            !existingAsset ||
            new Date(asset.date) > new Date(existingAsset.date)
          ) {
            map.set(key, asset);
          }
          return map;
        }, new Map<string, Asset>())
      )
        .map(([, asset]) => asset)
        .slice(0, limit);

      return uniqueAssets;
    }, [assets, limit, assetType]);

    // asset type specific configurations
    const config = useMemo(() => {
      switch (assetType) {
        case "Crypto":
          return {
            icon: <Bitcoin className="h-5 w-5 text-orange-500" />,
            title: "Crypto",
            getSymbol: (asset: Asset) => (asset as CryptoType).symbol,
            getName: (asset: Asset) => (asset as CryptoType).name,
          };
        case "Cash":
          return {
            icon: <DollarSign className="h-5 w-5 text-green-500" />,
            title: "Currencies",
            getSymbol: (asset: Asset) => (asset as Currency).symbol,
            getName: (asset: Asset) => (asset as Currency).name,
          };
        case "Precious Metals":
          return {
            icon: <Coins className="h-5 w-5 text-yellow-500" />,
            title: "Precious Metals",
            getSymbol: (asset: Asset) => (asset as Metal).metal,
            getName: (asset: Asset) => (asset as Metal).metal,
          };
        case "Stocks & Indexes":
          return {
            icon: <LineChart className="h-5 w-5 text-blue-500" />,
            title: "Stocks & ETFs",
            getSymbol: (asset: Asset) => (asset as Stock).symbol,
            getName: (asset: Asset) => (asset as Stock).name,
          };
        default:
          return {
            icon: null,
            title: "Assets",
            getSymbol: () => "",
            getName: () => "",
          };
      }
    }, [assetType]);

    if (!displayAssets.length) return null;

    return (
      <div className="space-y-3 transition-all duration-300 ease-in-out">
        <div className="flex items-center gap-2">
          {config.icon}
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">
            {config.title}
          </h3>
        </div>

        <div className="space-y-2">
          {displayAssets.map((asset) => {
            const symbol = config.getSymbol(asset);
            const name = config.getName(asset);

            const isInWatchlist = watchlist.some(
              (item) =>
                item.category === assetType &&
                (assetType === "Precious Metals"
                  ? item.symbol.toLowerCase() === symbol.toLowerCase()
                  : item.symbol === symbol)
            );

            const priceChange = calculatePriceChange(symbol);
            const rawPrice = convertCurrency(
              asset.price,
              "USD",
              selectedCurrency,
              currencyRates
            );

            const displayPrice = formatCurrency(rawPrice, selectedCurrency);
            const hasRecentUpdate = updatedItems.has(
              assetType === "Precious Metals" ? symbol.toLowerCase() : symbol
            );

            return (
              <div
                key={`${symbol}`}
                className="flex justify-between items-center text-sm py-1.5 transition-all duration-300 ease-in-out"
              >
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[var(--text-secondary)] ${
                      assetType === "Precious Metals" ? "capitalize" : ""
                    }`}
                  >
                    {symbol}
                  </span>
                  {name && assetType !== "Precious Metals" && (
                    <span className="text-[var(--text-secondary)] text-xs hidden sm:inline">
                      ({name})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-[var(--text-primary)] font-medium transition-all duration-300 ease-in-out ${
                      hasRecentUpdate ? "bg-green-500/10 rounded px-1" : ""
                    }`}
                  >
                    {displayPrice}
                  </span>
                  <div className="flex items-center gap-1 min-w-[80px] justify-end transition-all duration-300 ease-in-out">
                    {priceChange.isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`${
                        priceChange.isPositive
                          ? "text-green-500"
                          : "text-red-500"
                      } transition-all duration-300 ease-in-out`}
                    >
                      {Math.abs(priceChange.changePercent).toFixed(2)}%
                    </span>
                  </div>
                  <AssetContextMenu
                    isInWatchlist={isInWatchlist}
                    onToggleWatchlist={() =>
                      onToggleWatchlist(assetType, symbol)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.assets === nextProps.assets &&
      prevProps.limit === nextProps.limit &&
      prevProps.watchlist === nextProps.watchlist &&
      prevProps.selectedCurrency === nextProps.selectedCurrency &&
      prevProps.currencyRates === nextProps.currencyRates &&
      prevProps.selectedPeriod === nextProps.selectedPeriod &&
      prevProps.updatedItems === nextProps.updatedItems &&
      prevProps.assetType === nextProps.assetType
    );
  }
);
