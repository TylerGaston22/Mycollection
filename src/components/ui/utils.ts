/**
 * utils – Tailwind CSS class merging utility.
 * Combines clsx and tailwind-merge for conditional class composition.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
