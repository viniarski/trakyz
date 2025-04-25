// components/Markets/MarketHeader.tsx

"use client";

import { Star, Bitcoin, LineChart, Banknote, ShoppingBag } from "lucide-react";
import { SelectedPeriod, MarketCategory } from "@/types";

interface MarketHeaderProps {
  view: "market" | "watchlist";
  setView: (view: "market" | "watchlist") => void;
  selectedPeriod: SelectedPeriod;
  setSelectedPeriod: (period: SelectedPeriod) => void;
  activeCategory: MarketCategory;
  setActiveCategory: (category: MarketCategory) => void;
}

export function MarketHeader({
  view,
  setView,
  selectedPeriod,
  setSelectedPeriod,
  activeCategory,
  setActiveCategory,
}: MarketHeaderProps) {
  // Button styles to match Transactions.tsx
  const baseButtonClass = "text-sm px-3 py-1.5 rounded-md transition-colors font-medium";
  const activeButtonClass = "bg-[var(--accent-primary-20)] text-[var(--accent-primary)]";
  const inactiveButtonClass = "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]";

  return (
    <div className="p-4 flex justify-between items-center flex-wrap gap-y-2">
      {/* Category Filter Buttons on the left */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`${baseButtonClass} ${activeCategory === "all" ? activeButtonClass : inactiveButtonClass} flex items-center gap-1.5`}
        >
          <LineChart className="h-3.5 w-3.5" />
          <span>All</span>
        </button>
        
        <button
          onClick={() => setActiveCategory("crypto")}
          className={`${baseButtonClass} ${activeCategory === "crypto" ? activeButtonClass : inactiveButtonClass} flex items-center gap-1.5`}
        >
          <Bitcoin className="h-3.5 w-3.5" />
          <span>Crypto</span>
        </button>
        
        <button
          onClick={() => setActiveCategory("stocks")}
          className={`${baseButtonClass} ${activeCategory === "stocks" ? activeButtonClass : inactiveButtonClass} flex items-center gap-1.5`}
        >
          <LineChart className="h-3.5 w-3.5" />
          <span>Stocks</span>
        </button>
        
        <button
          onClick={() => setActiveCategory("metals")}
          className={`${baseButtonClass} ${activeCategory === "metals" ? activeButtonClass : inactiveButtonClass} flex items-center gap-1.5`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Metals</span>
        </button>
        
        <button
          onClick={() => setActiveCategory("currencies")}
          className={`${baseButtonClass} ${activeCategory === "currencies" ? activeButtonClass : inactiveButtonClass} flex items-center gap-1.5`}
        >
          <Banknote className="h-3.5 w-3.5" />
          <span>Currencies</span>
        </button>
      </div>

      {/* Period and Watchlist Buttons on the right */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedPeriod("24H")}
          className={`${baseButtonClass} ${selectedPeriod === "24H" ? activeButtonClass : inactiveButtonClass}`}
        >
          24H
        </button>
        <button
          onClick={() => setSelectedPeriod("7D")}
          className={`${baseButtonClass} ${selectedPeriod === "7D" ? activeButtonClass : inactiveButtonClass}`}
        >
          7D
        </button>
        <button
          onClick={() => setView(view === "market" ? "watchlist" : "market")}
          className={`${baseButtonClass} ${view === "watchlist" ? activeButtonClass : inactiveButtonClass} flex items-center gap-1.5`}
        >
          <Star className="h-3.5 w-3.5" />
          <span>Watchlist</span>
        </button>
      </div>
    </div>
  );
}