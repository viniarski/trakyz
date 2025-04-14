'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/stores/useThemeStore'

interface ThemeInitializerProps {
  onThemeInitialized?: () => void;
}

export default function ThemeInitializer({ onThemeInitialized }: ThemeInitializerProps) {
  const { theme } = useThemeStore();
  
  // This effect runs once on client-side mount
  useEffect(() => {
    // Apply theme from localStorage (Zustand has already loaded it)
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
      
      // Notify parent component that theme is initialized
      if (onThemeInitialized) {
        onThemeInitialized();
      }
    }
  }, [theme, onThemeInitialized]);

  // This component doesn't render anything visible
  return null;
}