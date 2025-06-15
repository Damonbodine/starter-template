import React, { forwardRef } from 'react'
import { cn, isWeb } from '../utils'
import { theme, textVariants, type TextVariant } from '../theme'

// Web imports (conditional)
let WebH1: any = null
let WebH2: any = null
let WebH3: any = null
let WebH4: any = null
let WebH5: any = null
let WebH6: any = null
let WebP: any = null
let WebSpan: any = null

if (isWeb) {
  WebH1 = 'h1'
  WebH2 = 'h2'
  WebH3 = 'h3'
  WebH4 = 'h4'
  WebH5 = 'h5'
  WebH6 = 'h6'
  WebP = 'p'
  WebSpan = 'span'
}

// Native imports (conditional)
let Text: any = null
if (!isWeb) {
  try {
    const RN = require('react-native')
    Text = RN.Text
  } catch {
    // React Native not available
  }
}

/**
 * Get the appropriate web element for each variant
 */
const getWebElement = (variant: TextVariant) => {
  switch (variant) {
    case 'h1':
      return WebH1
    case 'h2':
      return WebH2
    case 'h3':
      return WebH3
    case 'h4':
      return WebH4
    case 'h5':
      return WebH5
    case 'h6':
      return WebH6
    case 'body':
      return WebP
    case 'bodySmall':
    case 'caption':
    case 'label':
      return WebSpan
    default:
      return WebP
  }
}

/**
 * Get web classes for each variant
 */
const getWebClasses = (variant: TextVariant) => {
  const baseClasses = 'font-sans text-foreground'
  
  switch (variant) {
    case 'h1':
      return cn(baseClasses, 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl')
    case 'h2':
      return cn(baseClasses, 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0')
    case 'h3':
      return cn(baseClasses, 'scroll-m-20 text-2xl font-semibold tracking-tight')
    case 'h4':
      return cn(baseClasses, 'scroll-m-20 text-xl font-semibold tracking-tight')
    case 'h5':
      return cn(baseClasses, 'scroll-m-20 text-lg font-medium tracking-tight')
    case 'h6':
      return cn(baseClasses, 'scroll-m-20 text-base font-medium tracking-tight')
    case 'body':
      return cn(baseClasses, 'leading-7 [&:not(:first-child)]:mt-6')
    case 'bodySmall':
      return cn(baseClasses, 'text-sm text-muted-foreground')
    case 'caption':
      return cn(baseClasses, 'text-xs text-muted-foreground')
    case 'label':
      return cn(baseClasses, 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70')
    default:
      return baseClasses
  }
}

/**
 * Get native styles for each variant
 */
const getNativeStyles = (variant: TextVariant) => {
  const variantStyle = textVariants[variant]
  
  return {
    fontSize: variantStyle.fontSize,
    lineHeight: variantStyle.lineHeight,
    fontWeight: variantStyle.fontWeight,
    color: '#374151', // Default text color
    fontFamily: 'System', // Default system font
  }
}

export interface TypographyProps {
  /**
   * Text variant to apply
   */
  variant: TextVariant
  /**
   * Text content
   */
  children: React.ReactNode
  /**
   * Additional CSS classes (web only)
   */
  className?: string
  /**
   * Additional styles (native only)
   */
  style?: any
  /**
   * Text color override
   */
  color?: string
  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right' | 'justify'
  /**
   * Whether text should be selectable (native only)
   */
  selectable?: boolean
  /**
   * Number of lines to show before truncating (native only)
   */
  numberOfLines?: number
  /**
   * Ellipsize mode (native only)
   */
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip'
  /**
   * Test ID for testing
   */
  testID?: string
  /**
   * Click handler
   */
  onPress?: () => void
  /**
   * Additional HTML props (web only)
   */
  [key: string]: any
}

/**
 * Universal Typography component that renders semantic HTML elements on web
 * and Text components on native platforms.
 * 
 * @example
 * ```tsx
 * <Typography variant="h1">Main Title</Typography>
 * <Typography variant="body">Body text content</Typography>
 * <Typography variant="caption" color="#666">Small caption text</Typography>
 * ```
 */
export const Typography = forwardRef<any, TypographyProps>(
  ({ 
    variant,
    children,
    className,
    style,
    color,
    align = 'left',
    selectable,
    numberOfLines,
    ellipsizeMode,
    testID,
    onPress,
    ...props 
  }, ref) => {
    if (isWeb) {
      const WebElement = getWebElement(variant)
      const webClasses = getWebClasses(variant)
      
      const webStyle = {
        color,
        textAlign: align,
        cursor: onPress ? 'pointer' : undefined,
      }

      return (
        <WebElement
          ref={ref}
          className={cn(webClasses, className)}
          style={webStyle}
          onClick={onPress}
          data-testid={testID}
          {...props}
        >
          {children}
        </WebElement>
      )
    }

    // Native implementation
    const nativeStyles = getNativeStyles(variant)
    const textStyle = {
      ...nativeStyles,
      color: color || nativeStyles.color,
      textAlign: align,
    }

    return (
      <Text
        ref={ref}
        style={[textStyle, style]}
        selectable={selectable}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
        onPress={onPress}
        testID={testID}
        {...props}
      >
        {children}
      </Text>
    )
  }
)

Typography.displayName = 'Typography'

// Convenience components for each variant
export const H1 = forwardRef<any, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="h1" {...props} />
)
H1.displayName = 'H1'

export const H2 = forwardRef<any, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="h2" {...props} />
)
H2.displayName = 'H2'

export const H3 = forwardRef<any, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="h3" {...props} />
)
H3.displayName = 'H3'

export const H4 = forwardRef<any, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="h4" {...props} />
)
H4.displayName = 'H4'

export const H5 = forwardRef<any, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="h5" {...props} />
)
H5.displayName = 'H5'

export const H6 = forwardRef<any, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="h6" {...props} />
)
H6.displayName = 'H6'

export const Body = forwardRef<any, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="body" {...props} />
)
Body.displayName = 'Body'

export const BodySmall = forwardRef<any, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="bodySmall" {...props} />
)
BodySmall.displayName = 'BodySmall'

export const Caption = forwardRef<any, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="caption" {...props} />
)
Caption.displayName = 'Caption'

export const Label = forwardRef<any, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="label" {...props} />
)
Label.displayName = 'Label'