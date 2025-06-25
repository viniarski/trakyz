// hooks/useTransactions.ts

import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/types';
import { createClient } from '@/lib/supabase/client';

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
      return data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortKey, sortOrder, supabase, userId]);

  // Handle sort column click
  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  }, [sortKey, sortOrder]);

  // Add a transaction
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
  }, [fetchTransactions, selectedPortfolio, supabase, userId]);

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
    return [...filteredTransactions].sort((a, b) => {
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
  }, [transactions, sortKey, sortOrder, filters]);

  // Fetch portfolios on initial load
  useEffect(() => {
    fetchPortfolios().catch(error => {
      console.error('Failed to fetch portfolios:', error);
    });
  }, [fetchPortfolios]);

  // Fetch transactions when selected portfolio or filters change
  useEffect(() => {
    if (selectedPortfolio) {
      fetchTransactions(selectedPortfolio).catch(error => {
        console.error('Failed to fetch transactions:', error);
      });
    }
  }, [selectedPortfolio, fetchTransactions]);

  return {
    // State
    transactions,
    isLoading,
    sortKey,
    sortOrder,
    filters,
    selectedPortfolio,
    availablePortfolios,
    
    // Derived state
    filteredTransactions: getFilteredAndSortedTransactions(),
    
    // Actions
    setFilters,
    setSortKey,
    setSortOrder,
    setSelectedPortfolio,
    handleSort,
    fetchPortfolios,
    fetchTransactions,
    addTransaction,
    deleteAllTransactions,
  };
}