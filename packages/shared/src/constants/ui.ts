/**
 * UI/UX constants including theme colors, breakpoints,
 * animation durations, z-index values, and common measurements
 */

/**
 * Color palette for light and dark themes
 */
export const COLORS = {
  // Light theme colors
  light: {
    primary: '#007bff',
    primaryLight: '#66b3ff',
    primaryDark: '#0056cc',
    
    secondary: '#6c757d',
    secondaryLight: '#a6acb3',
    secondaryDark: '#495057',
    
    success: '#28a745',
    successLight: '#71d875',
    successDark: '#1e7e34',
    
    danger: '#dc3545',
    dangerLight: '#e8717a',
    dangerDark: '#c82333',
    
    warning: '#ffc107',
    warningLight: '#ffcd39',
    warningDark: '#e0a800',
    
    info: '#17a2b8',
    infoLight: '#5bc0de',
    infoDark: '#117a8b',
    
    // Neutrals
    white: '#ffffff',
    light: '#f8f9fa',
    lightGray: '#e9ecef',
    gray: '#6c757d',
    darkGray: '#495057',
    dark: '#343a40',
    black: '#000000',
    
    // Text colors
    textPrimary: '#212529',
    textSecondary: '#6c757d',
    textMuted: '#868e96',
    textLight: '#ffffff',
    
    // Background colors
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundTertiary: '#e9ecef',
    
    // Border colors
    border: '#dee2e6',
    borderLight: '#e9ecef',
    borderDark: '#adb5bd',
  },
  
  // Dark theme colors
  dark: {
    primary: '#0d6efd',
    primaryLight: '#6ea8fe',
    primaryDark: '#0a58ca',
    
    secondary: '#6c757d',
    secondaryLight: '#a7acb1',
    secondaryDark: '#565e64',
    
    success: '#198754',
    successLight: '#75b798',
    successDark: '#146c43',
    
    danger: '#dc3545',
    dangerLight: '#ea868f',
    dangerDark: '#b02a37',
    
    warning: '#ffc107',
    warningLight: '#ffcd39',
    warningDark: '#bb9d00',
    
    info: '#0dcaf0',
    infoLight: '#6edff6',
    infoDark: '#055160',
    
    // Neutrals
    white: '#ffffff',
    light: '#495057',
    lightGray: '#6c757d',
    gray: '#adb5bd',
    darkGray: '#dee2e6',
    dark: '#212529',
    black: '#000000',
    
    // Text colors
    textPrimary: '#ffffff',
    textSecondary: '#adb5bd',
    textMuted: '#6c757d',
    textLight: '#212529',
    
    // Background colors
    background: '#212529',
    backgroundSecondary: '#343a40',
    backgroundTertiary: '#495057',
    
    // Border colors
    border: '#495057',
    borderLight: '#6c757d',
    borderDark: '#343a40',
  },
} as const;

/**
 * Responsive breakpoints (in pixels)
 */
export const BREAKPOINTS = {
  xs: 0,      // Extra small devices
  sm: 576,    // Small devices
  md: 768,    // Medium devices (tablets)
  lg: 992,    // Large devices (desktops)
  xl: 1200,   // Extra large devices
  xxl: 1400,  // Extra extra large devices
  
  // Mobile-first approach
  mobile: 320,
  mobileLarge: 425,
  tablet: 768,
  laptop: 1024,
  laptopL: 1440,
  desktop: 2560,
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATIONS = {
  // Duration
  fastest: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  slowest: 800,
  
  // Specific animations
  fade: 300,
  slide: 250,
  bounce: 400,
  scale: 200,
  rotate: 300,
  
  // Loading states
  spinner: 1000,
  skeleton: 1500,
  pulse: 2000,
  
  // Transitions
  pageTransition: 300,
  modalTransition: 200,
  drawerTransition: 250,
} as const;

/**
 * Animation easing functions
 */
export const EASING = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Custom bezier curves
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
} as const;

/**
 * Z-index values for layering
 */
export const Z_INDEX = {
  // Base layers
  base: 0,
  content: 1,
  elevated: 10,
  
  // Navigation
  header: 100,
  navigation: 200,
  sidebar: 300,
  
  // Overlays
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  
  // Highest priority
  toast: 2000,
  loading: 2100,
  debug: 9999,
} as const;

/**
 * Common spacing values (in pixels)
 */
export const SPACING = {
  // Base spacing scale
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  // Specific use cases
  section: 80,
  component: 24,
  element: 16,
  
  // Padding
  paddingXs: 4,
  paddingSm: 8,
  paddingMd: 16,
  paddingLg: 24,
  paddingXl: 32,
  
  // Margin
  marginXs: 4,
  marginSm: 8,
  marginMd: 16,
  marginLg: 24,
  marginXl: 32,
} as const;

/**
 * Typography scale
 */
export const TYPOGRAPHY = {
  // Font sizes (in pixels)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Font weights
  fontWeight: {
    thin: 100,
    extraLight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
    extraBold: 800,
    black: 900,
  },
  
  // Font families
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
} as const;

/**
 * Border radius values (in pixels)
 */
export const BORDER_RADIUS = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
  
  // Component specific
  button: 6,
  input: 4,
  card: 8,
  modal: 12,
  avatar: 9999,
} as const;

/**
 * Shadow definitions
 */
export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

/**
 * Common component sizes
 */
export const SIZES = {
  // Button sizes
  button: {
    sm: { height: 32, padding: '6px 12px', fontSize: 14 },
    md: { height: 40, padding: '8px 16px', fontSize: 16 },
    lg: { height: 48, padding: '12px 24px', fontSize: 18 },
  },
  
  // Input sizes
  input: {
    sm: { height: 32, padding: '6px 12px', fontSize: 14 },
    md: { height: 40, padding: '8px 12px', fontSize: 16 },
    lg: { height: 48, padding: '12px 16px', fontSize: 18 },
  },
  
  // Avatar sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    xxl: 96,
  },
  
  // Icon sizes
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
} as const;