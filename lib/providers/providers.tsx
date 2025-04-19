// lib/providers/providers.tsx

'use client'

import { useState, useEffect } from 'react'
import ThemeInitializer from '@/components/ThemeInitializer'
import CurrencyInitializer from '@/components/CurrencyInitializer'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { useThemeStore } from '@/lib/stores/useThemeStore'
import { usePathname } from 'next/navigation'

export function Providers({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const { theme } = useThemeStore()
  const pathname = usePathname()
  
  // Skip loading screen for welcome page and other public pages
  const skipLoadingScreen = pathname === '/welcome' || 
                           pathname === '/' || 
                           pathname.startsWith('/sign-in') || 
                           pathname.startsWith('/sign-up')

  // Effect to apply theme quickly from localStorage and handle loading
  useEffect(() => {
    if (theme) {
      // Apply theme from localStorage immediately
      document.documentElement.setAttribute('data-theme', theme)
      
      // If we're on the welcome page, skip the loading screen
      if (skipLoadingScreen) {
        console.log('Skipping loading screen for public page:', pathname)
        setIsLoading(false)
      }
    }
  }, [theme, skipLoadingScreen, pathname])

  // Force complete loading after a maximum timeout as a fallback
  useEffect(() => {
    // Skip loading entirely for public pages
    if (skipLoadingScreen) {
      setIsLoading(false)
      return
    }
    
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('Force completing loading after timeout')
        setIsLoading(false)
      }
    }, 2000) // 2 second maximum loading time
    
    return () => clearTimeout(timer)
  }, [isLoading, skipLoadingScreen])

  return (
    <>
      <ThemeInitializer />
      <CurrencyInitializer />
      {!skipLoadingScreen && (
        <LoadingScreen 
          isLoading={isLoading} 
          onComplete={() => {
            console.log('Loading screen complete callback')
            setIsLoading(false)
          }} 
        />
      )}
      {children}
    </>
  )
}