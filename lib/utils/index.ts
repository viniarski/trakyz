// lib/utils/index.ts

// Export all utility functions from their respective modules
export * from './format';
export * from './navigation';
export * from './portfolio';

// Common utility function from the original utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine Tailwind CSS classes conditionally
 * @param inputs ClassValue array
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}