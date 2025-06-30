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
import { ImportModal } from "@/components/Transactions/modals/ImportModal";
import { ExportModal } from "@/components/Transactions/modals/ExportModal";

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
  
  // Import/Export modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importType, setImportType] = useState<'csv' | 'xlsx' | 'json' | null>(null);
  const [exportType, setExportType] = useState<'csv' | 'xlsx' | 'json' | 'pdf' | null>(null);
  
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
  
  // Handle import functionality
  const handleImport = (type: string) => {
    setImportType(type as 'csv' | 'xlsx' | 'json');
    setShowImportModal(true);
  };
  
  // Handle export functionality
  const handleExport = (type: string) => {
    setExportType(type as 'csv' | 'xlsx' | 'json' | 'pdf');
    setShowExportModal(true);
  };
  
  // Handle import success
  const handleImportSuccess = () => {
    // Refresh transactions after successful import
    if (selectedPortfolio) {
      fetchTransactions(selectedPortfolio);
    }
    showNotification('success', 'Transactions imported successfully');
    setShowImportModal(false);
    setImportType(null);
  };
  
  // Handle import error
  const handleImportError = (message: string) => {
    showNotification('error', message);
  };
  
  // Handle export success
  const handleExportSuccess = () => {
    showNotification('success', 'Transactions exported successfully');
    setShowExportModal(false);
    setExportType(null);
  };
  
  // Handle export error
  const handleExportError = (message: string) => {
    showNotification('error', message);
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
        handleImport={handleImport}
        handleExport={handleExport}
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
        <LoadingState />
      ) : (
        <TransactionsList
          transactions={filteredTransactions}
          sortKey={sortKey}
          sortOrder={sortOrder}
          handleSort={handleSort}
          currency={currency}
        />
      )}

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <AddAsset
          onClose={() => setShowAddTransaction(false)}
          onAddTransaction={handleTransactionSubmit}
          marketData={{
            metals: [],
            crypto: [],
            currencies: [],
            stocks: [],
          }}
          portfolios={availablePortfolios}
          selectedPortfolioId={selectedPortfolio}
          title="Add Transaction"
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false);
            setImportType(null);
          }}
          fileType={importType}
          portfolioId={selectedPortfolio || undefined}
          onSuccess={handleImportSuccess}
          onError={handleImportError}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => {
            setShowExportModal(false);
            setExportType(null);
          }}
          transactions={filteredTransactions}
          fileType={exportType}
          onSuccess={handleExportSuccess}
          onError={handleExportError}
        />
      )}

      {/* Delete All Confirmation Modal */}
      {deleteAllConfirm && (
        <DeleteAll
          onConfirm={confirmDeleteAll}
          onCancel={cancelDeleteAll}
          isLoading={isLoading}
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
    </div>
  );
};

export default Transactions;