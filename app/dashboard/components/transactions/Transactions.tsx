"use client";

import { useState, useEffect } from "react";
import { Transaction, Currency, Crypto, AssetCategory, Metal, Stock } from "@/types";
import { useCurrencyStore } from "@/lib/stores/useCurrencyStore";
import { TransactionsList, TransactionsHeader } from "@/components/Transactions";
import Filters from "@/components/modals/Filters";
import { AddAsset } from "@/components/modals/AddAsset";
import { createClient } from '@/lib/supabase/client';
import DeleteAll from "@/components/modals/DeleteAll";

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
  transactions: initialTransactions,
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
  
  // State for transactions and related operations
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [availablePortfolios, setAvailablePortfolios] = useState<{ id: string, name: string }[]>([]);
  const [currencyRates, setCurrencyRates] = useState<{
    currencies: Currency[] | null;
    crypto: Crypto[] | null;
    metals: Metal[] | null;
    stocks: Stock[] | null;
  }>({ currencies: null, crypto: null, metals: null, stocks: null });

  // State for Add Transaction modal
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  
  // Handle adding a new transaction
  const handleAddTransaction = () => {
    setShowAddTransaction(true);
  };
  
  // Function to add a transaction to the database
  const addTransaction = async (transaction: {
    transaction_type: 'BUY' | 'SELL'
    category: AssetCategory
    asset_type: string
    quantity: number
    price: number
    date: string
    portfolio_id: string
  }) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          portfolio_id: transaction.portfolio_id,
          transaction_type: transaction.transaction_type,
          category: transaction.category,
          asset_type: transaction.asset_type,
          quantity: transaction.quantity,
          price: transaction.price,
          date: transaction.date
        });
      
      if (error) throw error;
      
      // Refresh the transactions list
      fetchTransactions(transaction.portfolio_id);
      showNotification('success', 'Transaction added successfully');
      setShowAddTransaction(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get currency from store
  const { currency } = useCurrencyStore();
  const supabase = createClient();

  // Fetch available portfolios for filtering
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const { data: portfolios, error } = await supabase
          .from('portfolios')
          .select('id, name, is_default')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (portfolios && portfolios.length > 0) {
          setAvailablePortfolios(portfolios);
          
          // Set default portfolio if none selected
          if (!selectedPortfolio) {
            const defaultPortfolio = portfolios.find(p => p.is_default) || portfolios[0];
            setSelectedPortfolio(defaultPortfolio.id);
          }
        }
      } catch (error) {
        console.error('Error fetching portfolios:', error);
        showNotification('error', 'Failed to load portfolios');
      }
    };
    
    fetchPortfolios();
  }, [userId]);

  // Fetch transactions when filters change
  useEffect(() => {
    if (selectedPortfolio) {
      fetchTransactions(selectedPortfolio);
    }
  }, [selectedPortfolio, filters]);

  // Fetch current rates for currency conversion in exports and for market data
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const [{ data: metals }, { data: crypto }, { data: currencies }, { data: stocks }] = await Promise.all([
          supabase.from("metals").select("*").order("date", { ascending: false }),
          supabase.from("crypto").select("*").order("date", { ascending: false }),
          supabase.from("currencies").select("*").order("date", { ascending: false }),
          supabase.from("stocks").select("*").order("date", { ascending: false }),
        ]);

        setCurrencyRates({
          currencies: currencies || null,
          crypto: crypto || null,
          metals: metals || null,
          stocks: stocks || null
        });
      } catch (error) {
        console.error('Error fetching rates:', error);
      }
    };
    
    fetchRates();
  }, []);

  // Show a notification message
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    
    // Clear notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

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

  // Handle successful import
  const handleImportSuccess = () => {
    // Refresh the transactions list
    if (selectedPortfolio) {
      fetchTransactions(selectedPortfolio);
    }
  };

  // Fetch transactions for a portfolio
  const fetchTransactions = async (portfolioId: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('portfolio_id', portfolioId);
      
      // Handle date filtering
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters.type !== "ALL") {
        query = query.eq('transaction_type', filters.type);
      }
      if (filters.category) {
        query = query.ilike('category', `%${filters.category}%`);
      }
      if (filters.assetType) {
        query = query.ilike('asset_type', `%${filters.assetType}%`);
      }
      
      // Apply sorting
      if (sortKey === 'date') {
        query = query.order('date', { ascending: sortOrder === 'asc' });
      } else if (sortKey) {
        query = query.order(sortKey, { ascending: sortOrder === 'asc' });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showNotification('error', 'Failed to load transactions');
    } finally {
      setIsLoading(false);
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
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('portfolio_id', selectedPortfolio)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      showNotification('success', 'All transactions deleted successfully');
      setTransactions([]);
    } catch (error) {
      console.error('Error deleting transactions:', error);
      showNotification('error', 'Failed to delete transactions');
    } finally {
      setIsLoading(false);
      setDeleteAllConfirm(false);
    }
  };

  // Cancel delete all
  const cancelDeleteAll = () => {
    setDeleteAllConfirm(false);
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl mt-4">
      {/* Header with buttons - Now using TransactionsHeader component */}
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
        <div className="p-8 text-center text-[var(--text-secondary)]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-[var(--accent-primary)] mx-auto mb-4"></div>
          Loading transactions...
        </div>
      ) : (
        <TransactionsList
          transactions={sortedTransactions}
          sortKey={sortKey}
          sortOrder={sortOrder}
          handleSort={handleSort}
          currency={currency}
        />
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 rounded-lg px-4 py-2 shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
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
          onAddTransaction={addTransaction}
          marketData={{
            metals: currencyRates.metals || null,
            crypto: currencyRates.crypto || null,
            stocks: currencyRates.stocks || null,
            currencies: currencyRates.currencies || null
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