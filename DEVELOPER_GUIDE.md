# Developer Guide

This guide covers development tools, workflows, and best practices for the starter template monorepo.

## 🛠️ Development Tools Setup

### Prerequisites
- **Node.js** 18+ 
- **pnpm** 8+
- **Git**
- **VS Code** (recommended)

### VS Code Setup

1. **Open the workspace**:
   ```bash
   code starter-template.code-workspace
   ```

2. **Install recommended extensions**:
   - VS Code will prompt to install recommended extensions
   - Or manually install from the Extensions panel

3. **Configure TypeScript**:
   - Use workspace TypeScript version: `Cmd/Ctrl + Shift + P` → "TypeScript: Select TypeScript Version" → "Use Workspace Version"

## 🎯 Development Workflow

### Code Quality Tools

#### ESLint Configuration
- **Comprehensive rules** for TypeScript, React, React Native
- **Import sorting** and unused import detection
- **Accessibility checks** with jsx-a11y
- **Performance optimizations**

#### Prettier Configuration
- **Automatic import sorting** with @trivago/prettier-plugin-sort-imports
- **Consistent formatting** across all file types
- **Tailwind CSS class sorting**

#### Git Hooks (Husky)
- **Pre-commit**: Runs lint-staged, type checking, and code quality checks
- **Commit-msg**: Validates commit message format
- **Prepare-commit-msg**: Provides commit message templates

### Available Scripts

```bash
# Development
pnpm dev                    # Start all development servers
pnpm build                  # Build all packages and apps
pnpm clean                  # Clean build artifacts and cache

# Code Quality
pnpm lint                   # Lint all packages
pnpm lint:fix              # Fix auto-fixable lint issues
pnpm type-check            # Run TypeScript type checking
pnpm format                # Format all code with Prettier
pnpm format:check          # Check code formatting

# Testing
pnpm test                  # Run all tests
pnpm test:watch           # Run tests in watch mode
pnpm test:coverage        # Run tests with coverage report

# Git Workflow
pnpm commit               # Interactive commit with commitizen
pnpm check-all           # Run all quality checks

# Maintenance
pnpm reset               # Clean install (removes node_modules)
```

### Individual Package Scripts

```bash
# Web App (apps/web)
cd apps/web
pnpm dev                 # Next.js development server
pnpm build              # Production build
pnpm start              # Start production server

# Mobile App (apps/mobile)
cd apps/mobile
pnpm start              # Expo development server
pnpm android           # Run on Android
pnpm ios               # Run on iOS

# UI Package (packages/ui)
cd packages/ui
pnpm dev               # Storybook development
pnpm build             # Build component library
pnpm storybook         # Start Storybook

# Database Package (packages/database)
cd packages/database
pnpm generate          # Generate types from Supabase

# Shared Package (packages/shared)
cd packages/shared
pnpm test              # Run tests
pnpm build             # Build utilities
```

## 📝 Commit Guidelines

### Conventional Commits
We use [Conventional Commits](https://conventionalcommits.org/) for consistent commit messages.

#### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes
- **build**: Build system changes

#### Scopes
- **web**: Web application
- **mobile**: Mobile application
- **ui**: UI component library
- **database**: Database package
- **shared**: Shared utilities
- **docs**: Documentation
- **ci**: CI/CD configuration

#### Examples
```bash
feat(web): add user authentication flow
fix(mobile): resolve navigation crash on Android
docs(shared): update API documentation
refactor(ui): improve button component performance
test(database): add integration tests for user queries
```

### Using Commitizen
```bash
# Interactive commit helper
pnpm commit

# Follow the prompts:
# 1. Select commit type
# 2. Choose scope
# 3. Write description
# 4. Add body (optional)
# 5. Add breaking changes (if any)
# 6. Add issues closed (optional)
```

## 🏗️ Code Organization

### File Structure Conventions
```
src/
├── components/          # React components
│   ├── ui/             # Basic UI components
│   └── features/       # Feature-specific components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── services/           # API and external services
└── __tests__/          # Test files
```

### Import Organization
Imports are automatically sorted by Prettier:
```typescript
// 1. React and framework imports
import React from 'react'
import { NextPage } from 'next'

// 2. External libraries
import { z } from 'zod'
import clsx from 'clsx'

// 3. Internal packages
import { Button } from '@starter-template/ui'
import { formatDate } from '@starter-template/shared'

// 4. Relative imports
import { UserCard } from '../components/UserCard'
import './styles.css'
```

### Naming Conventions
- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserProfile`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `ApiResponse`)

## 🧪 Testing Strategy

### Test Types
1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user workflows

### Testing Libraries
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **MSW**: API mocking for tests

### Test Organization
```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── utils/
│   ├── formatDate.ts
│   └── __tests__/
│       └── formatDate.test.ts
```

### Running Tests
```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Specific test file
pnpm test Button.test.tsx

# Tests matching pattern
pnpm test --testNamePattern="user authentication"
```

## 🎨 Styling Guidelines

### Tailwind CSS
- Use Tailwind classes for styling
- Create component variants with `clsx` or `cva`
- Use design tokens from the theme

### Component Styling
```typescript
import { clsx } from 'clsx'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        // Variants
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        // Sizes
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-base',
        size === 'lg' && 'px-6 py-3 text-lg',
        // Custom classes
        className
      )}
      {...props}
    />
  )
}
```

## 🔧 TypeScript Guidelines

### Type Definitions
- Define interfaces for all data structures
- Use strict TypeScript configuration
- Avoid `any` type (use `unknown` instead)
- Use type guards for runtime type checking

### Example Type Definitions
```typescript
// Base types
export interface User {
  id: string
  email: string
  displayName?: string
  roles: UserRole[]
  createdAt: Date
  updatedAt: Date
}

// API response types
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

// Utility types
export type UserCreateInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
export type UserUpdateInput = Partial<UserCreateInput>

// Generic types
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

## 🐛 Debugging

### VS Code Debugging
1. **Set breakpoints** in your code
2. **Use the Debug panel** (Cmd/Ctrl + Shift + D)
3. **Select configuration**:
   - "Debug Next.js App" for web debugging
   - "Debug React Native (Expo)" for mobile
   - "Debug Jest Tests" for test debugging

### Debugging Scripts
```bash
# Debug Next.js app
cd apps/web && pnpm dev:debug

# Debug with inspector
node --inspect-brk ./node_modules/.bin/next dev

# Debug tests
pnpm test --runInBand --no-cache
```

### Common Issues

#### Type Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache/typescript
pnpm type-check
```

#### Lint Errors
```bash
# Auto-fix lint issues
pnpm lint:fix

# Check specific files
pnpm lint src/components/Button.tsx
```

#### Import Issues
```bash
# Clear module cache
rm -rf node_modules/.cache
pnpm install
```

## 📦 Package Management

### Adding Dependencies
```bash
# Add to specific package
pnpm add lodash --filter=@starter-template/shared

# Add dev dependency to root
pnpm add -D @types/lodash -w

# Add to specific app
pnpm add axios --filter=web
```

### Dependency Guidelines
- **Shared dependencies**: Add to root `package.json`
- **Package-specific**: Add to individual package
- **Peer dependencies**: Use for packages that will be consumed

### Version Management
- Use exact versions for tools (ESLint, Prettier)
- Use caret ranges for libraries (`^1.0.0`)
- Keep dependencies up to date regularly

## 🚀 Performance

### Build Optimization
- **Tree shaking**: Ensure proper ES modules exports
- **Code splitting**: Use dynamic imports for large components
- **Bundle analysis**: Regular bundle size monitoring

### Runtime Performance
- **React optimization**: Use `React.memo`, `useMemo`, `useCallback`
- **Image optimization**: Use Next.js Image component
- **API optimization**: Implement proper caching strategies

### Monitoring
```bash
# Analyze bundle size
cd apps/web && pnpm analyze

# Performance testing
pnpm test:performance

# Lighthouse CI
pnpm lighthouse
```

## 🔒 Security

### Best Practices
- **Never commit secrets** to git
- **Use environment variables** for configuration
- **Validate all inputs** with Zod schemas
- **Sanitize user content** before rendering

### Security Tools
- **ESLint security rules**: Detect potential vulnerabilities
- **Dependency scanning**: Regular security audits
- **Environment validation**: Runtime environment checking

## 📖 Documentation

### Code Documentation
- **JSDoc comments** for functions and classes
- **README files** for each package
- **Type definitions** serve as documentation

### API Documentation
- **OpenAPI/Swagger** for REST APIs
- **GraphQL schema** documentation
- **Storybook** for component documentation

### Writing Guidelines
- **Clear and concise** explanations
- **Code examples** for complex features
- **Update documentation** with code changes

## 🎯 Best Practices Summary

1. **Use TypeScript strictly** - Enable all strict options
2. **Write tests first** - TDD when possible
3. **Keep components small** - Single responsibility principle
4. **Use semantic commit messages** - Conventional commits
5. **Review code thoroughly** - Use pull request templates
6. **Document everything** - Code, APIs, and processes
7. **Monitor performance** - Regular bundle and runtime analysis
8. **Stay updated** - Keep dependencies current
9. **Follow conventions** - Consistent naming and structure
10. **Automate everything** - Use tools to enforce quality

## 🆘 Getting Help

### Resources
- **Internal Documentation**: Check package READMEs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **React Documentation**: https://react.dev/
- **Next.js Documentation**: https://nextjs.org/docs
- **Expo Documentation**: https://docs.expo.dev/

### Troubleshooting
1. **Check the logs** - Terminal output and browser console
2. **Clear caches** - `pnpm reset` for fresh start
3. **Update dependencies** - `pnpm update`
4. **Ask the team** - Use GitHub issues or discussions

### Contributing
1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feat/amazing-feature`
3. **Make changes** following these guidelines
4. **Write tests** for new functionality
5. **Run quality checks**: `pnpm check-all`
6. **Submit pull request** with clear description

---

Happy coding! 🚀