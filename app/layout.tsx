import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { Providers } from '@/lib/providers/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TRAKYZ - Track Your Investments',
  description: 'Track and manage your investment portfolio across multiple asset classes with powerful analytics and real-time market data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Set a default theme to prevent the flash of unstyled content
  // The ThemeInitializer will update this if needed based on localStorage
  return (
    <html lang="en" data-theme="blue">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <SpeedInsights/>
        <Analytics/>
      </body>
    </html>
  )
}