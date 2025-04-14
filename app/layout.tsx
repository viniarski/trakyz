// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { Providers } from '@/lib/providers/providers';
import { createClient } from '@/lib/utils/supabase/server';
import { cookies } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TRAKYZ - Track Your Investments',
  description: 'Track and manage your investment portfolio across multiple asset classes with powerful analytics and real-time market data',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get theme from cookie
  const cookieStore = await cookies(); // Await cookies()
  const themeCookie = cookieStore.get('theme');
  let theme: string = themeCookie?.value || 'blue';

  // For authenticated users, try to get theme from database
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('theme_preference')
      .eq('id', user.id)
      .single();

    if (!error && data?.theme_preference) {
      theme = data.theme_preference;
    }
  }

  return (
    <html lang="en" data-theme={theme}>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}