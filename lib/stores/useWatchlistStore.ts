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
          
          // First, delete all existing watchlist items for this user
          const { error: deleteError } = await supabase
            .from('watchlist')
            .delete()
            .eq('user_id', user.id);
            
          if (deleteError) {
            console.error('Error deleting existing watchlist items:', deleteError);
            return;
          }
          
          // Then insert all current watchlist items
          if (get().watchlist.length > 0) {
            const watchlistData = get().watchlist.map((item, index) => ({
              user_id: user.id,
              category: item.category,
              symbol: item.symbol,
              order_index: index,
            }));
            
            const { error: insertError } = await supabase
              .from('watchlist')
              .insert(watchlistData);
              
            if (insertError) {
              console.error('Error inserting watchlist items:', insertError);
            } else {
              console.log('Watchlist updated successfully in database');
            }
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
          
          // Fetch all watchlist items for this user
          const { data, error } = await supabase
            .from('watchlist')
            .select('*')
            .eq('user_id', user.id)
            .order('order_index', { ascending: true });
          
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            // Convert database items to WatchlistItem format
            const watchlistItems: WatchlistItem[] = data.map(item => ({
              id: `${item.category}-${item.symbol}`,
              category: item.category as AssetCategory,
              symbol: item.symbol,
              order: item.order_index || 0,
            }));
            
            set({ watchlist: watchlistItems });
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