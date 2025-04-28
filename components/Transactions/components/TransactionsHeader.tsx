// components/Transactions/components/TransactionsHeader.tsx

'use client'

import { Filter, Plus, Trash2 } from 'lucide-react'
import { ImportMenu } from './ImportMenu'
import { ExportMenu } from './ExportMenu'
import { CurrencyCode } from '@/types'

interface TransactionsHeaderProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  portfolios: Array<{ id: string, name: string }>;
  selectedPortfolio: string | null;
  setSelectedPortfolio: (id: string) => void;
  handleAddTransaction: () => void;
  handleDeleteAll: () => void;
  handleImportSuccess: () => void;
  showNotification: (type: 'success' | 'error', message: string) => void;
  currency: CurrencyCode;
  transactions: any[];
}

export function TransactionsHeader({
  showFilters,
  setShowFilters,
  portfolios,
  selectedPortfolio,
  setSelectedPortfolio,
  handleAddTransaction,
  handleDeleteAll,
  handleImportSuccess,
  showNotification,
  currency,
  transactions
}: TransactionsHeaderProps) {
  // Button styles to match the Filter button
  const baseButtonClass = "text-sm px-3 py-1.5 rounded-md transition-colors font-medium";
  const activeButtonClass = "bg-[var(--accent-primary-20)] text-[var(--accent-primary)]";
  const inactiveButtonClass = "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]";

  return (
    <div className="p-4 flex justify-between items-center">
      <div className="flex flex-wrap items-center gap-2">
        {/* Add Transaction on the left */}
        <button
          onClick={handleAddTransaction}
          className={`${baseButtonClass} bg-[var(--accent-primary-20)] text-[var(--accent-primary)] flex items-center gap-1.5`}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Add Transaction</span>
        </button>
        
        {/* Portfolio selector - Updated styling to match Filter button */}
        {portfolios.length > 0 && (
          <select
            value={selectedPortfolio || ''}
            onChange={(e) => setSelectedPortfolio(e.target.value)}
            className={`${baseButtonClass} ${inactiveButtonClass} focus:outline-none`}
          >
            {portfolios.map(portfolio => (
              <option key={portfolio.id} value={portfolio.id}>
                {portfolio.name}
              </option>
            ))}
          </select>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {/* Filter and action buttons on the right */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`${baseButtonClass} ${showFilters ? activeButtonClass : inactiveButtonClass} flex items-center gap-1.5`}
        >
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Filters</span>
        </button>
        
        <ImportMenu 
          onNotification={showNotification}
          onImportSuccess={handleImportSuccess}
          selectedPortfolio={selectedPortfolio || undefined}
        />
        
        <ExportMenu 
          onNotification={showNotification}
          selectedCurrency={currency}
          currencyRates={{
            currencies: null,
            crypto: null
          }}
          selectedPortfolio={selectedPortfolio || undefined}
        />
        
        <button
          onClick={handleDeleteAll}
          className={`${baseButtonClass} ${inactiveButtonClass} text-red-500 hover:text-red-500 hover:bg-red-500/10 flex items-center gap-1.5`}
          disabled={!selectedPortfolio || transactions.length === 0}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Delete All</span>
        </button>
      </div>
    </div>
  )
}