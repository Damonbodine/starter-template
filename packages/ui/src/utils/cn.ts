import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Platform detection utility
export const isWeb = typeof window !== 'undefined' && window.document
export const isNative = !isWeb

// Platform-specific class merging
export function platformCn(webClasses: string, nativeClasses?: string) {
  if (isWeb) {
    return webClasses
  }
  return nativeClasses || webClasses
}