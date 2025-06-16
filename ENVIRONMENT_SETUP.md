# Environment Configuration Guide

This guide explains how to set up and manage environment variables across the monorepo.

## 🌍 Environment Structure

The monorepo supports multiple environments with proper validation and type safety:

```
├── .env.example              # Root environment template
├── apps/
│   ├── web/
│   │   ├── .env.example      # Web app template
│   │   ├── .env.development  # Development config
│   │   ├── .env.staging      # Staging config
│   │   └── .env.production   # Production config
│   └── mobile/
│       ├── .env.example      # Mobile app template
│       ├── .env.development  # Development config
│       ├── .env.staging      # Staging config
│       └── .env.production   # Production config
```

## 🔧 Setup Instructions

### 1. Initial Setup

```bash
# Copy environment templates
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

### 2. Configure Supabase

1. **Create Supabase projects**:
   - Development: https://your-dev-project.supabase.co
   - Staging: https://your-staging-project.supabase.co
   - Production: https://your-production-project.supabase.co

2. **Get your credentials**:
   - Go to Settings → API in your Supabase dashboard
   - Copy the Project URL and anon/public key
   - Copy the service role key (server-side only)

3. **Update environment files**:
   ```bash
   # Web app (.env.local)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # Mobile app (.env)
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Generate Authentication Secrets

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Add to web .env.local
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
```

## 📱 Platform-Specific Configuration

### Next.js Web App

**Environment Variable Prefixes**:
- `NEXT_PUBLIC_*` - Available in browser and server
- No prefix - Server-side only

**Key Variables**:
```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true
```

### Expo React Native App

**Environment Variable Prefixes**:
- `EXPO_PUBLIC_*` - Available in app
- No prefix - Build-time only

**Key Variables**:
```bash
# Application
EXPO_PUBLIC_APP_SCHEME=starter-template
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_WEB_URL=http://localhost:3000

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Expo
EXPO_PROJECT_ID=your-expo-project-id
EAS_BUILD_PROFILE=development

# Features
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_CAMERA=true
EXPO_PUBLIC_ENABLE_LOCATION_SERVICES=true
```

## 🛡️ Environment Validation

Both apps use Zod schemas for runtime validation:

### Web App Validation
```typescript
// apps/web/src/lib/env.ts
import { validateEnvironment } from './env';

// Validates on app startup
validateEnvironment();
```

### Mobile App Validation
```typescript
// apps/mobile/src/lib/env.ts
import { validateEnvironment } from './env';

// Validates on app startup
validateEnvironment();
```

### Manual Validation
```bash
# Check environment health
pnpm type-check  # Will validate env during compilation
```

## 🔄 Environment Loading

### Next.js Loading Order
1. `.env.local` (highest priority, local overrides)
2. `.env.production` / `.env.staging` / `.env.development`
3. `.env`

### Expo Loading Order
1. `.env` (local environment file)
2. `app.json` extra configuration
3. EAS Build environment variables

## 🌐 Environment-Specific Configurations

### Development
```bash
NODE_ENV=development
DEBUG=true
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
EXPO_PUBLIC_ENABLE_FLIPPER=true
```

### Staging
```bash
NODE_ENV=staging
DEBUG=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true
```

### Production
```bash
NODE_ENV=production
DEBUG=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true
NEXT_PUBLIC_ENABLE_DEVTOOLS=false
```

## 🔑 Required Environment Variables

### All Environments
- `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Web App Only
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### Production Only
- `DATABASE_URL` (for web app)
- Analytics keys (if analytics enabled)
- Error reporting keys (if error reporting enabled)

## 🧪 Testing Environment

Create `.env.test.local` for test-specific overrides:

```bash
# Test environment
NODE_ENV=test
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
DATABASE_URL=postgresql://postgres:password@localhost:5432/test_db
```

## 🔍 Environment Debugging

### Check Current Environment
```typescript
import { getEnvironmentSummary } from '@starter-template/shared/env';

console.log(getEnvironmentSummary());
```

### Web App Debug
```typescript
import { config, isDevelopment } from '../lib/env';

console.log('Environment:', {
  isDev: isDevelopment,
  supabase: config.supabase.url,
  api: config.api.baseUrl,
});
```

### Mobile App Debug
```typescript
import { config, getEnvironmentSummary } from '../lib/env';

console.log('Mobile Environment:', getEnvironmentSummary());
```

## 🚨 Security Best Practices

### DO ✅
- Use `.env.example` files as templates
- Validate environment variables at runtime
- Use different credentials for each environment
- Keep secrets in environment variables, not code
- Use proper prefixes for client-side variables

### DON'T ❌
- Commit actual `.env` files with secrets
- Use production credentials in development
- Put secrets in client-side code
- Share environment files via email/chat
- Use weak or default secrets

## 🔄 CI/CD Environment Variables

### GitHub Actions
```yaml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
```

### Vercel
```bash
# Set via Vercel dashboard or CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXTAUTH_SECRET
```

### EAS Build
```bash
# Set via eas.json or EAS CLI
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your-value"
```

## 🔧 Troubleshooting

### Common Issues

#### "Environment validation failed"
- Check that all required variables are set
- Ensure variables match the expected format (URLs, etc.)
- Check for typos in variable names

#### "Supabase client error"
- Verify Supabase URL and keys are correct
- Check that the Supabase project is active
- Ensure proper prefixes (NEXT_PUBLIC_ or EXPO_PUBLIC_)

#### Variables not available in client-side
- Ensure proper prefixes for client-side variables
- Check that variables are defined in environment files
- Restart development server after changes

### Debug Commands
```bash
# Check environment loading
pnpm dev  # Look for environment validation messages

# Type check (includes env validation)
pnpm type-check

# Check build (validates production env)
pnpm build
```

## 📚 Related Documentation

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Supabase Setup Guide](https://supabase.com/docs/guides/getting-started)
- [EAS Build Configuration](https://docs.expo.dev/build/eas-json/)

## 🆘 Need Help?

1. Check this documentation first
2. Verify your environment files match the examples
3. Run validation commands to identify issues
4. Check the console for specific error messages
5. Refer to platform-specific documentation

---

**Remember**: Never commit real environment files with secrets to version control! 🔒