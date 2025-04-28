// app/dashboard/components/transactions/Transactions.tsx

"use client";

import { useState } from "react";
import { Transaction } from "@/types";
import { useCurrencyStore } from "@/lib/stores/useCurrencyStore";
import { TransactionsList } from "@/components/Transactions";
import Filters from "@/components/Transactions/modals/Filters";
import { AddAsset } from "@/components/AddAsset";
import DeleteAll from "@/components/Transactions/modals/DeleteAll";
import { TransactionsHeader } from "@/components/Transactions/components/TransactionsHeader";
import { useTransactions } from "@/hooks/useTransactions";
import { Notification, useNotification } from "@/components/ui/Notification";
import { LoadingState } from "@/components/ui/LoadingState";

interface TransactionsProps {
  transactions: Transaction[];
  userId: string;
}

const Transactions: React.FC<TransactionsProps> = ({
  transactions: initialTransactions,
  userId,
}) => {
  // Get currency from store
  const { currency } = useCurrencyStore();
  
  // Use the notifications hook
  const { notification, showNotification, clearNotification } = useNotification();
  
  // State for UI elements
  const [showFilters, setShowFilters] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  
  // Use the transactions hook for data fetching and management
  const {
    transactions,
    isLoading,
    sortKey,
    sortOrder,
    filters,
    selectedPortfolio,
    availablePortfolios,
    filteredTransactions,
    setFilters,
    handleSort,
    setSelectedPortfolio,
    addTransaction,
    deleteAllTransactions,
    fetchTransactions
  } = useTransactions(userId, initialTransactions);
  
  // Fetch market data for currency conversion (simplified for this example)
  const [currencyRates, setCurrencyRates] = useState({
    currencies: null,
    crypto: null,
    metals: null,
    stocks: null
  });
  
  // Handle adding a new transaction
  const handleAddTransaction = () => {
    setShowAddTransaction(true);
  };
  
  // Handle transaction submission from modal
  const handleTransactionSubmit = async (transaction: {
    transaction_type: 'BUY' | 'SELL';
    category: any;
    asset_type: string;
    quantity: number;
    price: number;
    date: string;
    portfolio_id: string;
  }) => {
    try {
      await addTransaction(transaction);
      showNotification('success', 'Transaction added successfully');
      setShowAddTransaction(false);
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to add transaction');
    }
  };
  
  // Handle successful import
  const handleImportSuccess = () => {
    // Refresh the transactions list
    if (selectedPortfolio) {
      fetchTransactions(selectedPortfolio);
    }
  };

  // Handle deleting all transactions
  const handleDeleteAll = () => {
    setDeleteAllConfirm(true);
  };

  // Confirm delete all transactions
  const confirmDeleteAll = async () => {
    if (!selectedPortfolio) {
      showNotification('error', 'No portfolio selected');
      setDeleteAllConfirm(false);
      return;
    }
    
    try {
      await deleteAllTransactions(selectedPortfolio);
      showNotification('success', 'All transactions deleted successfully');
    } catch (error) {
      showNotification('error', 'Failed to delete transactions');
    } finally {
      setDeleteAllConfirm(false);
    }
  };

  // Cancel delete all
  const cancelDeleteAll = () => {
    setDeleteAllConfirm(false);
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl mt-4">
      {/* Header with buttons */}
      <TransactionsHeader 
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        portfolios={availablePortfolios}
        selectedPortfolio={selectedPortfolio}
        setSelectedPortfolio={setSelectedPortfolio}
        handleAddTransaction={handleAddTransaction}
        handleDeleteAll={handleDeleteAll}
        handleImportSuccess={handleImportSuccess}
        showNotification={showNotification}
        currency={currency}
        transactions={transactions}
      />

      {/* Filters */}
      <Filters 
        filters={filters} 
        setFilters={setFilters} 
        showFilters={showFilters}
      />

      {/* Transactions List */}
      {isLoading ? (
        <LoadingState message="Loading transactions..." />
      ) : (
        <TransactionsList
          transactions={filteredTransactions}
          sortKey={sortKey}
          sortOrder={sortOrder}
          handleSort={handleSort}
          currency={currency}
        />
      )}

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={clearNotification}
        />
      )}

      {/* Delete All Confirmation Modal */}
      {deleteAllConfirm && (
        <DeleteAll
          isLoading={isLoading}
          onConfirm={confirmDeleteAll}
          onCancel={cancelDeleteAll}
        />
      )}
      
      {/* Add Transaction - AddAsset Modal */}
      {showAddTransaction && (
        <AddAsset
          onClose={() => setShowAddTransaction(false)}
          onAddTransaction={handleTransactionSubmit}
          marketData={{
            metals: currencyRates.metals,
            crypto: currencyRates.crypto,
            stocks: currencyRates.stocks,
            currencies: currencyRates.currencies
          }}
          portfolios={availablePortfolios}
          selectedPortfolioId={selectedPortfolio}
          title="Add Transaction"
        />
      )}
    </div>
  );
};

export default Transactions;