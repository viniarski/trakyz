// lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CurrencyCode } from "@/types";

/**
 * Combine Tailwind CSS classes conditionally
 * @param inputs ClassValue array
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  const currencyMap: Record<CurrencyCode, string> = {
    USD: "USD",
    EUR: "EUR",
    GBP: "GBP",
    CHF: "CHF",
    BTC: "BTC",
    ETH: "ETH",
    GOLD: "XAU",
  };

  const defaultOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: currencyMap[currency] || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  // Special handling for crypto
  if (currency === "BTC" || currency === "ETH") {
    defaultOptions.minimumFractionDigits = 8;
    defaultOptions.maximumFractionDigits = 8;
  }

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
  }
): number | null {
  if (currency === "USD") return 1;

  // Check in fiat currencies
  if (rates.currencies) {
    const fiatCurrency = rates.currencies.find(c => c.symbol === currency);
    if (fiatCurrency) return fiatCurrency.price;
  }

  // Check in crypto currencies
  if (rates.crypto) {
    const cryptoCurrency = rates.crypto.find(c => c.symbol === currency);
    if (cryptoCurrency) return cryptoCurrency.price;
  }

  // Default conversions for gold if rates not available
  if (currency === "GOLD") return 2000; // Approximate price of gold

  return null;
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