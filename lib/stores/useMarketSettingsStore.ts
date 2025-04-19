// lib/stores/useMarketSettingsStore.ts

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';

type Period = '24H' | '7D';

interface MarketSettingsState {
  selectedPeriod: Period;
  showMore: boolean;
  setSelectedPeriod: (period: Period) => void;
  setShowMore: (show: boolean) => void;
  syncWithDatabase: () => Promise<void>;
  initializeFromDatabase: () => Promise<void>;
}

export const useMarketSettingsStore = create<MarketSettingsState>()(
  persist(
    (set, get) => ({
      selectedPeriod: '24H',
      showMore: false,
      
      setSelectedPeriod: (period: Period) => {
        set({ selectedPeriod: period });
        get().syncWithDatabase().catch(err => {
          console.error('Failed to sync period with database:', err.message || err);
        });
      },
      
      setShowMore: (show: boolean) => {
        set({ showMore: show });
        get().syncWithDatabase().catch(err => {
          console.error('Failed to sync show more with database:', err.message || err);
        });
      },
      
      syncWithDatabase: async () => {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            console.log('No user found, skipping database update');
            return;
          }
          
          console.log(`Updating user ${user.id} market settings`);
          
          // Update the user profile with both settings
          const { error } = await supabase
            .from('user_profiles')
            .update({ 
              selected_period: get().selectedPeriod,
              market_show_more: get().showMore,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
          
          if (error) {
            console.error('Database update error:', JSON.stringify(error));
          } else {
            console.log('Market settings updated successfully in database');
          }
        } catch (error: any) {
          console.error('Error syncing market settings with database:', 
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
            .select('selected_period, market_show_more')
            .eq('id', user.id)
            .single();
          
          if (error) {
            if (error.code !== 'PGRST116') {
              throw error;
            }
            return;
          }
          
          // Update the local state with database values
          const updates: Partial<MarketSettingsState> = {};
          
          if (data?.selected_period && (data.selected_period === '24H' || data.selected_period === '7D')) {
            updates.selectedPeriod = data.selected_period;
          }
          
          if (data?.market_show_more !== undefined) {
            updates.showMore = data.market_show_more;
          }
          
          if (Object.keys(updates).length > 0) {
            set(updates);
          }
        } catch (error: any) {
          console.error('Error initializing market settings from database:', error.message || error);
        }
      },
    }),
    {
      name: 'market-settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);