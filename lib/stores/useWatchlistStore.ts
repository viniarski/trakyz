// lib/stores/useWatchlistStore.ts

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import { AssetCategory } from '@/types';

export type WatchlistItem = {
  id: string;
  category: AssetCategory;
  symbol: string;
  order: number;
};

interface WatchlistState {
  watchlist: WatchlistItem[];
  addToWatchlist: (category: AssetCategory, symbol: string) => void;
  removeFromWatchlist: (id: string) => void;
  toggleWatchlistItem: (category: AssetCategory, symbol: string) => void;
  syncWithDatabase: () => Promise<void>;
  initializeFromDatabase: () => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      
      addToWatchlist: (category: AssetCategory, symbol: string) => {
        const newItem: WatchlistItem = {
          id: `${category}-${symbol}`,
          category,
          symbol,
          order: get().watchlist.length,
        };
        
        set((state) => ({
          watchlist: [...state.watchlist, newItem]
        }));
        
        get().syncWithDatabase().catch(err => {
          console.error('Failed to sync watchlist with database:', err.message || err);
        });
      },
      
      removeFromWatchlist: (id: string) => {
        set((state) => ({
          watchlist: state.watchlist.filter(item => item.id !== id)
        }));
        
        get().syncWithDatabase().catch(err => {
          console.error('Failed to sync watchlist with database:', err.message || err);
        });
      },
      
      toggleWatchlistItem: (category: AssetCategory, symbol: string) => {
        const id = `${category}-${symbol}`;
        const existingItem = get().watchlist.find(item => item.id === id);
        
        if (existingItem) {
          get().removeFromWatchlist(id);
        } else {
          get().addToWatchlist(category, symbol);
        }
      },
      
      syncWithDatabase: async () => {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            console.log('No user found, skipping database update');
            return;
          }
          
          console.log(`Updating user ${user.id} watchlist`);
          
          // Update the user_profiles table with the watchlist
          const { error } = await supabase
            .from('user_profiles')
            .update({ 
              watchlist: get().watchlist,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
          
          if (error) {
            console.error('Database update error:', JSON.stringify(error));
          } else {
            console.log('Watchlist updated successfully in database');
          }
        } catch (error: any) {
          console.error('Error syncing watchlist with database:', 
            error.message || 'Unknown error', 
            JSON.stringify(error, null, 2)
          );
        }
      },
      
      initializeFromDatabase: async () => {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            return;
          }
          
          const { data, error } = await supabase
            .from('user_profiles')
            .select('watchlist')
            .eq('id', user.id)
            .single();
          
          if (error) {
            if (error.code !== 'PGRST116') {
              throw error;
            }
            return;
          }
          
          if (data?.watchlist && Array.isArray(data.watchlist)) {
            set({ watchlist: data.watchlist });
          }
        } catch (error: any) {
          console.error('Error initializing watchlist from database:', error.message || error);
        }
      },
    }),
    {
      name: 'watchlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);