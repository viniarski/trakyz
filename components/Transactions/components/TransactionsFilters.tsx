// components/Transactions/components/TransactionsFilters.tsx

import React from 'react';
import { Input } from '@/components/ui/Input';

interface FiltersState {
  startDate: string;
  endDate: string;
  type: string;
  category: string;
  assetType: string;
}

interface TransactionsFiltersProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
}

export function TransactionsFilters({ filters, setFilters }: TransactionsFiltersProps) {
  return (
    <div className="p-4 border-b border-gray-700 flex flex-wrap gap-4">
      <div className="flex-1 min-w-[150px]">
        <label className="text-[var(--text-secondary)] text-sm">
          Start Date
        </label>
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
          className="mt-1 bg-[var(--bg-secondary)] border-[var(--bg-hover)]"
        />
      </div>
      
      <div className="flex-1 min-w-[150px]">
        <label className="text-[var(--text-secondary)] text-sm">
          End Date
        </label>
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            setFilters({ ...filters, endDate: e.target.value })
          }
          className="mt-1 bg-[var(--bg-secondary)] border-[var(--bg-hover)]"
        />
      </div>
      
      <div className="flex-1 min-w-[150px]">
        <label className="text-[var(--text-secondary)] text-sm">Type</label>
        <select
          value={filters.type}
          onChange={(e) =>
            setFilters({
              ...filters,
              type: e.target.value as "ALL" | "BUY" | "SELL",
            })
          }
          className="w-full p-2 rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--bg-hover)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] mt-1"
        >
          <option value="ALL">All</option>
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </select>
      </div>
      
      <div className="flex-1 min-w-[150px]">
        <label className="text-[var(--text-secondary)] text-sm">
          Category
        </label>
        <Input
          value={filters.category}
          onChange={(e) =>
            setFilters({ ...filters, category: e.target.value })
          }
          placeholder="e.g., Crypto"
          className="mt-1 bg-[var(--bg-secondary)] border-[var(--bg-hover)]"
        />
      </div>
      
      <div className="flex-1 min-w-[150px]">
        <label className="text-[var(--text-secondary)] text-sm">
          Asset Type
        </label>
        <Input
          value={filters.assetType}
          onChange={(e) =>
            setFilters({ ...filters, assetType: e.target.value })
          }
          placeholder="e.g., BTC"
          className="mt-1 bg-[var(--bg-secondary)] border-[var(--bg-hover)]"
        />
      </div>
    </div>
  );
}