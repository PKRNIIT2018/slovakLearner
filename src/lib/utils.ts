import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges class names using clsx and tailwind-merge.
 * @param inputs - Array of class values or objects.
 * @returns A single string of merged tailwind classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string or timestamp into a readable long date (e.g., January 1, 2024).
 * @param input - The date string or number to format.
 * @returns A formatted date string.
 */
export function formatDate(input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Replaces characters in a string to make it safe for injection into JSON-LD scripts.
 * Prevents common XSS vectors in structured data.
 * @param key - The key being processed by JSON.stringify.
 * @param value - The value to be sanitized.
 */
export function safeJsonLdReplacer(key: string, value: unknown) {
  if (typeof value === 'string') {
    return value
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
  }
  return value
}
