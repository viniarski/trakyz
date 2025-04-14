// components/ThemeInitializer.tsx

'use client'

import { useEffect, useRef } from 'react'
import { useThemeStore } from '@/lib/stores/useThemeStore'

export default function ThemeInitializer() {
  const { theme, initializeFromDatabase } = useThemeStore();
  const initialized = useRef(false);

  // This effect runs once on client-side mount
  useEffect(() => {
    // Apply theme from store immediately (this is from localStorage)
    if (!initialized.current) {
      document.documentElement.setAttribute('data-theme', theme);
      initialized.current = true;
    }
    
    // Then try to load from database
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