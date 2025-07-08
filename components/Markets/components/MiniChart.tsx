// components/Markets/components/MiniChart.tsx

"use client";

import { memo } from "react";
import {
  Metal,
  Stock,
  Currency,
  AssetCategory,
  Crypto as CryptoType,
} from "@/types";

type Asset = Currency | CryptoType | Metal | Stock;

interface MiniChartProps {
  symbol: string;
  priceChange: { isPositive: boolean };
  assets: Asset[];
  assetType: AssetCategory;
}

export const MiniChart = memo(function MiniChart({
  symbol,
  priceChange,
  assets: allAssets,
  assetType
}: MiniChartProps) {
  // Get historical data for the last 30 days for this specific symbol
  const getHistoricalData = () => {
    if (assetType !== "Crypto" && assetType !== "Stocks & Indexes" && assetType !== "Precious Metals" && assetType !== "Cash") return [];
    
    // Filter all price data for this symbol
    let allPricesForSymbol;
    
    if (assetType === "Crypto") {
      allPricesForSymbol = (allAssets as CryptoType[])
        .filter(asset => asset.symbol === symbol)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (assetType === "Stocks & Indexes") {
      allPricesForSymbol = (allAssets as Stock[])
        .filter(asset => asset.symbol === symbol)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (assetType === "Precious Metals") {
      allPricesForSymbol = (allAssets as Metal[])
        .filter(asset => asset.metal.toLowerCase() === symbol.toLowerCase())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (assetType === "Cash") {
      allPricesForSymbol = (allAssets as Currency[])
        .filter(asset => asset.symbol === symbol)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    if (!allPricesForSymbol || allPricesForSymbol.length === 0) return [];

    // Get last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const last30Days = allPricesForSymbol
      .filter(asset => new Date(asset.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort ascending for chart
      .slice(-30); // Get last 30 entries
    
    return last30Days.map(asset => asset.price);
  };

  const points = getHistoricalData();
  
  // Calculate 30-day trend for chart color (independent of the "Change" column)
  const calculate30DayTrend = () => {
    if (points.length < 2) return true; // Default to positive if no data
    
    const firstPrice = points[0]; // 30 days ago price
    const lastPrice = points[points.length - 1]; // Current/latest price
    
    return lastPrice >= firstPrice; // True if price went up over 30 days
  };
  
  const is30DayPositive = calculate30DayTrend();
  const chartColor = is30DayPositive ? "#10b981" : "#ef4444";
  
  // If we don't have enough historical data, don't render the chart
  if (points.length < 2) {
    return (
      <div className="w-20 h-6 flex items-center justify-center">
        <span className="text-xs text-[var(--text-tertiary)]">No data</span>
      </div>
    );
  }

  // Create SVG path
  const width = 80;
  const height = 24;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const path = points
    .map((point, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((point - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="w-20 h-6 flex items-center justify-center">
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={path}
          stroke={chartColor}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});