// hooks/use-user-settings.ts

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AssetCategory } from '@/types';

type WatchlistItem = {
  id: string;
  category: AssetCategory;
  symbol: string;
  order: number;
};

export type UserSettings = {
  selectedPeriod?: '24H' | '7D';
  marketRatesShowMore?: boolean;
  watchlist?: WatchlistItem[];
  [key: string]: any;
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Fetch user profile which contains settings
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        // Extract and normalize settings
        const userSettings: UserSettings = {
          selectedPeriod: data.selected_period || '24H',
          marketRatesShowMore: data.market_show_more || false,
          watchlist: Array.isArray(data.watchlist) ? data.watchlist : [],
        };

        setSettings(userSettings);
      } catch (err) {
        console.error('Error loading user settings:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [supabase]);

  async function updateSettings(newSettings: Partial<UserSettings>) {
    if (!settings) return;

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare updates
      const updates: Record<string, any> = {};
      
      // Map settings to database fields
      if (newSettings.selectedPeriod) {
        updates.selected_period = newSettings.selectedPeriod;
      }
      
      if (newSettings.marketRatesShowMore !== undefined) {
        updates.market_show_more = newSettings.marketRatesShowMore;
      }
      
      if (newSettings.watchlist) {
        updates.watchlist = newSettings.watchlist;
      }

      // Update in database
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setSettings(prev => ({
        ...prev!,
        ...newSettings
      }));
    } catch (err) {
      console.error('Error updating user settings:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    settings,
    isLoading,
    error,
    updateSettings
  };
}