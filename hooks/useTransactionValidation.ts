// hooks/useTransactionValidation.ts

import { useState, useCallback } from 'react';
import { Transaction, AssetCategory } from '@/types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  availableQuantity?: number;
  firstPurchaseDate?: string;
}

export interface AssetHolding {
  category: AssetCategory;
  asset_type: string;
  quantity: number;
  firstPurchaseDate: string;
  lastTransactionDate: string;
}

export function useTransactionValidation(transactions: Transaction[]) {
  
  // Get available quantity for an asset at a specific date
  const getAvailableQuantityAtDate = useCallback((
    category: AssetCategory,
    assetType: string,
    date: string,
    excludeTransactionId?: string
  ): number => {
    const targetDate = new Date(date);
    
    // Get all transactions for this asset up to the target date
    const relevantTransactions = transactions.filter(
      t => t.category === category && 
           t.asset_type === assetType && 
           new Date(t.date) <= targetDate &&
           t.id !== excludeTransactionId // Exclude current transaction when editing
    );
    
    // Sort by date to ensure chronological processing
    const sortedTransactions = relevantTransactions.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let quantity = 0;
    
    for (const transaction of sortedTransactions) {
      if (transaction.transaction_type === 'BUY') {
        quantity += transaction.quantity;
      } else if (transaction.transaction_type === 'SELL') {
        quantity -= transaction.quantity;
      }
    }
    
    return Math.max(0, quantity); // Never return negative
  }, [transactions]);

  // Get first purchase date for an asset
  const getFirstPurchaseDate = useCallback((
    category: AssetCategory,
    assetType: string
  ): string | null => {
    const buyTransactions = transactions.filter(
      t => t.category === category && 
           t.asset_type === assetType && 
           t.transaction_type === 'BUY'
    );
    
    if (buyTransactions.length === 0) return null;
    
    const sortedBuys = buyTransactions.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sortedBuys[0].date;
  }, [transactions]);

  // Get all assets that user currently owns (positive quantity)
  const getOwnedAssets = useCallback((): AssetHolding[] => {
    const assetMap = new Map<string, AssetHolding>();
    
    // Group transactions by asset
    for (const transaction of transactions) {
      const key = `${transaction.category}-${transaction.asset_type}`;
      
      if (!assetMap.has(key)) {
        assetMap.set(key, {
          category: transaction.category,
          asset_type: transaction.asset_type,
          quantity: 0,
          firstPurchaseDate: '',
          lastTransactionDate: transaction.date
        });
      }
      
      const asset = assetMap.get(key)!;
      
      // Update quantity
      if (transaction.transaction_type === 'BUY') {
        asset.quantity += transaction.quantity;
      } else {
        asset.quantity -= transaction.quantity;
      }
      
      // Update dates
      if (transaction.transaction_type === 'BUY' && 
          (!asset.firstPurchaseDate || new Date(transaction.date) < new Date(asset.firstPurchaseDate))) {
        asset.firstPurchaseDate = transaction.date;
      }
      
      if (new Date(transaction.date) > new Date(asset.lastTransactionDate)) {
        asset.lastTransactionDate = transaction.date;
      }
    }
    
    // Return only assets with positive quantity
    return Array.from(assetMap.values()).filter(asset => asset.quantity > 0);
  }, [transactions]);

  // Validate a BUY transaction
  const validateBuyTransaction = useCallback((
    category: AssetCategory,
    assetType: string,
    quantity: number,
    price: number,
    date: string
  ): ValidationResult => {
    // Basic validations
    if (quantity <= 0) {
      return { isValid: false, error: 'Quantity must be greater than 0' };
    }
    
    if (price < 0) {
      return { isValid: false, error: 'Price cannot be negative' };
    }
    
    if (!date) {
      return { isValid: false, error: 'Date is required' };
    }
    
    // Check if date is not in the future
    const transactionDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (transactionDate > today) {
      return { isValid: false, error: 'Transaction date cannot be in the future' };
    }
    
    // BUY transactions are generally always valid
    return { isValid: true };
  }, []);

  // Validate a SELL transaction
  const validateSellTransaction = useCallback((
    category: AssetCategory,
    assetType: string,
    quantity: number,
    price: number,
    date: string,
    excludeTransactionId?: string
  ): ValidationResult => {
    // Basic validations first
    const basicValidation = validateBuyTransaction(category, assetType, quantity, price, date);
    if (!basicValidation.isValid) {
      return basicValidation;
    }
    
    // Check if user has ever bought this asset
    const firstPurchaseDate = getFirstPurchaseDate(category, assetType);
    if (!firstPurchaseDate) {
      return { 
        isValid: false, 
        error: `You cannot sell ${assetType} because you have never purchased it. Please buy this asset first.` 
      };
    }
    
    // Check if sell date is after first purchase date
    const sellDate = new Date(date);
    const purchaseDate = new Date(firstPurchaseDate);
    
    if (sellDate < purchaseDate) {
      return { 
        isValid: false, 
        error: `You cannot sell ${assetType} on ${date} because your first purchase was on ${firstPurchaseDate}. Sell date must be after your first purchase.` 
      };
    }
    
    // Check available quantity at the transaction date
    const availableQuantity = getAvailableQuantityAtDate(category, assetType, date, excludeTransactionId);
    
    if (quantity > availableQuantity) {
      return { 
        isValid: false, 
        error: `Insufficient quantity. You can sell up to ${availableQuantity.toFixed(8)} ${assetType} on ${date}.`,
        availableQuantity,
        firstPurchaseDate
      };
    }
    
    return { 
      isValid: true, 
      availableQuantity,
      firstPurchaseDate 
    };
  }, [getFirstPurchaseDate, getAvailableQuantityAtDate, validateBuyTransaction]);

  // Validate any transaction
  const validateTransaction = useCallback((
    transactionType: 'BUY' | 'SELL',
    category: AssetCategory,
    assetType: string,
    quantity: number,
    price: number,
    date: string,
    excludeTransactionId?: string
  ): ValidationResult => {
    if (transactionType === 'BUY') {
      return validateBuyTransaction(category, assetType, quantity, price, date);
    } else {
      return validateSellTransaction(category, assetType, quantity, price, date, excludeTransactionId);
    }
  }, [validateBuyTransaction, validateSellTransaction]);

  // Check if editing a transaction would cause validation issues
  const validateTransactionEdit = useCallback((
    originalTransaction: Transaction,
    newTransactionType: 'BUY' | 'SELL',
    newCategory: AssetCategory,
    newAssetType: string,
    newQuantity: number,
    newPrice: number,
    newDate: string
  ): ValidationResult => {
    return validateTransaction(
      newTransactionType,
      newCategory,
      newAssetType,
      newQuantity,
      newPrice,
      newDate,
      originalTransaction.id
    );
  }, [validateTransaction]);

  // Get portfolio balance validation (check for any negative balances)
  const validatePortfolioIntegrity = useCallback((): {
    isValid: boolean;
    errors: string[];
    negativeAssets: Array<{
      category: AssetCategory;
      asset_type: string;
      quantity: number;
    }>;
  } => {
    const assetMap = new Map<string, { category: AssetCategory; asset_type: string; quantity: number }>();
    
    // Process all transactions chronologically
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    for (const transaction of sortedTransactions) {
      const key = `${transaction.category}-${transaction.asset_type}`;
      
      if (!assetMap.has(key)) {
        assetMap.set(key, {
          category: transaction.category,
          asset_type: transaction.asset_type,
          quantity: 0
        });
      }
      
      const asset = assetMap.get(key)!;
      
      if (transaction.transaction_type === 'BUY') {
        asset.quantity += transaction.quantity;
      } else {
        asset.quantity -= transaction.quantity;
      }
    }
    
    const negativeAssets = Array.from(assetMap.values()).filter(asset => asset.quantity < 0);
    const errors = negativeAssets.map(asset => 
      `Negative balance: ${asset.quantity.toFixed(8)} ${asset.asset_type}`
    );
    
    return {
      isValid: negativeAssets.length === 0,
      errors,
      negativeAssets
    };
  }, [transactions]);

  return {
    validateTransaction,
    validateBuyTransaction,
    validateSellTransaction,
    validateTransactionEdit,
    validatePortfolioIntegrity,
    getAvailableQuantityAtDate,
    getFirstPurchaseDate,
    getOwnedAssets
  };
}