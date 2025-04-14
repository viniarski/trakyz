import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createClient } from '@/lib/utils/supabase/client'

type Theme = 'blue' | 'dark' | 'light'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  syncWithDatabase: (theme: Theme) => Promise<void>
  initializeFromDatabase: () => Promise<void>
}

// Helper function to update document theme
const applyThemeToDocument = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'blue',
      
      setTheme: (theme: Theme) => {
        // Update state
        set({ theme })
        
        // Apply theme to document
        applyThemeToDocument(theme)
        
        // Sync with DB (fire and forget)
        get().syncWithDatabase(theme).catch(err => {
          console.error('Failed to sync theme with database:', err.message || err)
        })
      },
      
      syncWithDatabase: async (theme: Theme) => {
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          
          if (!user) {
            return
          }
          
          // Update database directly using Supabase
          const { error } = await supabase
            .from('user_profiles')
            .update({ 
              theme_preference: theme,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
          
          if (error) {
            throw error
          }
        } catch (error: any) {
          console.error('Error syncing theme with database:', error.message || 'Unknown error')
          // Don't rethrow to prevent cascading errors
        }
      },
      
      initializeFromDatabase: async () => {
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          
          if (!user) {
            return
          }
          
          const { data, error } = await supabase
            .from('user_profiles')
            .select('theme_preference')
            .eq('id', user.id)
            .single()
          
          if (error) {
            if (error.code !== 'PGRST116') { // Record not found error
              throw error
            }
            return
          }
          
          if (data?.theme_preference) {
            const dbTheme = data.theme_preference as Theme
            
            // Only update if the theme from DB is different from current localStorage theme
            if (dbTheme !== get().theme) {
              // Update state (which will also sync back to localStorage)
              set({ theme: dbTheme })
              
              // Apply theme to document
              applyThemeToDocument(dbTheme)
            }
          }
        } catch (error: any) {
          console.error('Error initializing theme from database:', error.message || error)
        }
      }
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
      // Don't skip hydration since we want the localStorage theme to load ASAP
      skipHydration: false,
    }
  )
)