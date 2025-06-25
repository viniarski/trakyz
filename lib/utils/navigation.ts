// lib/utils/navigation.ts

import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

/**
 * Validates that input fields match the allowed fields list
 * Used for filtering user input before sending to database
 * 
 * @param body Input data object
 * @param allowedFields Array of allowed field names
 * @returns Filtered object containing only allowed fields
 */
export function validateInsertFields<T extends object>(
  body: Record<string, any>,
  allowedFields: readonly (keyof T)[]
): Partial<T> {
  const validData: Partial<T> = {};
  for (const key of allowedFields) {
    if (key in body) {
      validData[key] = body[key as string] as T[typeof key];
    }
  }
  return validData;
}