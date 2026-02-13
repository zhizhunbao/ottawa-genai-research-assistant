/**
 * utils - Shared utility functions including className merging
 *
 * @module lib
 * @template none
 * @reference none
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
