import React, { forwardRef } from 'react'
import { cn, isWeb } from '../utils'
import { theme } from '../theme'

// Web imports (conditional)
let WebDiv: any = null
if (isWeb) {
  WebDiv = 'div'
}

// Native imports (conditional)
let View: any = null
if (!isWeb) {
  try {
    const RN = require('react-native')
    View = RN.View
  } catch {
    // React Native not available
  }
}

/**
 * Get native card styles
 */
const getNativeCardStyles = () => {
  return {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...theme.shadows.sm,
  }
}

const getNativeHeaderStyles = () => {
  return {
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[4],
  }
}

const getNativeContentStyles = () => {
  return {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[2],
    flex: 1,
  }
}

const getNativeFooterStyles = () => {
  return {
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[6],
  }
}

export interface CardProps extends React.ComponentProps<typeof WebDiv> {
  /**
   * Card content
   */
  children: React.ReactNode
  /**
   * Additional styles (native only)
   */
  style?: any
  /**
   * Test ID for testing
   */
  testID?: string
}

export interface CardHeaderProps extends React.ComponentProps<typeof WebDiv> {
  /**
   * Header content
   */
  children: React.ReactNode
  /**
   * Additional styles (native only)
   */
  style?: any
}

export interface CardContentProps extends React.ComponentProps<typeof WebDiv> {
  /**
   * Content
   */
  children: React.ReactNode
  /**
   * Additional styles (native only)
   */
  style?: any
}

export interface CardFooterProps extends React.ComponentProps<typeof WebDiv> {
  /**
   * Footer content
   */
  children: React.ReactNode
  /**
   * Additional styles (native only)
   */
  style?: any
}

/**
 * Universal Card component that works on both web and native platforms.
 * 
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <h3>Card Title</h3>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Card content goes here</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
export const Card = forwardRef<
  React.ElementRef<typeof WebDiv>,
  CardProps
>(({ className, children, style, testID, ...props }, ref) => {
  if (isWeb) {
    return (
      <WebDiv
        ref={ref}
        className={cn(
          'rounded-lg border bg-card text-card-foreground shadow-sm',
          className
        )}
        data-testid={testID}
        {...props}
      >
        {children}
      </WebDiv>
    )
  }

  // Native implementation
  const cardStyles = getNativeCardStyles()

  return (
    <View
      ref={ref}
      style={[cardStyles, style]}
      testID={testID}
      {...props}
    >
      {children}
    </View>
  )
})

Card.displayName = 'Card'

/**
 * Card header component for displaying titles and descriptions.
 */
export const CardHeader = forwardRef<
  React.ElementRef<typeof WebDiv>,
  CardHeaderProps
>(({ className, children, style, ...props }, ref) => {
  if (isWeb) {
    return (
      <WebDiv
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6', className)}
        {...props}
      >
        {children}
      </WebDiv>
    )
  }

  // Native implementation
  const headerStyles = getNativeHeaderStyles()

  return (
    <View
      ref={ref}
      style={[headerStyles, style]}
      {...props}
    >
      {children}
    </View>
  )
})

CardHeader.displayName = 'CardHeader'

/**
 * Card content component for main content area.
 */
export const CardContent = forwardRef<
  React.ElementRef<typeof WebDiv>,
  CardContentProps
>(({ className, children, style, ...props }, ref) => {
  if (isWeb) {
    return (
      <WebDiv
        ref={ref}
        className={cn('p-6 pt-0', className)}
        {...props}
      >
        {children}
      </WebDiv>
    )
  }

  // Native implementation
  const contentStyles = getNativeContentStyles()

  return (
    <View
      ref={ref}
      style={[contentStyles, style]}
      {...props}
    >
      {children}
    </View>
  )
})

CardContent.displayName = 'CardContent'

/**
 * Card footer component for actions and additional information.
 */
export const CardFooter = forwardRef<
  React.ElementRef<typeof WebDiv>,
  CardFooterProps
>(({ className, children, style, ...props }, ref) => {
  if (isWeb) {
    return (
      <WebDiv
        ref={ref}
        className={cn('flex items-center p-6 pt-0', className)}
        {...props}
      >
        {children}
      </WebDiv>
    )
  }

  // Native implementation
  const footerStyles = getNativeFooterStyles()

  return (
    <View
      ref={ref}
      style={[footerStyles, style]}
      {...props}
    >
      {children}
    </View>
  )
})

CardFooter.displayName = 'CardFooter'