// lib/stores/useCurrencyStore.ts

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createClient } from '@/lib/utils/supabase/client';

// Define supported currency types
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'BTC' | 'ETH' | 'GOLD';

interface CurrencyState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  syncWithDatabase: (currency: Currency) => Promise<void>;
  initializeFromDatabase: () => Promise<void>;
}

// Helper function to save currency preference to cookie
const applyCurrencyToCookie = (currency: Currency) => {
  if (typeof document !== 'undefined') {
    document.cookie = `currency=${currency}; path=/; max-age=31536000; SameSite=Strict`;
  }
};

// Helper to get currency from cookie
const getCurrencyFromCookie = (): Currency | null => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  return (cookies.currency as Currency) || null;
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      
      setCurrency: (currency: Currency) => {
        // Only update if currency differs to avoid unnecessary updates
        if (get().currency !== currency) {
          set({ currency });
          applyCurrencyToCookie(currency);
          
          // Sync with DB (fire and forget)
          get().syncWithDatabase(currency).catch(err => {
            console.error('Failed to sync currency with database:', err.message || err);
          });
        }
      },
      
      syncWithDatabase: async (currency: Currency) => {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            console.log('No user found, skipping database update');
            return;
          }
          
          console.log(`Updating user ${user.id} currency to ${currency}`);
          
          // First, check if the user profile exists
          const { data: existingProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', user.id)
            .single();
            
          console.log('Existing profile check result:', { existingProfile, fetchError });
          
          let updateResult;
          
          // If profile exists, use update
          if (existingProfile) {
            console.log('Using UPDATE for existing profile');
            updateResult = await supabase
              .from('user_profiles')
              .update({ 
                selected_currency: currency,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id);
          } 
          // If profile doesn't exist, use insert
          else {
            console.log('Using INSERT for new profile');
            updateResult = await supabase
              .from('user_profiles')
              .insert({
                id: user.id,
                selected_currency: currency,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
          }
          
          console.log('Database operation result:', updateResult);
          
          if (updateResult.error) {
            console.error('Database update error:', JSON.stringify(updateResult.error));
            // Don't throw, just log the error
          } else {
            console.log('Currency preference updated successfully in database');
          }
        } catch (error: any) {
          console.error('Error syncing currency with database:', 
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
            .select('selected_currency')
            .eq('id', user.id)
            .single();
          
          if (error) {
            if (error.code !== 'PGRST116') {
              throw error;
            }
            return;
          }
          
          if (data?.selected_currency) {
            const dbCurrency = data.selected_currency as Currency;
            if (dbCurrency !== get().currency) {
              set({ currency: dbCurrency });
              applyCurrencyToCookie(dbCurrency);
            }
          }
        } catch (error: any) {
          console.error('Error initializing currency from database:', error.message || error);
        }
      },
    }),
    {
      name: 'currency-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
      onRehydrateStorage: () => (state) => {
        const cookieCurrency = getCurrencyFromCookie();
        if (cookieCurrency && cookieCurrency !== state?.currency) {
          state?.setCurrency(cookieCurrency);
        }
      },
    }
  )
);