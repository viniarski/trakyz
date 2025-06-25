// components/CurrencyInitializer.tsx

'use client';

import { useEffect } from 'react';
import { useCurrencyStore, Currency } from '@/lib/stores/useCurrencyStore';

export default function CurrencyInitializer() {
  const { currency, setCurrency, initializeFromDatabase } = useCurrencyStore();

  useEffect(() => {
    // Check if there's a currency attribute on the html element (server-side provided)
    const htmlCurrency = document.documentElement.getAttribute('data-currency');
    if (htmlCurrency && htmlCurrency !== currency) {
      // Set the currency from the html attribute
      setCurrency(htmlCurrency as Currency);
    } else {
      // Initialize currency from database if no html attribute
      initializeFromDatabase().catch(error => {
        console.error('Failed to initialize currency from database:', error);
      });
    }
  }, []); // Empty deps to run once on mount

  return null;
}