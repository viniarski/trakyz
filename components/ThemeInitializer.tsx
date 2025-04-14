'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/stores/useThemeStore'

export default function ThemeInitializer() {
  const { theme, initializeFromDatabase } = useThemeStore();
  
  // This effect runs once on client-side mount
  useEffect(() => {
    // First apply the theme from localStorage (which zustand has already loaded)
    document.documentElement.setAttribute('data-theme', theme);
    
    // Then try to load from database and update if different
    let isMounted = true;
    
    const loadThemeFromDB = async () => {
      try {
        if (isMounted) {
          await initializeFromDatabase();
        }
      } catch (error) {
        console.error('Failed to initialize theme from database:', error);
      }
    };
    
    // Small delay to ensure auth is ready
    const timer = setTimeout(loadThemeFromDB, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [theme, initializeFromDatabase]);

  // This component doesn't render anything visible
  return null;
}