import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, isWeb } from '../utils'
import { theme } from '../theme'

// Web imports (conditional)
let WebButton: any = null
if (isWeb) {
  WebButton = 'button'
}

// Native imports (conditional)
let TouchableOpacity: any = null
let ActivityIndicator: any = null
if (!isWeb) {
  try {
    const RN = require('react-native')
    TouchableOpacity = RN.TouchableOpacity
    ActivityIndicator = RN.ActivityIndicator
  } catch {
    // React Native not available
  }
}

/**
 * Button variant styles using class-variance-authority
 */
const buttonVariants = cva(
  // Base styles
  isWeb
    ? 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    : '',
  {
    variants: {
      variant: {
        primary: isWeb
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : '',
        secondary: isWeb
          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          : '',
        outline: isWeb
          ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
          : '',
        ghost: isWeb
          ? 'hover:bg-accent hover:text-accent-foreground'
          : '',
        destructive: isWeb
          ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
          : '',
      },
      size: {
        sm: isWeb ? 'h-9 px-3' : '',
        md: isWeb ? 'h-10 px-4 py-2' : '',
        lg: isWeb ? 'h-11 px-8' : '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

/**
 * Get native styles based on variant and size
 */
const getNativeStyles = (variant: ButtonVariant, size: ButtonSize, disabled?: boolean) => {
  const baseStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: theme.borderRadius.md,
  }

  // Size styles
  const sizeStyles = {
    sm: {
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[2],
      minHeight: 36,
    },
    md: {
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[2],
      minHeight: 40,
    },
    lg: {
      paddingHorizontal: theme.spacing[8],
      paddingVertical: theme.spacing[3],
      minHeight: 44,
    },
  }

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: disabled ? '#9CA3AF' : '#3B82F6',
    },
    secondary: {
      backgroundColor: disabled ? '#E5E7EB' : '#F3F4F6',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: disabled ? '#D1D5DB' : '#D1D5DB',
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    destructive: {
      backgroundColor: disabled ? '#9CA3AF' : '#EF4444',
    },
  }

  return {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    opacity: disabled ? 0.5 : 1,
  }
}

/**
 * Get native text styles based on variant and size
 */
const getNativeTextStyles = (variant: ButtonVariant, size: ButtonSize) => {
  const baseTextStyle = {
    fontWeight: theme.typography.fontWeight.medium as any,
    textAlign: 'center' as const,
  }

  const sizeTextStyles = {
    sm: {
      fontSize: theme.typography.fontSize.sm.fontSize,
      lineHeight: theme.typography.fontSize.sm.lineHeight,
    },
    md: {
      fontSize: theme.typography.fontSize.base.fontSize,
      lineHeight: theme.typography.fontSize.base.lineHeight,
    },
    lg: {
      fontSize: theme.typography.fontSize.lg.fontSize,
      lineHeight: theme.typography.fontSize.lg.lineHeight,
    },
  }

  const variantTextStyles = {
    primary: { color: '#FFFFFF' },
    secondary: { color: '#374151' },
    outline: { color: '#374151' },
    ghost: { color: '#374151' },
    destructive: { color: '#FFFFFF' },
  }

  return {
    ...baseTextStyle,
    ...sizeTextStyles[size],
    ...variantTextStyles[variant],
  }
}

export interface ButtonProps
  extends VariantProps<typeof buttonVariants>,
    Omit<
      React.ComponentProps<typeof WebButton>,
      'onPress' | 'style' | 'children'
    > {
  /**
   * Button content
   */
  children: React.ReactNode
  /**
   * Whether the button is in a loading state
   */
  loading?: boolean
  /**
   * Press handler for both web (onClick) and native (onPress)
   */
  onPress?: () => void
  /**
   * Additional styles (native only)
   */
  style?: any
  /**
   * Additional text styles (native only)
   */
  textStyle?: any
  /**
   * Test ID for testing
   */
  testID?: string
}

type ButtonVariant = NonNullable<ButtonProps['variant']>
type ButtonSize = NonNullable<ButtonProps['size']>

/**
 * Universal Button component that works on both web and native platforms.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onPress={() => console.log('pressed')}>
 *   Click me
 * </Button>
 * ```
 */
export const Button = forwardRef<
  React.ElementRef<typeof WebButton>,
  ButtonProps
>(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  loading, 
  onPress, 
  style, 
  textStyle, 
  disabled,
  testID,
  ...props 
}, ref) => {
  const isDisabled = disabled || loading

  if (isWeb) {
    return (
      <WebButton
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        onClick={onPress}
        data-testid={testID}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </WebButton>
    )
  }

  // Native implementation
  const Text = require('react-native').Text
  const buttonStyle = getNativeStyles(variant, size, isDisabled)
  const textStyles = getNativeTextStyles(variant, size)

  return (
    <TouchableOpacity
      ref={ref}
      style={[buttonStyle, style]}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      testID={testID}
      {...props}
    >
      {loading && ActivityIndicator && (
        <ActivityIndicator
          size="small"
          color={textStyles.color}
          style={{ marginRight: theme.spacing[2] }}
        />
      )}
      <Text style={[textStyles, textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  )
})

Button.displayName = 'Button'