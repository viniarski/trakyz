// app/lib/stores/useThemeStore.ts

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';

type Theme = 'blue' | 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  syncWithDatabase: (theme: Theme) => Promise<void>;
  initializeFromDatabase: () => Promise<void>;
}

// Helper function to update document theme
const applyThemeToDocument = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Strict`;
  }
};

// Helper to get theme from cookie
const getThemeFromCookie = (): Theme | null => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  return (cookies.theme as Theme) || null;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'blue',
      
      setTheme: (theme: Theme) => {
        // Only update if theme differs to avoid unnecessary updates
        if (get().theme !== theme) {
          set({ theme });
          applyThemeToDocument(theme);
          
          // Sync with DB (fire and forget)
          get().syncWithDatabase(theme).catch(err => {
            console.error('Failed to sync theme with database:', err.message || err);
          });
        }
      },
      
      syncWithDatabase: async (theme: Theme) => {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            return;
          }
          
          const { error } = await supabase
            .from('user_profiles')
            .update({ 
              theme_preference: theme,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
          
          if (error) {
            throw error;
          }
        } catch (error: any) {
          console.error('Error syncing theme with database:', error.message || 'Unknown error');
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
            .select('theme_preference')
            .eq('id', user.id)
            .single();
          
          if (error) {
            if (error.code !== 'PGRST116') {
              throw error;
            }
            return;
          }
          
          if (data?.theme_preference) {
            const dbTheme = data.theme_preference as Theme;
            if (dbTheme !== get().theme) {
              set({ theme: dbTheme });
              applyThemeToDocument(dbTheme);
            }
          }
        } catch (error: any) {
          console.error('Error initializing theme from database:', error.message || error);
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
      onRehydrateStorage: () => (state) => {
        const cookieTheme = getThemeFromCookie();
        if (cookieTheme && cookieTheme !== state?.theme) {
          state?.setTheme(cookieTheme);
        }
      },
    }
  )
);