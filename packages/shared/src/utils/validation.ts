/**
 * Validation utility functions for forms and data validation
 */

/**
 * Email validation regex pattern
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * URL validation regex pattern
 */
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

/**
 * Phone number validation regex (flexible format)
 */
const PHONE_REGEX = /^[\+]?[1-9]?[\d\s\-\(\)\.]{7,15}$/;

/**
 * Strong password requirements
 */
const PASSWORD_REGEX = {
  minLength: /.{8,}/,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/
};

/**
 * Validates an email address
 * @param email - Email to validate
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validates a URL
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return URL_REGEX.test(url.trim());
}

/**
 * Validates a phone number
 * @param phone - Phone number to validate
 * @returns True if valid phone number
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\s/g, '');
  return PHONE_REGEX.test(cleaned);
}

/**
 * Password strength levels
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

/**
 * Password validation result
 */
export interface PasswordValidation {
  isValid: boolean;
  strength: PasswordStrength;
  score: number;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
  suggestions: string[];
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @param minLength - Minimum length requirement (default: 8)
 * @returns Password validation result
 */
export function validatePassword(password: string, minLength = 8): PasswordValidation {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      strength: 'weak',
      score: 0,
      requirements: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false
      },
      suggestions: ['Password is required']
    };
  }

  const requirements = {
    minLength: password.length >= minLength,
    hasUppercase: PASSWORD_REGEX.hasUppercase.test(password),
    hasLowercase: PASSWORD_REGEX.hasLowercase.test(password),
    hasNumber: PASSWORD_REGEX.hasNumber.test(password),
    hasSpecial: PASSWORD_REGEX.hasSpecial.test(password)
  };

  const score = Object.values(requirements).filter(Boolean).length;
  const suggestions: string[] = [];

  if (!requirements.minLength) {
    suggestions.push(`Password must be at least ${minLength} characters long`);
  }
  if (!requirements.hasUppercase) {
    suggestions.push('Password must contain at least one uppercase letter');
  }
  if (!requirements.hasLowercase) {
    suggestions.push('Password must contain at least one lowercase letter');
  }
  if (!requirements.hasNumber) {
    suggestions.push('Password must contain at least one number');
  }
  if (!requirements.hasSpecial) {
    suggestions.push('Password must contain at least one special character');
  }

  let strength: PasswordStrength;
  if (score <= 2) strength = 'weak';
  else if (score === 3) strength = 'fair';
  else if (score === 4) strength = 'good';
  else strength = 'strong';

  return {
    isValid: score >= 4, // Require at least 4/5 criteria
    strength,
    score,
    requirements,
    suggestions
  };
}

/**
 * Validates if a string is not empty
 * @param value - Value to validate
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export function isRequired(value: string, fieldName = 'Field'): { isValid: boolean; message?: string } {
  const isValid = Boolean(value && value.trim().length > 0);
  return {
    isValid,
    message: isValid ? undefined : `${fieldName} is required`
  };
}

/**
 * Validates minimum length
 * @param value - Value to validate
 * @param minLength - Minimum length
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export function minLength(
  value: string,
  minLength: number,
  fieldName = 'Field'
): { isValid: boolean; message?: string } {
  const isValid = value && value.length >= minLength;
  return {
    isValid,
    message: isValid ? undefined : `${fieldName} must be at least ${minLength} characters long`
  };
}

/**
 * Validates maximum length
 * @param value - Value to validate
 * @param maxLength - Maximum length
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export function maxLength(
  value: string,
  maxLength: number,
  fieldName = 'Field'
): { isValid: boolean; message?: string } {
  const isValid = !value || value.length <= maxLength;
  return {
    isValid,
    message: isValid ? undefined : `${fieldName} must be no more than ${maxLength} characters long`
  };
}

/**
 * Validates numeric values
 * @param value - Value to validate
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export function isNumeric(value: string, fieldName = 'Field'): { isValid: boolean; message?: string } {
  const isValid = !isNaN(Number(value)) && !isNaN(parseFloat(value));
  return {
    isValid,
    message: isValid ? undefined : `${fieldName} must be a valid number`
  };
}

/**
 * Validates if value is within a numeric range
 * @param value - Value to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export function isInRange(
  value: number,
  min: number,
  max: number,
  fieldName = 'Field'
): { isValid: boolean; message?: string } {
  const isValid = value >= min && value <= max;
  return {
    isValid,
    message: isValid ? undefined : `${fieldName} must be between ${min} and ${max}`
  };
}

/**
 * Validates if value matches a pattern
 * @param value - Value to validate
 * @param pattern - Regex pattern
 * @param fieldName - Field name for error message
 * @param patternDescription - Description of the pattern
 * @returns Validation result
 */
export function matchesPattern(
  value: string,
  pattern: RegExp,
  fieldName = 'Field',
  patternDescription = 'the required format'
): { isValid: boolean; message?: string } {
  const isValid = pattern.test(value);
  return {
    isValid,
    message: isValid ? undefined : `${fieldName} must match ${patternDescription}`
  };
}

/**
 * Validates if two values match (useful for password confirmation)
 * @param value1 - First value
 * @param value2 - Second value
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export function valuesMatch(
  value1: string,
  value2: string,
  fieldName = 'Fields'
): { isValid: boolean; message?: string } {
  const isValid = value1 === value2;
  return {
    isValid,
    message: isValid ? undefined : `${fieldName} do not match`
  };
}

/**
 * Form field validation rule
 */
export interface ValidationRule {
  validator: (value: any) => { isValid: boolean; message?: string };
  message?: string;
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates a form with multiple fields and rules
 * @param data - Form data
 * @param rules - Validation rules for each field
 * @returns Form validation result
 */
export function validateForm(
  data: Record<string, any>,
  rules: Record<string, ValidationRule[]>
): FormValidationResult {
  const errors: Record<string, string> = {};

  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const value = data[fieldName];
    
    for (const rule of fieldRules) {
      const result = rule.validator(value);
      if (!result.isValid) {
        errors[fieldName] = rule.message || result.message || 'Invalid value';
        break; // Stop at first error for this field
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Common validation rules factory
 */
export const ValidationRules = {
  required: (fieldName = 'Field'): ValidationRule => ({
    validator: (value) => isRequired(value, fieldName)
  }),
  
  email: (fieldName = 'Email'): ValidationRule => ({
    validator: (value) => ({
      isValid: !value || isValidEmail(value),
      message: `${fieldName} must be a valid email address`
    })
  }),
  
  url: (fieldName = 'URL'): ValidationRule => ({
    validator: (value) => ({
      isValid: !value || isValidUrl(value),
      message: `${fieldName} must be a valid URL`
    })
  }),
  
  phone: (fieldName = 'Phone'): ValidationRule => ({
    validator: (value) => ({
      isValid: !value || isValidPhone(value),
      message: `${fieldName} must be a valid phone number`
    })
  }),
  
  minLength: (min: number, fieldName = 'Field'): ValidationRule => ({
    validator: (value) => minLength(value, min, fieldName)
  }),
  
  maxLength: (max: number, fieldName = 'Field'): ValidationRule => ({
    validator: (value) => maxLength(value, max, fieldName)
  }),
  
  numeric: (fieldName = 'Field'): ValidationRule => ({
    validator: (value) => isNumeric(value, fieldName)
  }),
  
  range: (min: number, max: number, fieldName = 'Field'): ValidationRule => ({
    validator: (value) => isInRange(Number(value), min, max, fieldName)
  }),
  
  pattern: (pattern: RegExp, fieldName = 'Field', description = 'the required format'): ValidationRule => ({
    validator: (value) => matchesPattern(value, pattern, fieldName, description)
  }),
  
  match: (otherValue: string, fieldName = 'Fields'): ValidationRule => ({
    validator: (value) => valuesMatch(value, otherValue, fieldName)
  })
};

/**
 * Sanitizes input by removing potentially harmful characters
 * @param input - Input to sanitize
 * @returns Sanitized input
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates and sanitizes user input
 * @param input - Input to validate and sanitize
 * @param maxLength - Maximum allowed length
 * @returns Validated and sanitized input
 */
export function validateAndSanitizeInput(
  input: string,
  maxLength = 1000
): { isValid: boolean; sanitized: string; message?: string } {
  if (!input || typeof input !== 'string') {
    return { isValid: false, sanitized: '', message: 'Input is required' };
  }
  
  if (input.length > maxLength) {
    return {
      isValid: false,
      sanitized: '',
      message: `Input must not exceed ${maxLength} characters`
    };
  }
  
  const sanitized = sanitizeInput(input);
  return { isValid: true, sanitized };
}