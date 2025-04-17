import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function classNameMerge(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Added cn function as an alias to classNameMerge for more standard naming
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
