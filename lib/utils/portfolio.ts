// lib/utils/portfolio.ts

import type { Portfolio, Transaction } from '@/types';

/**
 * Finds the default portfolio in the list or returns the first one if no default is marked
 * 
 * @param portfolios List of portfolio objects
 * @returns The default portfolio or the first one, or null if list is empty
 */
export function getDefaultPortfolio(portfolios: Portfolio[]): Portfolio | null {
  if (portfolios.length === 0) {
    return null
  }
  
  const defaultPortfolio = portfolios.find(p => p.is_default)
  return defaultPortfolio || portfolios[0]
}

/**
 * Calculate the value of an asset based on quantity and current price
 * 
 * @param quantity Amount of the asset owned
 * @param price Current price per unit
 * @returns Total value of the asset
 */
export function calculateAssetValue(quantity: number, price: number): number {
  return quantity * price
}

/**
 * Calculate profit/loss and percentage for an asset
 * 
 * @param currentValue Current total value of the asset
 * @param costBasis Total amount spent to acquire the asset
 * @returns Object containing profit/loss amount and percentage
 */
export function calculateProfitLoss(currentValue: number, costBasis: number): { 
  amount: number, 
  percentage: number 
} {
  const amount = currentValue - costBasis
  const percentage = costBasis ? (amount / costBasis) * 100 : 0
  
  return { amount, percentage }
}

/**
 * Calculate average purchase price for an asset
 * 
 * @param totalCost Total amount spent on purchases
 * @param totalQuantity Total quantity acquired
 * @returns Average purchase price per unit
 */
export function calculateAveragePurchasePrice(totalCost: number, totalQuantity: number): number {
  if (totalQuantity === 0) return 0
  return totalCost / totalQuantity
}

/**
 * Filter transactions by portfolio ID
 * 
 * @param transactions List of all transactions
 * @param portfolioId Portfolio ID to filter by
 * @returns Filtered transactions for the given portfolio
 */
export function getTransactionsByPortfolio(transactions: Transaction[], portfolioId: string): Transaction[] {
  return transactions.filter(t => t.portfolio_id === portfolioId)
}

/**
 * Update a user profile with the specified fields
 * 
 * @param userId User ID to update
 * @param updates Object containing fields to update
 * @returns Promise resolving to the updated profile data
 */
export async function updateUserProfile(userId: string, updates: Record<string, any>) {
  try {
    // Import the client dynamically to avoid circular dependencies
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient()
    
    console.log('User profile update:', { userId, updates })
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
    
    console.log('User profile update result:', data)
    return data
  } catch (error) {
    console.error('Failed to update user profile:', error)
    throw error
  }
}