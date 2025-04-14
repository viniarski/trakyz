// app/components/ThemeInitializer.tsx

'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/stores/useThemeStore';

interface ThemeInitializerProps {
  onThemeInitialized?: () => void;
}

export default function ThemeInitializer({ onThemeInitialized }: ThemeInitializerProps) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'blue';
    
    // Only update if themes differ to prevent infinite loop
    if (theme !== currentTheme) {
      setTheme(currentTheme as 'blue' | 'dark' | 'light');
    }

    // Notify parent component (run regardless to ensure loading screen progresses)
    if (onThemeInitialized) {
      onThemeInitialized();
    }
  }, []); // Empty deps to run once on mount

  return null;
}