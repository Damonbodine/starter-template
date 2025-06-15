# Starter Template Monorepo

A comprehensive, production-ready monorepo starter template built with modern technologies and best practices. This template provides a solid foundation for building scalable web and mobile applications with shared components and utilities.

## 🏗️ Architecture

This monorepo follows a modular architecture with clear separation of concerns:

```
starter-template/
├── apps/
│   ├── web/          # Next.js 14 web application
│   └── mobile/       # Expo React Native application
├── packages/
│   ├── ui/           # Shared component library
│   ├── database/     # Supabase integration layer
│   └── shared/       # Common utilities and types
├── docs/             # Documentation
└── turbo.json        # Turborepo configuration
```

## 🚀 What's Included

### Applications

#### 📱 **Mobile App** (`apps/mobile`)
- **Framework**: Expo React Native with TypeScript
- **Navigation**: Expo Router with file-based routing
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Features**:
  - Tab-based navigation (Home, Explore, Profile)
  - Cross-platform components
  - Optimized build configuration
  - Hot reload development

#### 🌐 **Web App** (`apps/web`)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Features**:
  - Server-side rendering (SSR)
  - Responsive design system
  - Optimized performance
  - SEO-friendly
  - Navigation with active states
  - Dark/light theme support ready

### Packages

#### 🧩 **UI Package** (`packages/ui`)
- **Cross-platform component library** that works on both web and mobile
- **Components included**:
  - Button with multiple variants
  - Input with validation states
  - Card layouts
  - Typography system
- **Documentation**: Storybook integration
- **Build**: Rollup for optimized bundling
- **Features**:
  - TypeScript support
  - Platform detection
  - Consistent design tokens
  - Tree-shakeable exports

#### 🗃️ **Database Package** (`packages/database`)
- **Supabase integration** with full TypeScript support
- **Features**:
  - Type-safe database client
  - Automated type generation
  - Migration system
  - Row Level Security (RLS) templates
  - CRUD utilities
  - Zod schema validation
  - Connection pooling
  - Error handling

#### 🔧 **Shared Package** (`packages/shared`)
- **Common utilities and types** used across all applications
- **Modules**:
  - **Types**: Common interfaces, API responses, user models
  - **Utils**: Date formatting, validation, array/object helpers
  - **Constants**: App metadata, API endpoints, design tokens
  - **API Client**: Configurable HTTP client with retry logic
  - **Auth**: Authentication guards, permissions, token management
  - **Errors**: Structured error handling and reporting
- **Cross-platform support**: React, React Native, Node.js
- **Testing**: Comprehensive test suite with Jest

## 🛠️ Technology Stack

### Core Technologies
- **Package Manager**: pnpm (with workspaces)
- **Build System**: Turborepo for optimal caching and parallelization
- **Languages**: TypeScript (strict mode)
- **Linting**: ESLint with shared configurations
- **Formatting**: Prettier with consistent rules

### Frontend
- **Web**: Next.js 14, React 18, Tailwind CSS, shadcn/ui
- **Mobile**: Expo, React Native, NativeWind, Expo Router
- **Shared UI**: Custom component library with Storybook

### Backend & Database
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth with RLS
- **API**: RESTful with TypeScript types
- **Validation**: Zod schemas

### Development Tools
- **Git Hooks**: Husky + lint-staged
- **Commits**: Conventional commits with commitizen
- **Testing**: Jest with comprehensive coverage
- **Documentation**: Storybook for components

## 📦 Package Scripts

### Root Commands
```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm build            # Build all packages and apps
pnpm lint             # Lint all packages
pnpm format           # Format all code with Prettier
pnpm test             # Run all tests

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

# Mobile app  
cd apps/mobile
pnpm start            # Start Expo development server
pnpm android          # Run on Android
pnpm ios              # Run on iOS

# UI package
cd packages/ui
pnpm dev              # Storybook development
pnpm build            # Build component library
pnpm storybook        # Start Storybook

# Database package
cd packages/database
pnpm generate         # Generate types from Supabase
pnpm migrate          # Run migrations

# Shared package
cd packages/shared
pnpm test             # Run tests
pnpm build            # Build utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- Git

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

   # Configure your environment variables
   # - Supabase URL and keys
   # - API endpoints
   # - Other service credentials
   ```

3. **Database setup** (if using Supabase):
   ```bash
   cd packages/database
   pnpm generate    # Generate types from your Supabase project
   ```

4. **Start development**:
   ```bash
   pnpm dev         # Starts all applications
   ```

### Development Workflow
1. **Web development**: Visit `http://localhost:3000`
2. **Mobile development**: Use Expo Go app or simulator
3. **Component development**: Visit Storybook at `http://localhost:6006`
4. **Database changes**: Update schemas in Supabase, then run `pnpm generate`

## 🔐 Authentication & Authorization

The template includes a comprehensive authentication system:

### Features
- **Multi-platform auth**: Works on web and mobile
- **Token management**: JWT with automatic refresh
- **Role-based access**: Flexible permission system
- **Route protection**: Guards for pages and API routes
- **Storage**: Secure token storage (localStorage/AsyncStorage)

### Usage Examples
```typescript
// Check authentication
import { isAuthenticated, hasRole } from '@starter-template/shared';

const canAccess = isAuthenticated(user) && hasRole(user, 'admin');

// Route protection
import { routeGuards } from '@starter-template/shared';

const result = routeGuards.authenticated(user);
if (!result.allowed) {
  redirect(result.redirect);
}

// API client with auth
import { createApiClient } from '@starter-template/shared';

const api = createApiClient({
  baseURL: process.env.API_URL
});
api.setAuthToken(userToken);
```

## 🎨 Design System

### Consistent Styling
- **Colors**: Shared color palette across platforms
- **Typography**: Consistent font scales and weights
- **Spacing**: Standardized spacing units
- **Components**: Reusable UI components

### Responsive Design
- **Mobile-first**: Designed for mobile, enhanced for desktop
- **Breakpoints**: Consistent breakpoints across platforms
- **Adaptive**: Components adapt to screen sizes

### Theme Support
- **Ready for themes**: Dark/light mode infrastructure
- **CSS Variables**: Easy theme switching
- **Platform native**: Respects system preferences

## 🧪 Testing Strategy

### Coverage
- **Unit tests**: Individual functions and components
- **Integration tests**: API clients and database utilities
- **Component tests**: UI component behavior
- **Type tests**: TypeScript type safety

### Running Tests
```bash
# All tests
pnpm test

# Package-specific tests
cd packages/shared && pnpm test
cd packages/ui && pnpm test

# Watch mode
pnpm test:watch

# Coverage reports
pnpm test:coverage
```

## 📚 Documentation

### Component Documentation
- **Storybook**: Interactive component documentation
- **Props**: TypeScript interfaces document all props
- **Examples**: Usage examples for each component

### API Documentation
- **JSDoc**: Comprehensive function documentation
- **Type definitions**: Full TypeScript support
- **README files**: Detailed package documentation

## 🔧 Configuration

### Turborepo
- **Optimized builds**: Intelligent caching and parallelization
- **Remote caching**: Share build artifacts across team
- **Pipeline**: Defined build dependencies

### TypeScript
- **Strict mode**: Comprehensive type checking
- **Project references**: Optimized compilation
- **Shared configs**: Consistent TypeScript settings

### Code Quality
- **ESLint**: Linting rules for code quality
- **Prettier**: Automatic code formatting
- **Husky**: Git hooks for quality checks
- **Conventional commits**: Standardized commit messages

## 🚀 Deployment

### Web App
```bash
# Build for production
cd apps/web
pnpm build

# Deploy to Vercel (recommended)
vercel deploy

# Or other platforms
# - Netlify
# - Railway
# - Self-hosted
```

### Mobile App
```bash
# Build for production
cd apps/mobile
eas build --platform all

# Submit to stores
eas submit --platform all
```

### Packages
```bash
# Build all packages
pnpm build

# Publish to npm (if needed)
pnpm publish --recursive
```

## 🤝 Contributing

### Code Style
- Follow TypeScript best practices
- Use conventional commits
- Write tests for new features
- Update documentation

### Pull Request Process
1. Create feature branch
2. Make changes with tests
3. Run `pnpm lint` and `pnpm test`
4. Submit PR with clear description

## 📈 Performance

### Optimization Features
- **Code splitting**: Automatic code splitting in Next.js
- **Tree shaking**: Remove unused code
- **Bundle analysis**: Optimize bundle sizes
- **Image optimization**: Next.js image optimization
- **Caching**: Turborepo build caching

### Monitoring
- **Bundle analyzer**: Analyze bundle sizes
- **Performance metrics**: Core Web Vitals tracking
- **Error tracking**: Structured error handling

## 🔍 Troubleshooting

### Common Issues
1. **Dependency issues**: Run `pnpm install` in root
2. **Type errors**: Run `pnpm type-check` to identify issues
3. **Build failures**: Check `turbo.json` pipeline configuration
4. **Environment variables**: Ensure all required vars are set

### Debug Commands
```bash
# Check package versions
pnpm list

# Clear caches
pnpm clean

# Verbose build
pnpm build --verbose
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with these amazing technologies:
- [Next.js](https://nextjs.org/) - React framework
- [Expo](https://expo.dev/) - React Native platform
- [Turborepo](https://turbo.build/) - Monorepo build system
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [TypeScript](https://typescriptlang.org/) - Type safety

---

**Ready to build something amazing?** 🚀

This starter template provides everything you need to build modern, scalable applications. Start by exploring the apps and packages, then customize to fit your needs!