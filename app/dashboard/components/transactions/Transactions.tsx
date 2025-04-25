// app/dashboard/components/transactions/Transactions.tsx

"use client";

import React, { useState } from "react";
import { Transaction } from "@/types";
import { useCurrencyStore } from "@/lib/stores/useCurrencyStore";
import { FileDown, FileUp, Filter, Plus, Trash2 } from "lucide-react";
import { TransactionsList } from "./components/TransactionsList";
import { TransactionsFilters } from "./components/TransactionsFilters";

interface TransactionsProps {
  transactions: Transaction[];
  userId: string;
}

type SortKey =
  | "date"
  | "transaction_type"
  | "category"
  | "asset_type"
  | "quantity"
  | "price"
  | "total";
type SortOrder = "asc" | "desc";

const Transactions: React.FC<TransactionsProps> = ({
  transactions,
  userId,
}) => {
  // State for sorting and filtering
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "ALL",
    category: "",
    assetType: "",
  });

  // Get currency from store
  const { currency } = useCurrencyStore();

  // Handle sort column click
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
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
      (filters.type === "ALL" || tx.transaction_type === filters.type) &&
      (!filters.category ||
        tx.category.toLowerCase().includes(filters.category.toLowerCase())) &&
      (!filters.assetType ||
        tx.asset_type.toLowerCase().includes(filters.assetType.toLowerCase()))
    );
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;
    switch (sortKey) {
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case "transaction_type":
        comparison = a.transaction_type.localeCompare(b.transaction_type);
        break;
      case "category":
        comparison = a.category.localeCompare(b.category);
        break;
      case "asset_type":
        comparison = a.asset_type.localeCompare(b.asset_type);
        break;
      case "quantity":
        comparison = a.quantity - b.quantity;
        break;
      case "price":
        comparison = a.price - b.price;
        break;
      case "total":
        comparison = a.quantity * a.price - b.quantity * b.price;
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Handle importing transactions
  const handleImport = () => {
    alert("Import functionality to be implemented");
  };

  // Handle exporting transactions
  const handleExport = () => {
    alert("Export functionality to be implemented");
  };

  // Handle deleting all transactions
  const handleDeleteAll = () => {
    const confirmed = window.confirm("Are you sure you want to delete all transactions? This action cannot be undone.");
    if (confirmed) {
      alert("Delete all functionality to be implemented");
    }
  };

  // Handle adding a new transaction
  const handleAddTransaction = () => {
    alert("Add transaction functionality to be implemented");
  };

  // Button styles to match the 24H/7D buttons
  const baseButtonClass = "text-sm px-3 py-1.5 rounded-md transition-colors font-medium";
  const activeButtonClass = "bg-[var(--accent-primary-20)] text-[var(--accent-primary)]";
  const inactiveButtonClass = "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]";

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl mt-4">
      {/* Header with buttons */}
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
          
          <button
            onClick={handleImport}
            className={`${baseButtonClass} ${inactiveButtonClass} flex items-center gap-1.5`}
          >
            <FileUp className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Import</span>
          </button>
          
          <button
            onClick={handleExport}
            className={`${baseButtonClass} ${inactiveButtonClass} flex items-center gap-1.5`}
          >
            <FileDown className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Export</span>
          </button>
          
          <button
            onClick={handleDeleteAll}
            className={`${baseButtonClass} text-red-500 hover:bg-red-500/10 flex items-center gap-1.5`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Delete All</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <TransactionsFilters 
          filters={filters} 
          setFilters={setFilters} 
        />
      )}

      {/* Transactions List */}
      <TransactionsList
        transactions={sortedTransactions}
        sortKey={sortKey}
        sortOrder={sortOrder}
        handleSort={handleSort}
        currency={currency}
      />
    </div>
  );
};

export default Transactions;