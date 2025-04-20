// hooks/useCurrencyConverter.ts

import { useMemo } from 'react';
import { useCurrencyStore } from '@/lib/stores/useCurrencyStore';
import { CurrencyCode, Crypto, Currency, Stock, Metal } from '@/types';
import { convertCurrency, formatCurrency } from '@/lib/utils';

/**
 * Custom hook that provides currency conversion utilities based on the selected currency
 * Uses the useCurrencyStore to access the currently selected currency
 */
export function useCurrencyConverter() {
  // Get the current currency from the store
  const { currency } = useCurrencyStore();
  
  // Convert a value from USD to the selected currency
  const convertValue = (
    usdValue: number, 
    rates: {
      currencies: Currency[] | null;
      crypto: Crypto[] | null;
    }
  ): number => {
    // If the current currency is USD, no conversion needed
    if (currency === 'USD') return usdValue;
    
    // Get the exchange rate for the selected currency
    const exchangeRate = getExchangeRate(currency, rates);
    
    // Convert from USD to the selected currency
    // For most currencies, we divide the USD value by the exchange rate
    // because our rates are stored as 1 unit of foreign currency = X USD
    return usdValue / exchangeRate;
  };
  
  // Format a value in the selected currency
  const formatValue = (
    value: number,
    options?: Intl.NumberFormatOptions
  ): string => {
    return formatCurrency(value, currency, options);
  };
  
  // Format a value in the selected currency with appropriate precision
  const formatPreciseValue = (value: number): string => {
    const options: Intl.NumberFormatOptions = {};
    
    // For crypto currencies, show more decimal places
    if (currency === 'BTC' || currency === 'ETH') {
      options.minimumFractionDigits = 8;
      options.maximumFractionDigits = 8;
    }
    // For precious metals and high-value currencies, show 2 decimal places
    else if (currency === 'GOLD' || currency === 'USD' || currency === 'EUR' || currency === 'GBP') {
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 2;
    }
    
    return formatCurrency(value, currency, options);
  };
  
  // Convert and format in one step
  const convertAndFormat = (
    value: number,
    rates: {
      currencies: Currency[] | null;
      crypto: Crypto[] | null;
    },
    options?: Intl.NumberFormatOptions
  ): string => {
    const convertedValue = convertValue(value, rates);
    return formatCurrency(convertedValue, currency, options);
  };
  
  // Find the exchange rate for a specific currency
  const getExchangeRate = (
    targetCurrency: CurrencyCode,
    rates: {
      currencies: Currency[] | null;
      crypto: Crypto[] | null;
      metals?: Metal[] | null;
    }
  ): number => {
    // If target is USD, rate is 1
    if (targetCurrency === 'USD') return 1;
    
    // Find the exchange rate in our data
    // First check in fiat currencies
    if (rates.currencies) {
      const fiatCurrency = rates.currencies.find(c => c.symbol === targetCurrency);
      if (fiatCurrency) return fiatCurrency.price;
    }
    
    // Then check in cryptocurrencies
    if (rates.crypto) {
      const cryptoCurrency = rates.crypto.find(c => c.symbol === targetCurrency);
      if (cryptoCurrency) return cryptoCurrency.price;
    }
    
    // Special case for GOLD - look for it in metals data if available
    if (targetCurrency === 'GOLD' && rates.metals) {
      const goldData = rates.metals.find(m => 
        m.metal.toLowerCase() === 'gold'
      );
      if (goldData) {
        console.log('Found GOLD rate:', goldData.price);
        return goldData.price;
      }
    }
    
    // If we can't determine the rate, return 1 (no conversion)
    console.warn(`Exchange rate for ${targetCurrency} not found in database, using 1:1 rate`);
    return 1;
  };
  
  return {
    selectedCurrency: currency,
    convertValue,
    formatValue,
    formatPreciseValue,
    convertAndFormat,
    getExchangeRate
  };
}