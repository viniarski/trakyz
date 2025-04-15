// app/dashboard/components/transactions/Transactions.tsx

'use client'

import React, { useState } from "react";
import { Transaction } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/lib/stores/useCurrencyStore";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Pencil, Trash2, ChevronUp, ChevronDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TransactionsProps {
  transactions: Transaction[];
  userId: string;
}

type SortKey = 'date' | 'transaction_type' | 'category' | 'asset_type' | 'quantity' | 'price' | 'total';
type SortOrder = 'asc' | 'desc';

const Transactions: React.FC<TransactionsProps> = ({
  transactions,
  userId,
}) => {
  // State for sorting and filtering
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'ALL',
    category: '',
    assetType: '',
  });

  // Get currency from store (or use default)
  const { currency } = useCurrencyStore();

  // Handle sort column click
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Apply filters to transactions
  const filteredTransactions = transactions.filter((tx) => {
    const date = new Date(tx.date);
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;

    return (
      (!startDate || date >= startDate) &&
      (!endDate || date <= endDate) &&
      (filters.type === 'ALL' || tx.transaction_type === filters.type) &&
      (!filters.category || tx.category.toLowerCase().includes(filters.category.toLowerCase())) &&
      (!filters.assetType || tx.asset_type.toLowerCase().includes(filters.assetType.toLowerCase()))
    );
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;
    switch (sortKey) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'transaction_type':
        comparison = a.transaction_type.localeCompare(b.transaction_type);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'asset_type':
        comparison = a.asset_type.localeCompare(b.asset_type);
        break;
      case 'quantity':
        comparison = a.quantity - b.quantity;
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'total':
        comparison = a.quantity * a.price - b.quantity * b.price;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Sort arrow component
  const SortArrow = ({ columnKey }: { columnKey: SortKey }) => (
    <span className="ml-1 inline-block">
      <ChevronUp
        className={`h-4 w-4 transition-transform ${
          sortKey === columnKey
            ? sortOrder === 'asc'
              ? 'text-[var(--text-primary)]'
              : 'text-[var(--text-primary)] rotate-180'
            : 'text-[var(--text-secondary)]/50'
        }`}
      />
    </span>
  );

  // Group transactions by date for mobile view
  const groupedTransactions = (() => {
    const groups: Record<string, Transaction[]> = {};
    
    sortedTransactions.forEach(transaction => {
      const dateStr = new Date(transaction.date).toLocaleDateString();
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(transaction);
    });
    
    return Object.entries(groups).sort(([dateA], [dateB]) => {
      const timeA = new Date(dateA).getTime();
      const timeB = new Date(dateB).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
  })();

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl mt-4">
      {/* Header with filters toggle */}
      <div className="p-4 flex justify-center items-center">
        <div className="flex flex-wrap items-center gap-2 justify-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showFilters 
                ? 'bg-[var(--accent-primary-20)] text-[var(--accent-primary)]'
                : 'bg-[var(--accent-primary-10)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary-20)]'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-gray-700 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="text-[var(--text-secondary)] text-sm">Start Date</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-[var(--text-secondary)] text-sm">End Date</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-[var(--text-secondary)] text-sm">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as 'ALL' | 'BUY' | 'SELL' })}
              className="w-full p-2 rounded bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)] mt-1"
            >
              <option value="ALL">All</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-[var(--text-secondary)] text-sm">Category</label>
            <Input
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              placeholder="e.g., Crypto"
              className="mt-1"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-[var(--text-secondary)] text-sm">Asset Type</label>
            <Input
              value={filters.assetType}
              onChange={(e) => setFilters({ ...filters, assetType: e.target.value })}
              placeholder="e.g., BTC"
              className="mt-1"
            />
          </div>
        </div>
      )}

      {/* Desktop view - Table */}
      <div className="hidden md:block p-4 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th
                className="p-2 text-left text-[var(--text-secondary)] font-medium cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => handleSort('date')}
              >
                Date <SortArrow columnKey="date" />
              </th>
              <th
                className="p-2 text-left text-[var(--text-secondary)] font-medium cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => handleSort('transaction_type')}
              >
                Type <SortArrow columnKey="transaction_type" />
              </th>
              <th
                className="p-2 text-left text-[var(--text-secondary)] font-medium cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => handleSort('category')}
              >
                Category <SortArrow columnKey="category" />
              </th>
              <th
                className="p-2 text-left text-[var(--text-secondary)] font-medium cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => handleSort('asset_type')}
              >
                Asset <SortArrow columnKey="asset_type" />
              </th>
              <th
                className="p-2 text-right text-[var(--text-secondary)] font-medium cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => handleSort('quantity')}
              >
                Quantity <SortArrow columnKey="quantity" />
              </th>
              <th
                className="p-2 text-right text-[var(--text-secondary)] font-medium cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => handleSort('price')}
              >
                Price <SortArrow columnKey="price" />
              </th>
              <th
                className="p-2 text-right text-[var(--text-secondary)] font-medium cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => handleSort('total')}
              >
                Total <SortArrow columnKey="total" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction) => (
              <tr key={transaction.id} className="border-b border-gray-700 hover:bg-[var(--bg-hover)]/50">
                <td className="p-2 text-[var(--text-primary)]">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className={`p-2 ${transaction.transaction_type === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                  {transaction.transaction_type}
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <CategoryIcon type={transaction.category} />
                    <span className="text-[var(--text-primary)]">{transaction.category}</span>
                  </div>
                </td>
                <td className="p-2 text-[var(--text-primary)]">{transaction.asset_type}</td>
                <td className="p-2 text-right text-[var(--text-primary)]">
                  {transaction.quantity.toLocaleString()}
                </td>
                <td className="p-2 text-right text-[var(--text-primary)]">
                  {formatCurrency(transaction.price, currency)}
                </td>
                <td className="p-2 text-right text-[var(--text-primary)]">
                  {formatCurrency(transaction.quantity * transaction.price, currency)}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[var(--text-secondary)]">
                  No transactions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile view - Date grouped transactions */}
      <div className="md:hidden p-4">
        {groupedTransactions.map(([dateStr, dateTransactions]) => (
          <div key={dateStr} className="mb-4">
            <div className="bg-[var(--bg-hover)]/50 px-3 py-2 rounded-t-lg">
              <h3 className="text-[var(--text-primary)] font-medium">{dateStr}</h3>
            </div>
            
            <div className="divide-y divide-gray-700">
              {dateTransactions.map(transaction => (
                <div key={transaction.id} className="p-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CategoryIcon type={transaction.category} className="h-5 w-5" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[var(--text-primary)] font-medium">{transaction.asset_type}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          transaction.transaction_type === 'BUY' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {transaction.transaction_type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="flex items-center justify-end text-[10px] text-[var(--text-secondary)]">Qty</div>
                      <div className="text-right text-[var(--text-primary)]">
                        {transaction.quantity.toLocaleString()}
                      </div>
                      <div className="flex items-center justify-end text-[10px] text-[var(--text-secondary)]">Total</div>
                      <div className="text-right text-[var(--text-primary)]">
                        {formatCurrency(transaction.quantity * transaction.price, currency)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {transactions.length === 0 && (
          <div className="p-8 text-center text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-lg">
            No transactions yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;