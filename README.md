# Starter Template Monorepo

A comprehensive, production-ready monorepo starter template built with modern technologies and best practices. This template provides a solid foundation for building scalable web and mobile applications with shared components, utilities, and a complete backend infrastructure.

## 🏗️ Architecture

This monorepo follows a modular architecture with clear separation of concerns:

```
starter-template/
├── apps/
│   ├── web/          # Next.js 14 web application with tRPC
│   └── mobile/       # Expo React Native application
├── packages/
│   ├── ui/           # Cross-platform component library
│   ├── database/     # Supabase integration with full API layer
│   └── shared/       # Common utilities, types, and state management
├── docs/             # Documentation
└── turbo.json        # Turborepo configuration
```

## 🚀 What's Included

### Applications

#### 📱 **Mobile App** (`apps/mobile`)
- **Framework**: Expo React Native with TypeScript
- **Navigation**: Expo Router with file-based routing
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Authentication**: Complete auth flow with Supabase
- **State Management**: Zustand + TanStack Query integration
- **Features**:
  - Tab-based navigation (Home, Explore, Profile)
  - Cross-platform components
  - Protected routes with auth guards
  - Optimized build configuration
  - Hot reload development

#### 🌐 **Web App** (`apps/web`)
- **Framework**: Next.js 14 with App Router
- **API Layer**: tRPC for type-safe API calls
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Complete auth system with session management
- **State Management**: Zustand + TanStack Query integration
- **Documentation**: Interactive API docs with Swagger UI
- **Features**:
  - Server-side rendering (SSR)
  - Type-safe API routes with tRPC
  - Interactive API documentation at `/api/docs`
  - Responsive design system
  - Authentication guards and middleware
  - Environment configuration with validation
  - Development tools integration

### Packages

#### 🧩 **UI Package** (`packages/ui`)
- **Cross-platform component library** that works on both web and mobile
- **Components included**:
  - Button with multiple variants and loading states
  - Input with validation and error states
  - Card layouts and containers
  - Typography system with consistent scaling
  - Authentication components (forms, guards)
  - Loading and error boundary components
- **Documentation**: Storybook integration with comprehensive examples
- **Build**: Rollup for optimized bundling
- **Features**:
  - TypeScript support with strict typing
  - Platform detection and adaptive rendering
  - Consistent design tokens across platforms
  - Tree-shakeable exports
  - Accessibility support

#### 🗃️ **Database Package** (`packages/database`)
- **Supabase integration** with comprehensive API layer
- **Features**:
  - Type-safe database client with auto-generated types
  - Complete authentication system (OAuth, magic links, MFA)
  - Row Level Security (RLS) policies and templates
  - Migration system with version control
  - **NEW: Complete API Layer**:
    - Type-safe query and mutation functions
    - Comprehensive error handling with custom error types
    - Input validation with Zod schemas
    - Authorization checks and permission systems
    - Pagination, sorting, and filtering utilities
    - File upload and storage management
  - Real-time subscriptions
  - Connection pooling and performance optimization

#### 🔧 **Shared Package** (`packages/shared`)
- **Common utilities and types** used across all applications
- **Modules**:
  - **Types**: API responses, user models, database schemas
  - **Utils**: Date formatting, validation, array/object helpers
  - **Constants**: App metadata, API endpoints, design tokens
  - **API Client**: Configurable HTTP client with retry logic and auth
  - **Auth**: Authentication guards, permissions, session management
  - **Errors**: Structured error handling and recovery patterns
  - **NEW: Advanced State Management**:
    - Zustand stores with persistence and subscriptions
    - TanStack Query setup with caching strategies
    - Optimistic updates with automatic rollback
    - Loading states and error boundaries
    - Cross-platform state synchronization
  - **NEW: Environment Management**:
    - Zod-based environment validation
    - Type-safe environment variables
    - Multiple environment configurations
    - Runtime environment checks
- **Cross-platform support**: React, React Native, Node.js
- **Testing**: Comprehensive test suite with Jest

## 🛠️ Technology Stack

### Core Technologies
- **Package Manager**: pnpm (with workspaces)
- **Build System**: Turborepo for optimal caching and parallelization
- **Languages**: TypeScript (strict mode)
- **Linting**: ESLint with shared configurations
- **Formatting**: Prettier with consistent rules
- **Git Workflow**: Husky + lint-staged + commitizen

### Frontend
- **Web**: Next.js 14, React 18, Tailwind CSS, shadcn/ui
- **Mobile**: Expo, React Native, NativeWind, Expo Router
- **Shared UI**: Custom component library with Storybook
- **State Management**: Zustand + TanStack Query
- **API Layer**: tRPC for type-safe client-server communication

### Backend & Database
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth with RLS and session management
- **API**: tRPC with type-safe endpoints and automatic validation
- **Validation**: Zod schemas for runtime type checking
- **File Storage**: Supabase Storage with upload utilities
- **Real-time**: Supabase real-time subscriptions

### Development Tools
- **Git Hooks**: Husky + lint-staged for pre-commit checks
- **Commits**: Conventional commits with commitizen
- **Testing**: Jest with comprehensive coverage
- **Documentation**: Storybook for components + Swagger for APIs
- **Environment**: Zod-based environment validation
- **Type Safety**: Full type safety from database to frontend

## 📦 Package Scripts

### Root Commands
```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm build            # Build all packages and apps
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript type checking
pnpm format           # Format all code with Prettier
pnpm test             # Run all tests
pnpm clean            # Clean all build artifacts

# Git workflow
pnpm commit           # Interactive commit with conventional commits
pnpm prepare          # Set up git hooks
```

### Individual Package Commands
```bash
# Web app
cd apps/web
pnpm dev              # Next.js development server
pnpm build            # Production build
pnpm start            # Start production server
pnpm type-check       # TypeScript checking

# Mobile app  
cd apps/mobile
pnpm start            # Start Expo development server
pnpm android          # Run on Android
pnpm ios              # Run on iOS
pnpm type-check       # TypeScript checking

# UI package
cd packages/ui
pnpm dev              # Storybook development
pnpm build            # Build component library
pnpm storybook        # Start Storybook
pnpm type-check       # TypeScript checking

# Database package
cd packages/database
pnpm generate         # Generate types from Supabase
pnpm migrate          # Run migrations
pnpm type-check       # TypeScript checking

# Shared package
cd packages/shared
pnpm test             # Run tests
pnpm build            # Build utilities
pnpm type-check       # TypeScript checking
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- Git
- Supabase account (for database features)

### Setup
1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url> starter-template
   cd starter-template
   pnpm install
   ```

2. **Environment setup**:
   ```bash
   # Copy environment templates
   cp apps/web/.env.example apps/web/.env.local
   cp apps/mobile/.env.example apps/mobile/.env
   cp packages/database/.env.example packages/database/.env
   cp packages/shared/.env.example packages/shared/.env

   # Configure your environment variables:
   # - Supabase URL and keys
   # - API endpoints
   # - Authentication providers
   # - Other service credentials
   ```

3. **Database setup** (Supabase):
   ```bash
   # Set up your Supabase project
   # Add your SUPABASE_URL and SUPABASE_ANON_KEY to environment files
   
   cd packages/database
   pnpm generate    # Generate types from your Supabase project
   pnpm migrate     # Run initial migrations (if needed)
   ```

4. **Start development**:
   ```bash
   pnpm dev         # Starts all applications
   ```

### Development Workflow
1. **Web development**: Visit `http://localhost:3000`
2. **API documentation**: Visit `http://localhost:3000/api/docs`
3. **Mobile development**: Use Expo Go app or simulator
4. **Component development**: Visit Storybook at `http://localhost:6006`
5. **Database changes**: Update schemas in Supabase, then run `pnpm generate`

## 🔐 Authentication & Authorization

The template includes a comprehensive authentication system that works across all platforms:

### Features
- **Multi-platform auth**: Seamless authentication on web and mobile
- **Multiple auth methods**: Email/password, OAuth, magic links, MFA
- **Token management**: JWT with automatic refresh and secure storage
- **Role-based access**: Flexible permission and role system
- **Route protection**: Guards for pages, API routes, and components
- **Session management**: Persistent sessions with automatic cleanup
- **Security**: Row Level Security (RLS) policies in database

### Authentication Components
```typescript
// Authentication hooks (works on both platforms)
import { useAuth, useAuthGuard } from '@starter-template/database/auth';

function ProtectedComponent() {
  const { user, isLoading, signOut } = useAuth();
  const { canAccess } = useAuthGuard(['admin', 'user']);
  
  if (isLoading) return <Loading />;
  if (!canAccess) return <Unauthorized />;
  
  return <div>Welcome {user?.email}</div>;
}

// Route protection
import { withAuthGuard } from '@starter-template/database/auth';

export default withAuthGuard(MyPage, {
  requiredRoles: ['admin'],
  redirectTo: '/login'
});
```

### API Authentication
```typescript
// tRPC procedures with authentication
import { privateProcedure, adminProcedure } from '@/lib/trpc/server';

// Requires authentication
const getUserProfile = privateProcedure
  .query(async ({ ctx }) => {
    return ctx.queries.users.getCurrentUserProfile();
  });

// Requires admin role
const deleteUser = adminProcedure
  .input(z.object({ userId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    return ctx.mutations.users.deleteUserProfile(input.userId);
  });
```

## 🗄️ API Layer & Database

### tRPC Integration
- **Type-safe APIs**: End-to-end type safety from database to client
- **Automatic validation**: Zod schemas for request/response validation
- **Authentication middleware**: Built-in auth checks and user context
- **Error handling**: Comprehensive error types and handling
- **Rate limiting**: Built-in rate limiting for API endpoints

### Database Operations
```typescript
// Type-safe database queries
import { createDatabaseQueries } from '@starter-template/database/api';

const queries = createDatabaseQueries(supabase);

// Get user profile with full type safety
const profile = await queries.users.getUserProfile(userId);

// Search with pagination and filtering
const results = await queries.users.searchUserProfiles('john', {
  page: 1,
  limit: 20,
  sort_field: 'created_at',
  sort_direction: 'desc'
});
```

### API Documentation
- **Interactive docs**: Swagger UI at `/api/docs`
- **Complete schemas**: All request/response types documented
- **Try it out**: Test API endpoints directly from the documentation
- **Error examples**: Comprehensive error response documentation

## 🎛️ State Management

### Zustand Stores
```typescript
// User state management
import { useUserStore } from '@starter-template/shared/store';

function UserProfile() {
  const { user, preferences, updatePreferences } = useUserStore();
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <Settings 
        preferences={preferences}
        onUpdate={updatePreferences}
      />
    </div>
  );
}
```

### TanStack Query Integration
```typescript
// Server state with caching and optimistic updates
import { trpc } from '@/lib/trpc/client';

function UserList() {
  const { data, isLoading, error } = trpc.user.searchProfiles.useQuery({
    query: 'john',
    params: { limit: 20 }
  });
  
  const updateProfile = trpc.user.updateCurrentProfile.useMutation({
    onSuccess: () => {
      // Automatic cache invalidation
    }
  });
  
  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  
  return <ProfileList profiles={data?.data} />;
}
```

## 🎨 Design System

### Cross-Platform Components
```typescript
// Components work on both web and mobile
import { Button, Input, Card } from '@starter-template/ui';

function LoginForm() {
  return (
    <Card>
      <Input 
        placeholder="Email"
        type="email"
        validation="email"
      />
      <Input 
        placeholder="Password"
        type="password"
        secure
      />
      <Button 
        variant="primary"
        loading={isLoading}
        onPress={handleLogin}
      >
        Sign In
      </Button>
    </Card>
  );
}
```

### Consistent Styling
- **Design tokens**: Shared colors, typography, and spacing
- **Responsive design**: Mobile-first with adaptive layouts
- **Theme support**: Dark/light mode infrastructure
- **Accessibility**: Built-in accessibility features

## 🧪 Testing Strategy

### Comprehensive Testing
- **Unit tests**: Individual functions and components
- **Integration tests**: API clients and database utilities
- **Type tests**: TypeScript type safety validation
- **Component tests**: UI component behavior across platforms

### Running Tests
```bash
# All tests with coverage
pnpm test

# Package-specific tests
cd packages/shared && pnpm test
cd packages/database && pnpm test

# Watch mode for development
pnpm test:watch

# Type checking
pnpm type-check
```

## 🔧 Development Tools

### Code Quality
- **ESLint**: Comprehensive linting rules
- **Prettier**: Automatic code formatting
- **Husky**: Git hooks for quality checks
- **lint-staged**: Only lint changed files
- **Commitizen**: Interactive conventional commits

### Environment Management
```typescript
// Type-safe environment variables
import { env } from '@starter-template/shared/env';

// Automatically validated at runtime
const apiUrl = env.NEXT_PUBLIC_API_URL;
const dbUrl = env.SUPABASE_URL;
```

### Performance Optimization
- **Turborepo caching**: Intelligent build caching
- **Code splitting**: Automatic code splitting in Next.js
- **Tree shaking**: Remove unused code
- **Bundle analysis**: Optimize bundle sizes
- **Image optimization**: Next.js image optimization

## 📚 API Documentation

### Interactive Documentation
Visit `/api/docs` in your web application to access:
- **Complete API reference**: All endpoints with examples
- **Interactive testing**: Try API calls directly from the browser
- **Schema documentation**: Request/response type definitions
- **Authentication examples**: How to authenticate API calls

### Code Examples
Every API endpoint includes:
- TypeScript type definitions
- Request/response examples
- Error handling examples
- Authentication requirements

## 🚀 Deployment

### Web App (Vercel - Recommended)
```bash
# Build for production
cd apps/web
pnpm build

# Deploy to Vercel
vercel deploy

# Environment variables needed:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Mobile App (EAS Build)
```bash
# Build for production
cd apps/mobile
eas build --platform all

# Submit to stores
eas submit --platform all
```

### Database Setup
1. Create Supabase project
2. Set up authentication providers
3. Configure RLS policies
4. Add environment variables to deployment platform

## 🔍 Troubleshooting

### Common Issues

1. **Type errors after database changes**:
   ```bash
   cd packages/database
   pnpm generate  # Regenerate types from Supabase
   ```

2. **Authentication not working**:
   - Check environment variables are set
   - Verify Supabase project configuration
   - Check RLS policies are properly configured

3. **tRPC errors**:
   - Ensure tRPC client is properly configured
   - Check API route setup in Next.js
   - Verify authentication middleware

4. **Build failures**:
   ```bash
   pnpm clean      # Clear all caches
   pnpm install    # Reinstall dependencies
   pnpm build      # Rebuild everything
   ```

### Debug Commands
```bash
# Check package versions and dependencies
pnpm list

# Clear all caches and rebuild
pnpm clean && pnpm build

# Verbose build output
pnpm build --verbose

# Type checking across all packages
pnpm type-check
```

## 📊 Monitoring & Analytics

### Built-in Monitoring
- **Error boundaries**: Catch and handle React errors
- **API error tracking**: Structured error logging
- **Performance metrics**: Core Web Vitals tracking
- **Bundle analysis**: Monitor bundle sizes

### Adding Analytics
The template is ready for analytics integration:
- **Web**: Google Analytics, Mixpanel, or custom
- **Mobile**: Expo Analytics or Firebase Analytics
- **API**: Request logging and monitoring

## 🤝 Contributing

### Development Guidelines
1. **Follow TypeScript best practices**
2. **Write tests for new features**
3. **Use conventional commits**
4. **Update documentation**
5. **Ensure cross-platform compatibility**

### Pull Request Process
1. Create feature branch from `main`
2. Make changes with comprehensive tests
3. Run `pnpm lint` and `pnpm type-check`
4. Update relevant documentation
5. Submit PR with clear description

## 📈 Scalability Features

### Performance
- **Optimistic updates**: Instant UI feedback
- **Caching strategies**: Intelligent data caching
- **Code splitting**: Load only what's needed
- **Image optimization**: Automatic image optimization
- **Bundle optimization**: Tree shaking and minification

### Architecture
- **Modular design**: Easy to extend and modify
- **Type safety**: Catch errors at compile time
- **Error boundaries**: Graceful error handling
- **Monitoring ready**: Built for production monitoring

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with these amazing technologies:
- [Next.js](https://nextjs.org/) - React framework
- [Expo](https://expo.dev/) - React Native platform
- [Turborepo](https://turbo.build/) - Monorepo build system
- [Supabase](https://supabase.com/) - Backend as a Service
- [tRPC](https://trpc.io/) - Type-safe APIs
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [TypeScript](https://typescriptlang.org/) - Type safety
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [TanStack Query](https://tanstack.com/query) - Server state management

---

## 🎯 What's New in This Version

### Major Additions
✅ **Complete API Layer**: Type-safe database operations with tRPC integration  
✅ **Advanced State Management**: Zustand + TanStack Query with optimistic updates  
✅ **Environment Management**: Zod-based environment validation  
✅ **Authentication System**: Complete auth flow with guards and middleware  
✅ **API Documentation**: Interactive Swagger UI documentation  
✅ **Development Tools**: ESLint, Prettier, Husky, commitizen integration  

### Ready for Production
This starter template now includes everything you need for a production-ready application:
- 🔒 **Security**: Authentication, authorization, and RLS policies
- 📊 **Performance**: Optimized builds, caching, and loading strategies
- 🧪 **Quality**: Comprehensive testing and type safety
- 📚 **Documentation**: Complete API and component documentation
- 🚀 **Deployment**: Ready for Vercel, mobile app stores, and more

**Ready to build something amazing?** 🚀

Start exploring the applications and packages, then customize to fit your specific needs. The comprehensive architecture provides a solid foundation for any scale of application.