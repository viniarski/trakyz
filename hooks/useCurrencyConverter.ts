// hooks/useCurrencyConverter.ts

import { useCurrencyStore } from '@/lib/stores/useCurrencyStore';
import { CurrencyCode, Crypto, Currency, Metal } from '@/types';
import { formatCurrency } from '@/lib/utils';

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
      metals?: Metal[] | null;
    },
    assetSymbol?: string // Optional: the symbol of the asset being converted (e.g., 'BTC', 'gold')
  ): number => {
    // If the asset's native currency matches the selected currency, return 1
    if (assetSymbol) {
      if (currency === 'GOLD' && assetSymbol.toLowerCase() === 'gold') return 1;
      if (currency === 'BTC' && assetSymbol.toUpperCase() === 'BTC') return 1;
    }
    
    // If the current currency is USD, no conversion needed
    if (currency === 'USD') return usdValue;
    
    // Get the exchange rate for the selected currency
    const exchangeRate = getExchangeRate(currency, rates);
    
    // Convert from USD to the selected currency
    // For GOLD, divide by the gold price (USD per ounce)
    // For other currencies, divide by the exchange rate (USD per unit of currency)
    if (exchangeRate <= 0) {
      console.warn(`Invalid exchange rate for ${currency}: ${exchangeRate}, returning original value`);
      return usdValue; // Avoid division by zero or invalid rate
    }
    const convertedValue = usdValue / exchangeRate;
    console.debug(`Converting ${usdValue} USD to ${currency} with rate ${exchangeRate}: ${convertedValue}`);
    return convertedValue;
  };
  
  // Format a value in the selected currency
  const formatValue = (
    value: number,
    options?: Intl.NumberFormatOptions
  ): string => {
    // For special currencies that aren't standard ISO codes
    if (currency === 'GOLD') {
      const opts = options || {};
      return `${value.toLocaleString('en-US', {
        minimumFractionDigits: opts.minimumFractionDigits || 4,
        maximumFractionDigits: opts.maximumFractionDigits || 4,
      })} XAU`;
    }
    
    if (currency === 'BTC') {
      try {
        return formatCurrency(value, currency, options);
      } catch (error) {
        console.error('Error formatting crypto currency:', error);
        return `${value.toLocaleString('en-US')} ${currency}`;
      }
    }
    
    try {
      return formatCurrency(value, currency, options);
    } catch (error) {
      // Fallback for any other formatting errors
      console.error('Error in formatValue:', error);
      return `$${value.toLocaleString('en-US')}`;
    }
  };
  
  // Format a value in the selected currency with appropriate precision
  const formatPreciseValue = (value: number): string => {
    const options: Intl.NumberFormatOptions = {};
    
    // For crypto currencies, show more decimal places
    if (currency === 'BTC') {
      options.minimumFractionDigits = 8;
      options.maximumFractionDigits = 8;
      try {
        return formatCurrency(value, currency, options);
      } catch (error) {
        return `${value.toFixed(8)} ${currency}`;
      }
    }
    // For GOLD (which is not a standard currency code)
    else if (currency === 'GOLD') {
      options.minimumFractionDigits = 4;
      options.maximumFractionDigits = 4;
      return `${value.toLocaleString('en-US', options)} XAU`;
    }
    // For precious metals and high-value currencies, show 2 decimal places
    else {
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 2;
      
      try {
        return formatCurrency(value, currency, options);
      } catch (error) {
        // Fallback in case formatCurrency fails
        return `$${value.toFixed(2)}`;
      }
    }
  };
  
  // Convert and format in one step
  const convertAndFormat = (
    value: number,
    rates: {
      currencies: Currency[] | null;
      crypto: Crypto[] | null;
      metals?: Metal[] | null;
    },
    assetSymbol?: string,
    options?: Intl.NumberFormatOptions
  ): string => {
    const convertedValue = convertValue(value, rates, assetSymbol);
    
    if (currency === 'GOLD') {
      const opts = { ...options, minimumFractionDigits: 4, maximumFractionDigits: 4 };
      return `${convertedValue.toLocaleString('en-US', opts)} XAU`;
    }
    
    try {
      return formatCurrency(convertedValue, currency, options);
    } catch (error) {
      console.error('Error in convertAndFormat:', error);
      return `${convertedValue.toLocaleString('en-US')} ${currency}`;
    }
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
      if (fiatCurrency && fiatCurrency.price > 0) {
        console.debug(`Found fiat currency ${targetCurrency} with price ${fiatCurrency.price}`);
        return fiatCurrency.price;
      }
    }
    
    // Then check in cryptocurrencies
    if (rates.crypto) {
      const cryptoCurrency = rates.crypto.find(c => c.symbol === targetCurrency);
      if (cryptoCurrency && cryptoCurrency.price > 0) {
        console.debug(`Found crypto currency ${targetCurrency} with price ${cryptoCurrency.price}`);
        return cryptoCurrency.price;
      }
    }
    
    // Special case for GOLD - look for it in metals data if available
    if (targetCurrency === 'GOLD' && rates.metals) {
      console.debug('Metals data:', rates.metals);
      const goldData = rates.metals.find(m => m.metal.toLowerCase() === 'gold');
      if (goldData && goldData.price > 0) {
        console.debug(`Found gold price: ${goldData.price} USD per ounce`);
        return goldData.price;
      }
      console.warn('Gold price not found in metals data');
    }
    
    // If we can't determine the rate, return 1 (no conversion)
    console.warn(`Exchange rate for ${targetCurrency} not found in data, using 1:1 rate`);
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