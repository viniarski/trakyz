// hooks/useUserSettings.ts
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CurrencyCode, AssetCategory } from '@/types'

// Watchlist item type for easier reference
export type WatchlistItem = {
  id: string;
  category: AssetCategory;
  symbol: string;
  order: number;
}

// Layout and tab types
export type LayoutType = 'cards' | 'list' | 'detailed';
export type ActiveTabType = 'markets' | 'portfolios' | 'transactions' | 'debt' | 'analytics' | 'real-estate' | 'budget';

// UserSettings interface
export interface UserSettings {
  marketRatesShowMore: boolean;
  selectedPeriod: '24H' | '7D';
  selectedCurrency: CurrencyCode;
  watchlist: WatchlistItem[];
  theme_preference: 'blue' | 'dark' | 'light';
  layout: LayoutType;
  lastActiveTab: ActiveTabType;
  expandedPortfolioCategories?: AssetCategory[];
  language?: string;
  notifications?: string[];
}

const defaultSettings: UserSettings = {
  marketRatesShowMore: false,
  selectedPeriod: '24H',
  selectedCurrency: 'USD',
  watchlist: [],
  theme_preference: 'blue',
  layout: 'cards', 
  lastActiveTab: 'markets', // Changed from 'portfolio' to 'markets'
  expandedPortfolioCategories: []
}

// Create a type for pending updates - matches UserSettings but all properties are optional
type PendingUpdates = Partial<UserSettings>;

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Use our type for pending updates
  const pendingUpdatesRef = useRef<PendingUpdates>({});
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get the current user
  useEffect(() => {
    const supabase = createClient()
    
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      } else {
        setIsLoading(false)
      }
    }
    
    getUserId()
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUserId(session?.user?.id || null)
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  // Load settings from the database when userId changes
  useEffect(() => {
    const loadSettings = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        const supabase = createClient()
        
        // Get user profile data from Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (profileError) {
          console.error('Error loading user profile:', profileError)
          throw profileError
        }
        
        // Get watchlist data from Supabase
        const { data: watchlistData, error: watchlistError } = await supabase
          .from('watchlist')
          .select('*')
          .eq('user_id', userId)
          .order('order_index', { ascending: true })
        
        if (watchlistError) {
          console.error('Error loading watchlist:', watchlistError)
          throw watchlistError
        }
        
        // Format watchlist data
        const formattedWatchlist = watchlistData?.map(item => ({
          id: item.id,
          category: item.category as AssetCategory,
          symbol: item.symbol,
          order: item.order_index
        })) || []
        
        // Build complete settings object
        const userSettings: UserSettings = {
          ...defaultSettings,
          selectedCurrency: (profileData?.selected_currency as CurrencyCode) || defaultSettings.selectedCurrency,
          selectedPeriod: (profileData?.selected_period as '24H' | '7D') || defaultSettings.selectedPeriod,
          theme_preference: (profileData?.theme_preference as 'blue' | 'dark' | 'light') || defaultSettings.theme_preference,
          lastActiveTab: (profileData?.last_active_tab as ActiveTabType) || defaultSettings.lastActiveTab,
          marketRatesShowMore: profileData?.market_show_more || defaultSettings.marketRatesShowMore,
          language: profileData?.language || 'en',
          watchlist: formattedWatchlist
        }
        
        setSettings(userSettings)
      } catch (err) {
        console.error('Error loading settings:', err)
        // Fall back to default settings
        setSettings(defaultSettings)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSettings()
  }, [userId])
  
  // Function to save settings to Supabase
  const saveSettingsToServer = useCallback(async (updates: PendingUpdates) => {
    if (!userId) return
    
    try {
      const supabase = createClient()
      
      // Update user_profiles table
      const profileUpdates: any = {}
      
      // Map settings to DB column names
      if (updates.selectedCurrency !== undefined) profileUpdates.selected_currency = updates.selectedCurrency
      if (updates.selectedPeriod !== undefined) profileUpdates.selected_period = updates.selectedPeriod
      if (updates.theme_preference !== undefined) profileUpdates.theme_preference = updates.theme_preference
      if (updates.lastActiveTab !== undefined) profileUpdates.last_active_tab = updates.lastActiveTab
      if (updates.marketRatesShowMore !== undefined) profileUpdates.market_show_more = updates.marketRatesShowMore
      if (updates.language !== undefined) profileUpdates.language = updates.language
      
      // Only update if we have profile changes
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update(profileUpdates)
          .eq('id', userId)
        
        if (profileError) {
          console.error('Error updating user profile:', profileError)
        }
      }
      
      // Update watchlist if it's changed
      if (updates.watchlist) {
        // Get current watchlist from DB for comparison
        const { data: currentWatchlist, error: fetchError } = await supabase
          .from('watchlist')
          .select('*')
          .eq('user_id', userId)
        
        if (fetchError) {
          console.error('Error fetching current watchlist:', fetchError)
          return
        }
        
        // Identify items to add, update, or delete
        const existingItemIds = new Set(currentWatchlist?.map(item => item.id) || [])
        const newItemIds = new Set(updates.watchlist.map(item => item.id))
        
        // Items to add or update
        const upsertItems = updates.watchlist.map(item => ({
          id: item.id,
          user_id: userId,
          category: item.category,
          symbol: item.symbol,
          order_index: item.order
        }))
        
        // Items to delete (in current DB but not in new list)
        const idsToDelete = currentWatchlist?.filter(item => !newItemIds.has(item.id)).map(item => item.id) || []
        
        // Perform operations if needed
        if (upsertItems.length > 0) {
          const { error: upsertError } = await supabase
            .from('watchlist')
            .upsert(upsertItems)
          
          if (upsertError) {
            console.error('Error updating watchlist items:', upsertError)
          }
        }
        
        if (idsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('watchlist')
            .delete()
            .in('id', idsToDelete)
          
          if (deleteError) {
            console.error('Error deleting watchlist items:', deleteError)
          }
        }
      }
      
      console.log('Settings saved successfully')
    } catch (err) {
      console.error('Error updating settings:', err)
    }
  }, [userId])
  
  // Debounced update function
  const debouncedUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    
    updateTimeoutRef.current = setTimeout(async () => {
      // Get all pending updates
      const updates = pendingUpdatesRef.current
      
      // Clear pending updates
      pendingUpdatesRef.current = {}
      
      // Send to server
      await saveSettingsToServer(updates)
    }, 500) // 500ms debounce delay
  }, [saveSettingsToServer])
  
  // Function to update settings
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    // Immediately update local state for responsive UI
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }))
    
    // Queue for server update
    pendingUpdatesRef.current = {
      ...pendingUpdatesRef.current,
      ...newSettings
    }
    
    // Trigger debounced update
    debouncedUpdate()
  }, [debouncedUpdate])
  
  // Initialize settings from database (for external components)
  const initializeFromDatabase = useCallback(async () => {
    if (!userId) return
    
    try {
      setIsLoading(true)
      const supabase = createClient()
      
      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (profileError) throw profileError
      
      // Get watchlist data
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: true })
      
      if (watchlistError) throw watchlistError
      
      // Format watchlist data
      const formattedWatchlist = watchlistData?.map(item => ({
        id: item.id,
        category: item.category as AssetCategory,
        symbol: item.symbol,
        order: item.order_index
      })) || []
      
      // Build complete settings object
      const userSettings: UserSettings = {
        ...defaultSettings,
        selectedCurrency: (profileData?.selected_currency as CurrencyCode) || defaultSettings.selectedCurrency,
        selectedPeriod: (profileData?.selected_period as '24H' | '7D') || defaultSettings.selectedPeriod,
        theme_preference: (profileData?.theme_preference as 'blue' | 'dark' | 'light') || defaultSettings.theme_preference,
        lastActiveTab: (profileData?.last_active_tab as ActiveTabType) || defaultSettings.lastActiveTab,
        marketRatesShowMore: profileData?.market_show_more || defaultSettings.marketRatesShowMore,
        language: profileData?.language || 'en',
        watchlist: formattedWatchlist
      }
      
      setSettings(userSettings)
    } catch (err) {
      console.error('Error initializing settings:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])
  
  return {
    settings,
    updateSettings,
    initializeFromDatabase,
    isLoading
  }
}