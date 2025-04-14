'use client'

import { useState, useEffect } from 'react'
import ThemeInitializer from '@/components/ThemeInitializer'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { useThemeStore } from '@/lib/stores/useThemeStore'

export function Providers({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const { theme } = useThemeStore()

  // Effect to apply theme quickly from localStorage and handle loading
  useEffect(() => {
    if (theme) {
      // Apply theme from localStorage immediately
      document.documentElement.setAttribute('data-theme', theme)
      
      // The LoadingScreen component already has its own internal duration
      // We don't need additional delays here - just let it run its course
      console.log('Theme applied:', theme)
    }
  }, [theme])

  // Force complete loading after a maximum timeout as a fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('Force completing loading after timeout')
        setIsLoading(false)
      }
    }, 2000) // 2 second maximum loading time
    
    return () => clearTimeout(timer)
  }, [isLoading])

  return (
    <>
      <ThemeInitializer />
      <LoadingScreen 
        isLoading={isLoading} 
        onComplete={() => {
          console.log('Loading screen complete callback')
          setIsLoading(false)
        }} 
      />
      {children}
    </>
  )
}