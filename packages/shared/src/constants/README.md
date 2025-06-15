# Constants Directory

This directory contains organized constants for the shared package, categorized by functionality.

## Structure

- **`index.ts`** - Main export file for all constants
- **`app.ts`** - Application metadata, environment config, feature flags
- **`api.ts`** - API endpoints, HTTP status codes, request timeouts
- **`ui.ts`** - Colors, breakpoints, animations, typography, spacing
- **`validation.ts`** - Field limits, regex patterns, validation messages
- **`routes.ts`** - Route constants for web and mobile navigation
- **`storage.ts`** - Storage keys, cache config, sync settings

## Usage Examples

### Importing specific constants

```typescript
// Import specific constants
import { APP_METADATA, FEATURE_FLAGS } from '@starter-template/shared/constants';
import { API_ENDPOINTS, HTTP_STATUS } from '@starter-template/shared/constants';
import { COLORS, BREAKPOINTS } from '@starter-template/shared/constants';

// Use in your code
console.log(APP_METADATA.name); // "Starter Template"
const isFeatureEnabled = FEATURE_FLAGS.enableDarkMode;
const loginUrl = API_ENDPOINTS.auth.login;
const primaryColor = COLORS.light.primary;
```

### Importing entire modules

```typescript
// Import entire modules
import * as AppConstants from '@starter-template/shared/constants/app';
import * as UIConstants from '@starter-template/shared/constants/ui';
import * as ValidationConstants from '@starter-template/shared/constants/validation';

// Use namespaced constants
const appName = AppConstants.APP_METADATA.name;
const primaryColor = UIConstants.COLORS.light.primary;
const emailPattern = ValidationConstants.REGEX_PATTERNS.email;
```

### Environment-specific usage

```typescript
import { CURRENT_ENV, ENV_CONFIG, API_BASE_URL } from '@starter-template/shared/constants';

// Get current environment configuration
const config = ENV_CONFIG[CURRENT_ENV];
console.log('Debug mode:', config.debugMode);
console.log('API URL:', API_BASE_URL);
```

### Form validation

```typescript
import { 
  FIELD_LIMITS, 
  REGEX_PATTERNS, 
  VALIDATION_MESSAGES 
} from '@starter-template/shared/constants';

// Validate email
const email = 'user@example.com';
const isValidEmail = REGEX_PATTERNS.email.test(email);

// Check length limits
const username = 'john_doe';
const isValidLength = username.length >= FIELD_LIMITS.username.min && 
                     username.length <= FIELD_LIMITS.username.max;

// Get error message
const errorMessage = VALIDATION_MESSAGES.invalidEmail;
```

### Theme and styling

```typescript
import { COLORS, BREAKPOINTS, ANIMATIONS, SPACING } from '@starter-template/shared/constants';

// Theme colors
const lightTheme = COLORS.light;
const darkTheme = COLORS.dark;

// Responsive design
const isMobile = window.innerWidth < BREAKPOINTS.tablet;

// Animations
const fadeInDuration = ANIMATIONS.fade;

// Spacing
const componentPadding = SPACING.paddingMd;
```

### Navigation and routing

```typescript
import { PUBLIC_ROUTES, PROTECTED_ROUTES, MOBILE_SCREENS } from '@starter-template/shared/constants';

// Web routes
const loginRoute = PUBLIC_ROUTES.LOGIN;
const dashboardRoute = PROTECTED_ROUTES.DASHBOARD;
const blogPostRoute = PUBLIC_ROUTES.BLOG_POST('my-post-slug');

// Mobile screens
const homeScreen = MOBILE_SCREENS.HOME;
const profileScreen = MOBILE_SCREENS.PROFILE;
```

## Type Safety

All constants are properly typed with TypeScript:

- Use `as const` assertions for immutable objects
- Provide union types for enums and options
- Include proper JSDoc documentation
- Support cross-platform usage (web and mobile)

## Platform Compatibility

These constants are designed to work across:

- **Web**: Next.js applications
- **Mobile**: React Native applications  
- **Server**: Node.js backend services

Environment-specific constants automatically adapt based on `NODE_ENV` and platform detection.