// components/Markets/components/MarketHeader.tsx

"use client";

import { Star, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
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
  return (
    <div className="p-4 flex justify-between items-center flex-wrap gap-y-2">
      {/* Category Filter Buttons on the left */}
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={() => setActiveCategory("all")}
          variant={activeCategory === "all" ? "subtle" : "ghost"}
          size="sm"
          className={`flex items-center gap-1.5 ${
            activeCategory === "all" ? "hover:bg-[var(--accent-primary-20)]" : "text-[var(--text-secondary)]"
          }`}
        >
          <BarChart2 className="h-3.5 w-3.5" />
          <span>All</span>
        </Button>
        
        <Button
          onClick={() => setActiveCategory("crypto")}
          variant={activeCategory === "crypto" ? "subtle" : "ghost"}
          size="sm"
          className={`flex items-center gap-1.5 ${
            activeCategory === "crypto" ? "hover:bg-[var(--accent-primary-20)]" : "text-[var(--text-secondary)]"
          }`}
        >
          <CategoryIcon type="Crypto" size={3.5} useTextColor />
          <span>Crypto</span>
        </Button>
        
        <Button
          onClick={() => setActiveCategory("stocks")}
          variant={activeCategory === "stocks" ? "subtle" : "ghost"}
          size="sm"
          className={`flex items-center gap-1.5 ${
            activeCategory === "stocks" ? "hover:bg-[var(--accent-primary-20)]" : "text-[var(--text-secondary)]"
          }`}
        >
          <CategoryIcon type="Stocks & Indexes" size={3.5} useTextColor />
          <span>Stocks</span>
        </Button>
        
        <Button
          onClick={() => setActiveCategory("metals")}
          variant={activeCategory === "metals" ? "subtle" : "ghost"}
          size="sm"
          className={`flex items-center gap-1.5 ${
            activeCategory === "metals" ? "hover:bg-[var(--accent-primary-20)]" : "text-[var(--text-secondary)]"
          }`}
        >
          <CategoryIcon type="Precious Metals" size={3.5} useTextColor />
          <span>Metals</span>
        </Button>
        
        <Button
          onClick={() => setActiveCategory("currencies")}
          variant={activeCategory === "currencies" ? "subtle" : "ghost"}
          size="sm"
          className={`flex items-center gap-1.5 ${
            activeCategory === "currencies" ? "hover:bg-[var(--accent-primary-20)]" : "text-[var(--text-secondary)]"
          }`}
        >
          <CategoryIcon type="Cash" size={3.5} useTextColor />
          <span>Currencies</span>
        </Button>
      </div>

      {/* Period and Watchlist Buttons on the right */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setSelectedPeriod("24H")}
          variant={selectedPeriod === "24H" ? "subtle" : "ghost"}
          size="sm"
          className={selectedPeriod === "24H" ? "hover:bg-[var(--accent-primary-20)]" : "text-[var(--text-secondary)]"}
        >
          24H
        </Button>
        <Button
          onClick={() => setSelectedPeriod("7D")}
          variant={selectedPeriod === "7D" ? "subtle" : "ghost"}
          size="sm"
          className={selectedPeriod === "7D" ? "hover:bg-[var(--accent-primary-20)]" : "text-[var(--text-secondary)]"}
        >
          7D
        </Button>
        <Button
          onClick={() => setView(view === "market" ? "watchlist" : "market")}
          variant={view === "watchlist" ? "subtle" : "ghost"}
          size="sm"
          className={`flex items-center gap-1.5 ${
            view === "watchlist" ? "hover:bg-[var(--accent-primary-20)]" : "text-[var(--text-secondary)]"
          }`}
        >
          <Star className="h-3.5 w-3.5" />
          <span>Watchlist</span>
        </Button>
      </div>
    </div>
  );
}