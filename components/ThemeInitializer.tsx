'use client'

import { useEffect, useState } from 'react'
import { useThemeStore } from '@/lib/stores/useThemeStore'

export default function ThemeInitializer() {
  const { theme, initializeFromDatabase } = useThemeStore()
  const [isMounted, setIsMounted] = useState(false)

  // This effect runs once on client-side mount
  useEffect(() => {
    // Mark component as mounted to prevent SSR issues
    setIsMounted(true)
    
    // Apply theme from store immediately (this is from localStorage)
    document.documentElement.setAttribute('data-theme', theme)
    console.log('Initial theme applied from localStorage:', theme)
    
    // Then try to load from database
    const loadThemeFromDB = async () => {
      try {
        await initializeFromDatabase()
      } catch (error) {
        console.error('Failed to initialize theme from database:', error)
      }
    }
    
    // Initialize from database with a small delay to ensure auth is ready
    setTimeout(() => {
      loadThemeFromDB()
    }, 500)
  }, [])

  // This component doesn't render anything visible
  return null
}