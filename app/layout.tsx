// app/layout.tsx

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { GoogleAnalytics } from '@next/third-parties/google';
import { Providers } from '@/lib/providers/providers';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.trakyz.com'),
  alternates: {
    canonical: 'https://www.trakyz.com',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.trakyz.com',
    siteName: 'TRAKYZ',
    images: [
      {
        url: '/assets/trakyz-og-image.webp',
        width: 1200,
        height: 630,
        alt: 'TRAKYZ - Track Your Investments',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@trakyz',
    creator: '@trakyz',
  },
  title: {
    default: 'TRAKYZ - Track Your Investments',
    template: '%s | TRAKYZ',
  },
  description:
    'Track and manage your investment portfolio across multiple asset classes with powerful analytics and real-time market data.',
  keywords: [
    'investment tracking',
    'portfolio management',
    'real-time market data',
    'financial analytics',
    'asset management',
    'investment app',
    'personal finance',
    'stock tracking',
    'crypto portfolio',
  ],
  authors: [{ name: 'TRAKYZ Team' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/assets/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const businessStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'TRAKYZ',
  description:
    'Track and manage your investment portfolio with real-time market data and analytics.',
  url: 'https://www.trakyz.com',
  logo: 'https://www.trakyz.com/assets/trakyz-logo.webp',
  applicationCategory: 'Finance',
  operatingSystem: 'Web',
  sameAs: [
    'https://x.com/trakyz',
    'https://www.linkedin.com/company/trakyz',
    // CHANGE THESE BEFORE LUNCH
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get theme and currency from cookies
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme');
  const currencyCookie = cookieStore.get('currency');

  let theme: string = themeCookie?.value || 'blue';
  let currency: string = currencyCookie?.value || 'USD';

  // For authenticated users, try to get preferences from database
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('theme_preference, selected_currency')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      if (data.theme_preference) {
        theme = data.theme_preference;
      }
      if (data.selected_currency) {
        currency = data.selected_currency;
      }
    }
  }

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" data-theme={theme} data-currency={currency} className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(businessStructuredData),
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Providers>
          {children}
        </Providers>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <SpeedInsights />
        <Analytics />
        {/* Placeholder for cookie consent - implement as needed */}
        {/* <CookieConsent /> */}
      </body>
    </html>
  );
}

// TODO: Cookie pop up