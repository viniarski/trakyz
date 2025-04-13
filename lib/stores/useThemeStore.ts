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

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'blue',
      
      setTheme: (theme: Theme) => {
        // Update state
        set({ theme })
        
        // Apply theme to document
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme)
        }
        
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
            console.log('No user logged in, skipping database sync')
            return
          }
          
          console.log('Syncing theme to database:', theme, 'for user:', user.id)
          
          // Update database directly using Supabase
          const { data, error } = await supabase
            .from('user_profiles')
            .update({ 
              theme_preference: theme,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
          
          if (error) {
            throw new Error(`Direct DB update failed: ${error.message}`)
          }
          
          console.log('Theme synced successfully through direct DB update')
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
            console.log('No user logged in, skipping database initialization')
            return
          }
          
          console.log('Fetching theme preference for user:', user.id)
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
            console.log('Found theme preference in database:', dbTheme)
            
            // Update state
            set({ theme: dbTheme })
            
            // Apply theme to document
            if (typeof document !== 'undefined') {
              document.documentElement.setAttribute('data-theme', dbTheme)
            }
            
            console.log('Theme initialized from database')
          }
        } catch (error: any) {
          console.error('Error initializing theme from database:', error.message || error)
        }
      }
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)