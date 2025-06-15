/**
 * Validation constants including field limits, regex patterns,
 * file size limits, and validation messages
 */

/**
 * Field length limits
 */
export const FIELD_LIMITS = {
  // User fields
  username: {
    min: 3,
    max: 30,
  },
  email: {
    min: 5,
    max: 254, // RFC 5321 standard
  },
  password: {
    min: 8,
    max: 128,
  },
  name: {
    min: 1,
    max: 100,
  },
  firstName: {
    min: 1,
    max: 50,
  },
  lastName: {
    min: 1,
    max: 50,
  },
  bio: {
    min: 0,
    max: 500,
  },
  
  // Content fields
  title: {
    min: 1,
    max: 200,
  },
  description: {
    min: 0,
    max: 1000,
  },
  content: {
    min: 1,
    max: 50000,
  },
  comment: {
    min: 1,
    max: 2000,
  },
  tag: {
    min: 1,
    max: 50,
  },
  category: {
    min: 1,
    max: 100,
  },
  
  // General limits
  url: {
    min: 5,
    max: 2048,
  },
  phone: {
    min: 10,
    max: 15,
  },
  address: {
    min: 5,
    max: 200,
  },
  city: {
    min: 1,
    max: 100,
  },
  state: {
    min: 2,
    max: 100,
  },
  zipCode: {
    min: 5,
    max: 10,
  },
  country: {
    min: 2,
    max: 100,
  },
} as const;

/**
 * Regular expression patterns for validation
 */
export const REGEX_PATTERNS = {
  // Basic patterns
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  phone: /^[+]?[(]?[\d\s\-\(\)]{10,15}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  
  // Username patterns
  username: /^[a-zA-Z0-9_]{3,30}$/,
  usernameStrict: /^[a-zA-Z][a-zA-Z0-9_]{2,29}$/, // Must start with letter
  
  // Password patterns
  passwordWeak: /^.{8,}$/, // At least 8 characters
  passwordMedium: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, // Uppercase, lowercase, number
  passwordStrong: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // + special char
  
  // Name patterns
  name: /^[a-zA-Z\s'-]{1,100}$/,
  firstName: /^[a-zA-Z'-]{1,50}$/,
  lastName: /^[a-zA-Z'-]{1,50}$/,
  
  // Numeric patterns
  integer: /^-?\d+$/,
  positiveInteger: /^\d+$/,
  decimal: /^-?\d+(\.\d+)?$/,
  positiveDecimal: /^\d+(\.\d+)?$/,
  currency: /^\d+(\.\d{2})?$/,
  
  // Date patterns
  dateISO: /^\d{4}-\d{2}-\d{2}$/,
  dateUS: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/,
  time24: /^([01]\d|2[0-3]):([0-5]\d)$/,
  time12: /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i,
  
  // Address patterns
  zipCodeUS: /^\d{5}(-\d{4})?$/,
  zipCodeCA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
  
  // Code patterns
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  base64: /^[A-Za-z0-9+/]*={0,2}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  
  // File patterns
  imageExtension: /\.(jpg|jpeg|png|gif|webp|svg)$/i,
  videoExtension: /\.(mp4|avi|mov|wmv|flv|webm)$/i,
  documentExtension: /\.(pdf|doc|docx|txt|rtf)$/i,
  
  // Social media patterns
  twitterHandle: /^@?[A-Za-z0-9_]{1,15}$/,
  instagramHandle: /^@?[A-Za-z0-9_.]{1,30}$/,
  facebookHandle: /^@?[A-Za-z0-9.]{5,50}$/,
  
  // Special characters
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s]+$/,
  onlyLetters: /^[a-zA-Z]+$/,
  onlyNumbers: /^[0-9]+$/,
} as const;

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  // Image files
  avatarImage: 2 * 1024 * 1024,     // 2MB
  profileImage: 5 * 1024 * 1024,    // 5MB
  contentImage: 10 * 1024 * 1024,   // 10MB
  
  // Document files
  document: 25 * 1024 * 1024,       // 25MB
  pdf: 50 * 1024 * 1024,            // 50MB
  
  // Media files
  audio: 100 * 1024 * 1024,         // 100MB
  video: 500 * 1024 * 1024,         // 500MB
  
  // General limits
  small: 1 * 1024 * 1024,           // 1MB
  medium: 10 * 1024 * 1024,         // 10MB
  large: 100 * 1024 * 1024,         // 100MB
  xlarge: 1024 * 1024 * 1024,       // 1GB
} as const;

/**
 * Allowed file types
 */
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
  video: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
  
  // Combined types
  media: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'],
  all: ['*/*'],
} as const;

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
  // Required fields
  required: 'This field is required',
  requiredField: (field: string) => `${field} is required`,
  
  // Length validation
  tooShort: (field: string, min: number) => `${field} must be at least ${min} characters long`,
  tooLong: (field: string, max: number) => `${field} must be no more than ${max} characters long`,
  exactLength: (field: string, length: number) => `${field} must be exactly ${length} characters long`,
  
  // Format validation
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid phone number',
  invalidUrl: 'Please enter a valid URL',
  invalidDate: 'Please enter a valid date',
  invalidTime: 'Please enter a valid time',
  
  // Password validation
  passwordTooWeak: 'Password must be at least 8 characters long',
  passwordNoUppercase: 'Password must contain at least one uppercase letter',
  passwordNoLowercase: 'Password must contain at least one lowercase letter',
  passwordNoNumber: 'Password must contain at least one number',
  passwordNoSpecialChar: 'Password must contain at least one special character',
  passwordsDoNotMatch: 'Passwords do not match',
  
  // Username validation
  invalidUsername: 'Username can only contain letters, numbers, and underscores',
  usernameTaken: 'This username is already taken',
  
  // File validation
  fileTooLarge: (maxSize: string) => `File size must be less than ${maxSize}`,
  invalidFileType: (allowedTypes: string) => `Only ${allowedTypes} files are allowed`,
  fileRequired: 'Please select a file',
  
  // Numeric validation
  mustBeNumber: 'This field must be a number',
  mustBePositive: 'This field must be a positive number',
  mustBeInteger: 'This field must be a whole number',
  outOfRange: (min: number, max: number) => `Value must be between ${min} and ${max}`,
  
  // Selection validation
  mustSelect: 'Please make a selection',
  mustAccept: 'You must accept the terms and conditions',
  
  // Custom validation
  alreadyExists: (field: string) => `This ${field} already exists`,
  notFound: (field: string) => `${field} not found`,
  expired: (field: string) => `${field} has expired`,
  
  // Network/API errors
  networkError: 'Network error. Please check your connection and try again',
  serverError: 'Server error. Please try again later',
  unauthorized: 'You are not authorized to perform this action',
  forbidden: 'Access denied',
  
  // Generic messages
  somethingWentWrong: 'Something went wrong. Please try again',
  tryAgainLater: 'Please try again later',
  contactSupport: 'If the problem persists, please contact support',
} as const;

/**
 * Validation rules for common fields
 */
export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: REGEX_PATTERNS.email,
    maxLength: FIELD_LIMITS.email.max,
  },
  
  password: {
    required: true,
    minLength: FIELD_LIMITS.password.min,
    maxLength: FIELD_LIMITS.password.max,
    pattern: REGEX_PATTERNS.passwordMedium,
  },
  
  username: {
    required: true,
    minLength: FIELD_LIMITS.username.min,
    maxLength: FIELD_LIMITS.username.max,
    pattern: REGEX_PATTERNS.username,
  },
  
  name: {
    required: true,
    minLength: FIELD_LIMITS.name.min,
    maxLength: FIELD_LIMITS.name.max,
    pattern: REGEX_PATTERNS.name,
  },
  
  phone: {
    required: false,
    pattern: REGEX_PATTERNS.phone,
    minLength: FIELD_LIMITS.phone.min,
    maxLength: FIELD_LIMITS.phone.max,
  },
  
  url: {
    required: false,
    pattern: REGEX_PATTERNS.url,
    maxLength: FIELD_LIMITS.url.max,
  },
} as const;