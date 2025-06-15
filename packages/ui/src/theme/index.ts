export * from './colors'
export * from './typography'
export * from './spacing'

import { colors, ColorScheme, ThemeColors } from './colors'
import { typography, textVariants, TextVariant } from './typography'
import { spacing, borderRadius, shadows } from './spacing'

export const theme = {
  colors,
  typography,
  textVariants,
  spacing,
  borderRadius,
  shadows,
} as const

export type Theme = typeof theme

export interface ThemeContextValue {
  theme: Theme
  colorScheme: ColorScheme
  colors: ThemeColors
  toggleColorScheme?: () => void
  setColorScheme?: (scheme: ColorScheme) => void
}

// Default theme for web (CSS variables)
export const webTheme = {
  ...theme,
  colors: {
    ...colors,
    // CSS variables for web
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    card: 'hsl(var(--card))',
    cardForeground: 'hsl(var(--card-foreground))',
    popover: 'hsl(var(--popover))',
    popoverForeground: 'hsl(var(--popover-foreground))',
    primary: 'hsl(var(--primary))',
    primaryForeground: 'hsl(var(--primary-foreground))',
    secondary: 'hsl(var(--secondary))',
    secondaryForeground: 'hsl(var(--secondary-foreground))',
    muted: 'hsl(var(--muted))',
    mutedForeground: 'hsl(var(--muted-foreground))',
    accent: 'hsl(var(--accent))',
    accentForeground: 'hsl(var(--accent-foreground))',
    destructive: 'hsl(var(--destructive))',
    destructiveForeground: 'hsl(var(--destructive-foreground))',
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
  },
}

export type { TextVariant, ColorScheme, ThemeColors }