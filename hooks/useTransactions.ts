// hooks/useTransactions.ts

import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useTransactionValidation } from './useTransactionValidation';

type SortKey = 
  | "date"
  | "transaction_type"
  | "category"
  | "asset_type"
  | "quantity"
  | "price"
  | "total";

type SortOrder = "asc" | "desc";

type FilterState = {
  startDate: string;
  endDate: string;
  type: string;
  category: string;
  assetType: string;
};

export function useTransactions(
  userId: string,
  initialTransactions: Transaction[] = []
) {
  const supabase = createClient();
  
  // State for transactions
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    startDate: "",
    endDate: "",
    type: "ALL",
    category: "",
    assetType: "",
  });
  
  // Portfolio state
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [availablePortfolios, setAvailablePortfolios] = useState<{ id: string, name: string }[]>([]);

  // Use validation hook
  const { validateTransaction } = useTransactionValidation(transactions);
  
  // Fetch available portfolios for filtering
  const fetchPortfolios = useCallback(async () => {
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
      
      return portfolios;
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      throw error;
    }
  }, [userId, selectedPortfolio, supabase]);

  // Fetch transactions for a portfolio
  const fetchTransactions = useCallback(async (portfolioId: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('portfolio_id', portfolioId);
      
      // Handle date filters
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }
      
      // Handle type filter
      if (filters.type && filters.type !== 'ALL') {
        query = query.eq('transaction_type', filters.type);
      }
      
      // Handle category filter
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      // Handle asset type filter
      if (filters.assetType) {
        query = query.eq('asset_type', filters.assetType);
      }
      
      // Apply sorting
      const isAscending = sortOrder === 'asc';
      if (sortKey === 'total') {
        // For total, we need to sort by calculated value (quantity * price)
        query = query.order('quantity', { ascending: isAscending })
                    .order('price', { ascending: isAscending });
      } else {
        query = query.order(sortKey, { ascending: isAscending });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setTransactions(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId, filters, sortKey, sortOrder, supabase]);

  // Handle sorting
  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  }, [sortKey, sortOrder]);

  // Add a transaction with validation
  const addTransaction = useCallback(async (transaction: {
    transaction_type: 'BUY' | 'SELL';
    category: string;
    asset_type: string;
    quantity: number;
    price: number;
    date: string;
    portfolio_id: string;
  }) => {
    try {
      setIsLoading(true);
      
      // Validate transaction before adding
      const validation = validateTransaction(
        transaction.transaction_type,
        transaction.category as any,
        transaction.asset_type,
        transaction.quantity,
        transaction.price,
        transaction.date
      );

      if (!validation.isValid) {
        throw new Error(validation.error || 'Transaction validation failed');
      }

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
      if (transaction.portfolio_id === selectedPortfolio) {
        await fetchTransactions(transaction.portfolio_id);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions, selectedPortfolio, supabase, userId, validateTransaction]);

  // Update an existing transaction with validation
  const updateTransaction = useCallback(async (
    transactionId: string,
    updates: {
      transaction_type?: 'BUY' | 'SELL';
      category?: string;
      asset_type?: string;
      quantity?: number;
      price?: number;
      date?: string;
    }
  ) => {
    try {
      setIsLoading(true);

      // Get the original transaction
      const originalTransaction = transactions.find(t => t.id === transactionId);
      if (!originalTransaction) {
        throw new Error('Transaction not found');
      }

      // Create the updated transaction object
      const updatedTransaction = {
        ...originalTransaction,
        ...updates
      };

      // Validate the updated transaction
      const validation = validateTransaction(
        updatedTransaction.transaction_type,
        updatedTransaction.category as any,
        updatedTransaction.asset_type,
        updatedTransaction.quantity,
        updatedTransaction.price,
        updatedTransaction.date
      );

      if (!validation.isValid) {
        throw new Error(validation.error || 'Transaction validation failed');
      }

      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Refresh the transactions list
      if (selectedPortfolio) {
        await fetchTransactions(selectedPortfolio);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [transactions, validateTransaction, supabase, userId, selectedPortfolio, fetchTransactions]);

  // Delete a transaction
  const deleteTransaction = useCallback(async (transactionId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Refresh the transactions list
      if (selectedPortfolio) {
        await fetchTransactions(selectedPortfolio);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, userId, selectedPortfolio, fetchTransactions]);

  // Delete all transactions for a portfolio
  const deleteAllTransactions = useCallback(async (portfolioId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('portfolio_id', portfolioId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      setTransactions([]);
      return true;
    } catch (error) {
      console.error('Error deleting transactions:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, userId]);

  // Apply filters to get filtered and sorted transactions
  const getFilteredAndSortedTransactions = useCallback(() => {
    const filteredTransactions = transactions.filter((tx) => {
      const date = new Date(tx.date);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      // Date filters
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;

      // Type filter
      if (filters.type && filters.type !== "ALL" && tx.transaction_type !== filters.type) {
        return false;
      }

      // Category filter
      if (filters.category && tx.category !== filters.category) {
        return false;
      }

      // Asset type filter
      if (filters.assetType && tx.asset_type !== filters.assetType) {
        return false;
      }

      return true;
    });

    // Apply sorting
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortKey) {
        case "date":
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case "total":
          aValue = a.quantity * a.price;
          bValue = b.quantity * b.price;
          break;
        case "quantity":
        case "price":
          aValue = a[sortKey];
          bValue = b[sortKey];
          break;
        default:
          aValue = a[sortKey];
          bValue = b[sortKey];
          break;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sortedTransactions;
  }, [transactions, filters, sortKey, sortOrder]);

  // Get filtered transactions
  const filteredTransactions = getFilteredAndSortedTransactions();

  // Fetch portfolios on mount
  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // Fetch transactions when portfolio changes
  useEffect(() => {
    if (selectedPortfolio) {
      fetchTransactions(selectedPortfolio);
    }
  }, [selectedPortfolio, fetchTransactions]);

  return {
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
    updateTransaction,
    deleteTransaction,
    deleteAllTransactions,
    fetchTransactions,
    fetchPortfolios
  };
}