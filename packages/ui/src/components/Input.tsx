import React, { forwardRef } from 'react'
import { cn, isWeb } from '../utils'
import { theme } from '../theme'

// Web imports (conditional)
let WebInput: any = null
if (isWeb) {
  WebInput = 'input'
}

// Native imports (conditional)
let TextInput: any = null
if (!isWeb) {
  try {
    const RN = require('react-native')
    TextInput = RN.TextInput
  } catch {
    // React Native not available
  }
}

/**
 * Get native input styles
 */
const getNativeInputStyles = (hasError?: boolean) => {
  return {
    borderWidth: 1,
    borderColor: hasError ? '#EF4444' : '#D1D5DB',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    fontSize: theme.typography.fontSize.base.fontSize,
    lineHeight: theme.typography.fontSize.base.lineHeight,
    color: '#374151',
    backgroundColor: '#FFFFFF',
    minHeight: 40,
  }
}

export interface InputProps
  extends Omit<
    React.ComponentProps<typeof WebInput>,
    'onChange' | 'onChangeText' | 'style' | 'value'
  > {
  /**
   * Input value
   */
  value?: string
  /**
   * Placeholder text
   */
  placeholder?: string
  /**
   * Change handler for web (event) and native (text)
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  /**
   * Change handler for native (text directly)
   */
  onChangeText?: (text: string) => void
  /**
   * Whether the input has an error state
   */
  error?: boolean
  /**
   * Whether the input is disabled
   */
  disabled?: boolean
  /**
   * Additional styles (native only)
   */
  style?: any
  /**
   * Test ID for testing
   */
  testID?: string
  /**
   * Input type (web only)
   */
  type?: string
  /**
   * Whether to secure text entry (native only)
   */
  secureTextEntry?: boolean
  /**
   * Keyboard type (native only)
   */
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad'
  /**
   * Auto capitalization (native only)
   */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  /**
   * Auto correct (native only)
   */
  autoCorrect?: boolean
  /**
   * Return key type (native only)
   */
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send'
  /**
   * Blur handler
   */
  onBlur?: (event: any) => void
  /**
   * Focus handler
   */
  onFocus?: (event: any) => void
  /**
   * Submit editing handler (native only)
   */
  onSubmitEditing?: () => void
  /**
   * Multiline input (native only)
   */
  multiline?: boolean
  /**
   * Number of lines (native only)
   */
  numberOfLines?: number
}

/**
 * Universal Input component that works on both web and native platforms.
 * 
 * @example
 * ```tsx
 * <Input
 *   placeholder="Enter your email"
 *   value={email}
 *   onChangeText={setEmail}
 *   keyboardType="email-address"
 * />
 * ```
 */
export const Input = forwardRef<
  React.ElementRef<typeof WebInput>,
  InputProps
>(({ 
  className,
  type = 'text',
  error,
  disabled,
  onChange,
  onChangeText,
  value,
  placeholder,
  style,
  testID,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  returnKeyType = 'done',
  onBlur,
  onFocus,
  onSubmitEditing,
  multiline,
  numberOfLines,
  ...props 
}, ref) => {
  if (isWeb) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event)
      onChangeText?.(event.target.value)
    }

    return (
      <WebInput
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        disabled={disabled}
        onBlur={onBlur}
        onFocus={onFocus}
        data-testid={testID}
        {...props}
      />
    )
  }

  // Native implementation
  const inputStyles = getNativeInputStyles(error)

  return (
    <TextInput
      ref={ref}
      style={[inputStyles, style]}
      value={value}
      placeholder={placeholder}
      onChangeText={onChangeText}
      editable={!disabled}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      returnKeyType={returnKeyType}
      onBlur={onBlur}
      onFocus={onFocus}
      onSubmitEditing={onSubmitEditing}
      multiline={multiline}
      numberOfLines={numberOfLines}
      placeholderTextColor="#9CA3AF"
      testID={testID}
      {...props}
    />
  )
})

Input.displayName = 'Input'