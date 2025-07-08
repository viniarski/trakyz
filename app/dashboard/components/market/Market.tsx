// app/dashboard/components/market/Market.tsx

"use client";

import { useState, useEffect } from "react";
import { MarketData } from "@/types";
import { MarketRates } from "@/components/Markets/components/MarketRates";
import { useUserSettings } from "@/hooks/useUserSettings";

interface MarketProps {
  marketData: MarketData;
  userId: string;
}

type MarketCategory = "all" | "crypto" | "stocks" | "metals" | "currencies";

export default function Market({ marketData, userId }: MarketProps) {
  const [loading, setLoading] = useState(false);
  const { settings, initializeFromDatabase } = useUserSettings();
  const [currencyRates, setCurrencyRates] = useState({
    currencies: marketData.currencies,
    crypto: marketData.crypto,
  });
  const [activeCategory, setActiveCategory] = useState<MarketCategory>("all");

  // Initialize settings from database on first load
  useEffect(() => {
    initializeFromDatabase();
  }, [initializeFromDatabase]);

  // Initialize currency rates from market data
  useEffect(() => {
    setCurrencyRates({
      currencies: marketData.currencies,
      crypto: marketData.crypto,
    });
  }, [marketData.currencies, marketData.crypto]);

  // Filter market data based on active category
  const getFilteredMarketData = () => {
    if (activeCategory === "all") {
      return marketData;
    }

    const filteredData = { ...marketData };
    
    // Reset all data arrays
    filteredData.metals = [];
    filteredData.crypto = [];
    filteredData.stocks = [];
    filteredData.currencies = [];
    
    // Set only the active category
    switch (activeCategory) {
      case "crypto":
        filteredData.crypto = marketData.crypto;
        break;
      case "stocks":
        filteredData.stocks = marketData.stocks;
        break;
      case "metals":
        filteredData.metals = marketData.metals;
        break;
      case "currencies":
        filteredData.currencies = marketData.currencies;
        break;
    }
    
    return filteredData;
  };

  const filteredData = getFilteredMarketData();

  return (
    <div className="space-y-6">
      <MarketRates
        metals={filteredData.metals}
        crypto={filteredData.crypto}
        stocks={filteredData.stocks}
        currencies={filteredData.currencies}
        loading={loading}
        currencyRates={currencyRates}
        selectedCurrency={settings.selectedCurrency}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
    </div>
  );
}