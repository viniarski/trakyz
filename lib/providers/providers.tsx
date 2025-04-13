'use client'

import ThemeInitializer from '@/components/ThemeInitializer'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeInitializer />
      {children}
    </>
  )
}