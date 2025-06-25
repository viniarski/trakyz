// lib/utils/format.ts
import { CurrencyCode } from "@/types";

/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currency Currency code to use for formatting
 * @param options Additional Intl.NumberFormat options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "USD",
  options?: Intl.NumberFormatOptions
): string {
  // Handle special cases for non-standard currency codes
  if (currency === "GOLD") {
    const opts = options || {};
    return `${amount.toLocaleString('en-US', {
      minimumFractionDigits: opts.minimumFractionDigits || 2,
      maximumFractionDigits: opts.maximumFractionDigits || 2,
    })} XAU`;
  }
  
  if (currency === "BTC") {
    const opts = options || {};
    return `${amount.toLocaleString('en-US', {
      minimumFractionDigits: opts.minimumFractionDigits || 8,
      maximumFractionDigits: opts.maximumFractionDigits || 8,
    })} BTC`;
  }

  const currencyMap: Record<CurrencyCode, string> = {
    USD: "USD",
    EUR: "EUR",
    GBP: "GBP",
    CHF: "CHF",
    BTC: "BTC",
    ETH: "ETH", // Left for type compatibility
    GOLD: "XAU",
  };

  const defaultOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: currencyMap[currency] || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  // Use provided options or defaults
  const formatOptions = { ...defaultOptions, ...options };

  return new Intl.NumberFormat("en-US", formatOptions).format(amount);
}

/**
 * Convert an amount from one currency to another
 * @param amount The amount to convert
 * @param fromCurrency The source currency
 * @param toCurrency The target currency
 * @param rates Currency rate information
 * @returns The converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: {
    currencies: any[] | null;
    crypto: any[] | null;
    metals?: any[] | null;
  }
): number {
  // If currencies are the same, return the original amount
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // First convert to USD as base
  let amountInUsd = amount;
  if (fromCurrency !== "USD") {
    const fromRate = getCurrencyRate(fromCurrency, rates);
    if (fromRate) {
      amountInUsd = amount / fromRate;
    }
  }

  // Then convert from USD to target currency
  if (toCurrency === "USD") {
    return amountInUsd;
  } else {
    const toRate = getCurrencyRate(toCurrency, rates);
    if (toRate) {
      return amountInUsd * toRate;
    }
  }

  // Fallback to original amount if conversion fails
  return amount;
}

/**
 * Get the exchange rate for a currency
 * @param currency The currency to get rate for
 * @param rates Currency rate information
 * @returns The exchange rate or null if not found
 */
function getCurrencyRate(
  currency: CurrencyCode,
  rates: {
    currencies: any[] | null;
    crypto: any[] | null;
    metals?: any[] | null;
  }
): number | null {
  if (currency === "USD") return 1;

  // Check in fiat currencies
  if (rates.currencies) {
    const fiatCurrency = rates.currencies.find(c => c.symbol === currency);
    if (fiatCurrency && fiatCurrency.price > 0) return fiatCurrency.price;
  }

  // Check in crypto currencies
  if (rates.crypto) {
    const cryptoCurrency = rates.crypto.find(c => c.symbol === currency);
    if (cryptoCurrency && cryptoCurrency.price > 0) return cryptoCurrency.price;
  }

  // Check in metals for GOLD
  if (currency === "GOLD" && rates.metals) {
    const goldData = rates.metals.find(m => m.metal.toLowerCase() === 'gold');
    if (goldData && goldData.price > 0) {
      return goldData.price;
    }
  }

  // If nothing is found, return 1 to prevent division by zero
  console.warn(`Exchange rate for ${currency} not found, using 1:1 rate`);
  return 1;
}

/**
 * Format date as string
 * @param date Date to format
 * @param format Format type ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  format: "short" | "medium" | "long" = "medium"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  switch (format) {
    case "short":
      return new Intl.DateTimeFormat("en-US", {
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      }).format(dateObj);
    case "long":
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(dateObj);
    case "medium":
    default:
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(dateObj);
  }
}