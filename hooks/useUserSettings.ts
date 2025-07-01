// hooks/useUserSettings.ts
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { 
  CurrencyCode, 
  AssetCategory, 
  UserSettings, 
  LegacyWatchlistItem,
  ThemePreference,
  LayoutType,
  ActiveTabType 
} from '@/types'

const defaultSettings: UserSettings = {
  marketRatesShowMore: false,
  selectedPeriod: '24H',
  selectedCurrency: 'USD',
  watchlist: [],
  theme_preference: 'blue',
  layout: 'cards', 
  lastActiveTab: 'markets',
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
        
        // Format watchlist data to legacy format for UI compatibility
        const formattedWatchlist: LegacyWatchlistItem[] = watchlistData?.map(item => ({
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
          theme_preference: (profileData?.theme_preference as ThemePreference) || defaultSettings.theme_preference,
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
  
  // Function to save settings to the server
  const saveSettingsToServer = useCallback(async (updates: PendingUpdates) => {
    if (!userId) return
    
    try {
      const supabase = createClient()
      
      // Prepare profile updates (exclude watchlist)
      const profileUpdates: Record<string, any> = {}
      
      if (updates.selectedCurrency !== undefined) {
        profileUpdates.selected_currency = updates.selectedCurrency
      }
      if (updates.selectedPeriod !== undefined) {
        profileUpdates.selected_period = updates.selectedPeriod
      }
      if (updates.theme_preference !== undefined) {
        profileUpdates.theme_preference = updates.theme_preference
      }
      if (updates.lastActiveTab !== undefined) {
        profileUpdates.last_active_tab = updates.lastActiveTab
      }
      if (updates.marketRatesShowMore !== undefined) {
        profileUpdates.market_show_more = updates.marketRatesShowMore
      }
      if (updates.language !== undefined) {
        profileUpdates.language = updates.language
      }
      
      // Update profile if there are changes
      if (Object.keys(profileUpdates).length > 0) {
        profileUpdates.updated_at = new Date().toISOString()
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update(profileUpdates)
          .eq('id', userId)
        
        if (profileError) {
          console.error('Error updating user profile:', profileError)
        }
      }
      
      // Handle watchlist updates
      if (updates.watchlist !== undefined) {
        // Delete existing watchlist items
        const { error: deleteError } = await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', userId)
        
        if (deleteError) {
          console.error('Error deleting existing watchlist:', deleteError)
        } else if (updates.watchlist.length > 0) {
          // Insert new watchlist items
          const watchlistItems = updates.watchlist.map((item, index) => ({
            user_id: userId,
            category: item.category,
            symbol: item.symbol,
            order_index: index // Use index for order
          }))
          
          const { error: insertError } = await supabase
            .from('watchlist')
            .insert(watchlistItems)
          
          if (insertError) {
            console.error('Error inserting watchlist items:', insertError)
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
      
      // Format watchlist data to legacy format
      const formattedWatchlist: LegacyWatchlistItem[] = watchlistData?.map(item => ({
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
        theme_preference: (profileData?.theme_preference as ThemePreference) || defaultSettings.theme_preference,
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