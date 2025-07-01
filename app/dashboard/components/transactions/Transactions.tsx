// app/dashboard/components/transactions/Transactions.tsx

"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Transaction } from "@/types";
import { useCurrencyStore } from "@/lib/stores/useCurrencyStore";
import { TransactionsList } from "@/components/Transactions";
import Filters from "@/components/Transactions/modals/Filters";
import { AddAsset } from "@/components/AddAsset";
import DeleteAll from "@/components/Transactions/modals/DeleteAll";
import { TransactionsHeader } from "@/components/Transactions/components/TransactionsHeader";
import { useTransactions } from "@/hooks/useTransactions";
import { useTransactionValidation } from "@/hooks/useTransactionValidation";
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

  // Use validation hook for transaction validation
  const {
    validateTransaction,
    validatePortfolioIntegrity,
    getOwnedAssets
  } = useTransactionValidation(transactions);
  
  // Handle adding a new transaction
  const handleAddTransaction = () => {
    setShowAddTransaction(true);
  };
  
  // Handle transaction submission from modal with validation
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
      // Validate transaction before submission
      const validation = validateTransaction(
        transaction.transaction_type,
        transaction.category,
        transaction.asset_type,
        transaction.quantity,
        transaction.price,
        transaction.date
      );

      if (!validation.isValid) {
        showNotification('error', validation.error || 'Invalid transaction');
        return;
      }

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
    const validType = type as 'csv' | 'xlsx' | 'json' | 'pdf';
    setExportType(validType);
    setShowExportModal(true);
  };
  
  // Handle import success with validation check
  const handleImportSuccess = async () => {
    // Refresh transactions after successful import
    if (selectedPortfolio) {
      await fetchTransactions(selectedPortfolio);
      
      // Check portfolio integrity after import
      const integrity = validatePortfolioIntegrity();
      if (!integrity.isValid) {
        showNotification('info', 
          `Transactions imported but some integrity issues were detected: ${integrity.errors.join(', ')}`
        );
      } else {
        showNotification('success', 'Transactions imported successfully');
      }
    }
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

  // Check portfolio integrity and show warning if needed
  const portfolioIntegrity = validatePortfolioIntegrity();

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

      {/* Portfolio integrity warning */}
      {!portfolioIntegrity.isValid && transactions.length > 0 && (
        <div className="mx-4 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
            <div className="text-sm text-red-400">
              <p className="font-medium">Portfolio Integrity Issues</p>
              <ul className="mt-1 space-y-1">
                {portfolioIntegrity.errors.slice(0, 3).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {portfolioIntegrity.errors.length > 3 && (
                  <li>• ...and {portfolioIntegrity.errors.length - 3} more issues</li>
                )}
              </ul>
              <p className="mt-2 text-xs">Some transactions violate chronological business rules. Consider reviewing your transaction history.</p>
            </div>
          </div>
        </div>
      )}

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
          onSort={handleSort}
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

      {/* Modals */}
      {showAddTransaction && (
        <AddAsset
          onClose={() => setShowAddTransaction(false)}
          onAddTransaction={handleTransactionSubmit}
          marketData={{
            metals: [],
            crypto: [],
            stocks: [],
            currencies: []
          }}
          portfolios={availablePortfolios}
          selectedPortfolioId={selectedPortfolio}
          transactions={transactions}
          title="Add New Transaction"
        />
      )}

      {deleteAllConfirm && (
        <DeleteAll
          onConfirm={confirmDeleteAll}
          onCancel={cancelDeleteAll}
          portfolioName={availablePortfolios.find(p => p.id === selectedPortfolio)?.name || 'Unknown'}
        />
      )}

      {showImportModal && importType && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false);
            setImportType(null);
          }}
          onSuccess={handleImportSuccess}
          onError={handleImportError}
          fileType={importType}
          portfolioId={selectedPortfolio || undefined}
        />
      )}

      {showExportModal && exportType !== null && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => {
            setShowExportModal(false);
            setExportType(null);
          }}
          onSuccess={handleExportSuccess}
          onError={handleExportError}
          fileType={exportType}
          transactions={filteredTransactions}
        />
      )}
    </div>
  );
};

export default Transactions;