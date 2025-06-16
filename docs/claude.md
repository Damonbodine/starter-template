# Starter Template - Project Context for Claude

This document provides comprehensive context about the starter template project for future interactions with Claude Code. It contains architecture decisions, coding patterns, development workflows, and important project information.

## 🏗️ Project Architecture

### Monorepo Structure

This is a **Turborepo monorepo** using **pnpm workspaces** with the following structure:

```
starter-template/
├── apps/
│   ├── web/           # Next.js 14 web application
│   └── mobile/        # Expo React Native mobile app
├── packages/
│   ├── ui/            # Cross-platform UI component library
│   ├── shared/        # Shared utilities, types, and constants
│   └── database/      # Supabase database client and utilities
├── docs/              # Nextra documentation site
└── tooling/           # Shared development tools and configurations
```

### Technology Stack

**Core Technologies:**
- **Package Manager**: pnpm (8.15.0+)
- **Monorepo Tool**: Turborepo
- **Language**: TypeScript (strict mode)
- **Runtime Validation**: Zod schemas

**Frontend Stack:**
- **Web Framework**: Next.js 14 with App Router
- **Mobile Framework**: Expo with Expo Router
- **UI Library**: Custom cross-platform components (React + React Native)
- **Styling**: Tailwind CSS (web) + NativeWind (mobile)
- **State Management**: Zustand + TanStack Query

**Backend & Database:**
- **Backend**: Supabase (Database, Auth, Storage, Realtime)
- **API Layer**: tRPC for type-safe APIs
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth

**Development Tools:**
- **Testing**: Vitest (unit), Playwright (E2E), Jest (React Native)
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with import sorting
- **Git Hooks**: Husky + lint-staged
- **Commits**: Conventional commits with commitizen
- **Documentation**: Storybook for components, Nextra for docs

## 🎯 Key Architecture Decisions

### 1. Cross-Platform Component Library

**Decision**: Build a unified UI library that works on both web and React Native.

**Implementation**:
- Components export web version by default (`@starter-template/ui`)
- Native versions available via sub-export (`@starter-template/ui/native`)
- Platform detection utilities in shared package
- Consistent design tokens across platforms

**Pattern**:
```typescript
// Web usage
import { Button } from '@starter-template/ui';

// Native usage
import { Button } from '@starter-template/ui/native';

// Platform-agnostic
import { getPlatformInfo } from '@starter-template/shared';
const platform = getPlatformInfo();
```

### 2. Type-Safe API Layer

**Decision**: Use tRPC for end-to-end type safety between client and server.

**Implementation**:
- tRPC routers in web app API routes
- Shared procedures for auth, posts, users
- TanStack Query integration for caching
- Optimistic updates for better UX

**Pattern**:
```typescript
// Define procedure
export const postRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ input }) => {
      return await findMany('posts', { limit: input.limit });
    }),
});

// Use in component
const { data: posts } = api.post.getAll.useQuery({ limit: 10 });
```

### 3. Database-First Development

**Decision**: Generate TypeScript types from Supabase schema, not the other way around.

**Implementation**:
- SQL migrations define schema
- TypeScript types auto-generated from database
- Zod schemas for runtime validation
- RLS policies for security

**Pattern**:
```typescript
// Generated types from database
type Post = Database['public']['Tables']['posts']['Row'];

// Runtime validation
const PostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  status: z.enum(['draft', 'published', 'archived']),
});
```

### 4. Monorepo Package Strategy

**Decision**: Shared packages for utilities, UI, and database to prevent code duplication.

**Implementation**:
- `@starter-template/ui`: Cross-platform components
- `@starter-template/shared`: Utilities, types, constants
- `@starter-template/database`: Supabase client and utilities
- All packages properly exported with TypeScript types

**Pattern**:
```json
// package.json exports
{
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

## 📁 Directory Conventions

### Package Structure

Each package follows this structure:
```
package/
├── src/
│   ├── index.ts          # Main entry point
│   ├── components/       # React components (UI package)
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── __tests__/       # Test files
│   └── [feature]/       # Feature-specific modules
├── package.json
├── tsconfig.json
├── rollup.config.js     # Build configuration
└── README.md           # Package documentation
```

### App Structure

Apps follow framework conventions:
```
apps/web/               # Next.js app
├── src/
│   ├── app/            # App Router pages
│   ├── components/     # App-specific components
│   ├── lib/            # App utilities
│   └── styles/         # Global styles
├── public/             # Static assets
└── next.config.js      # Next.js configuration

apps/mobile/            # Expo app
├── src/
│   ├── app/            # Expo Router pages
│   ├── components/     # App-specific components
│   └── lib/            # App utilities
├── assets/             # Static assets
└── app.config.js       # Expo configuration
```

## 🧩 Component Patterns

### UI Component Architecture

**Base Component Pattern**:
```typescript
export interface ComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className,
  children,
  ...props
}) => {
  return (
    <StyledComponent
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </StyledComponent>
  );
};
```

### Cross-Platform Components

**Platform Detection Pattern**:
```typescript
import { Platform } from '@starter-template/shared';

export const Component = () => {
  if (Platform.isWeb) {
    return <WebComponent />;
  }
  return <NativeComponent />;
};
```

**Conditional Exports Pattern**:
```typescript
// index.ts (web)
export { Button } from './Button.web';

// index.native.ts (mobile)
export { Button } from './Button.native';
```

## 🔧 Development Workflows

### Package Development

1. **Building**: All packages use Rollup for optimized builds
2. **Testing**: Vitest for unit tests, comprehensive coverage required
3. **Type Checking**: Strict TypeScript, no `any` types allowed
4. **Documentation**: Storybook stories for all UI components

### Code Quality Standards

**TypeScript Rules**:
- Strict mode enabled
- No implicit any
- Consistent interface naming (PascalCase)
- Export types alongside implementations

**ESLint Configuration**:
- TypeScript recommended rules
- React hooks rules
- Import sorting (automatic)
- Unused imports removal
- Accessibility rules (jsx-a11y)

**Prettier Configuration**:
- 2-space indentation
- Single quotes
- Trailing commas
- Import sorting plugin

### Git Workflow

**Commit Convention**:
```
type(scope): description

feat(ui): add new Button component
fix(database): resolve connection timeout issue
docs(readme): update installation instructions
test(shared): add validation utility tests
```

**Branch Strategy**:
- `main`: Production-ready code
- `feature/*`: New features
- `fix/*`: Bug fixes
- `docs/*`: Documentation updates

**Pre-commit Hooks**:
1. Lint-staged runs on changed files
2. TypeScript type checking
3. ESLint with auto-fix
4. Prettier formatting
5. Test execution

## 🗃️ Database Architecture

### Schema Design

**Core Tables**:
```sql
-- User profiles (extends auth.users)
profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog posts
posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  status post_status DEFAULT 'draft',
  author_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comments with threading
comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id),
  parent_id uuid REFERENCES comments(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Row Level Security (RLS)

**Security Patterns**:
- All tables have RLS enabled
- Users can only read/write their own data
- Published content is publicly readable
- Admin roles for moderation

**Policy Examples**:
```sql
-- Users can read published posts
CREATE POLICY "Public posts are viewable by everyone"
ON posts FOR SELECT
USING (status = 'published');

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (auth.uid() = author_id);
```

## 🧪 Testing Strategy

### Testing Pyramid

**Unit Tests (Vitest)**:
- All utility functions
- Component logic
- Business rules
- Database operations

**Integration Tests**:
- API endpoints
- Database queries
- Authentication flows
- Cross-package interactions

**E2E Tests (Playwright)**:
- Critical user flows
- Cross-browser compatibility
- Mobile responsive design
- Performance benchmarks

### Test Patterns

**Component Testing**:
```typescript
import { renderWithProviders } from 'test-utils';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with default props', () => {
    const { getByRole } = renderWithProviders(<Button>Click me</Button>);
    expect(getByRole('button')).toBeInTheDocument();
  });
});
```

**Database Testing**:
```typescript
import { createSupabaseClient } from '@starter-template/database';
import { mockSupabaseClient } from 'test-utils';

describe('Database Operations', () => {
  beforeEach(() => {
    mockSupabaseClient.from().select().mockResolvedValue({
      data: mockData,
      error: null,
    });
  });
});
```

## 🚀 Build & Deployment

### Build Pipeline

**Local Development**:
```bash
pnpm dev          # Start all apps in development
pnpm build        # Build all packages and apps
pnpm test         # Run all tests
pnpm lint         # Lint all code
pnpm type-check   # TypeScript checking
```

**Package Building**:
- Rollup builds ESM and CJS versions
- TypeScript declarations generated
- Tree-shaking optimized
- Source maps included

**Deployment Targets**:
- **Web**: Vercel (Next.js optimization)
- **Mobile**: EAS Build (iOS/Android)
- **Database**: Supabase (managed PostgreSQL)
- **Docs**: Vercel (Nextra static site)

### Environment Configuration

**Environment Variables**:
```bash
# Database
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Next.js (NEXT_PUBLIC_ prefix for client-side)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Expo (EXPO_PUBLIC_ prefix for client-side)
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## 🔐 Security Considerations

### Authentication Security

**Patterns**:
- Supabase Auth for user management
- JWT tokens with automatic refresh
- Secure storage (HttpOnly cookies web, Keychain/Keystore mobile)
- Password requirements enforced

**Implementation**:
```typescript
// Secure token storage
const storage = new AuthStorageService();
await storage.setTokens({ accessToken, refreshToken });

// Auth guards
const canAccess = isAuthenticated(user) && hasRole(user, 'admin');
```

### Database Security

**Row Level Security**:
- All tables protected with RLS
- Policies based on user roles
- Public data clearly defined
- Audit trails for sensitive operations

**API Security**:
- tRPC procedures with input validation
- Rate limiting on API routes
- CORS properly configured
- Environment variables secured

## 📊 Performance Optimizations

### Bundle Optimization

**Code Splitting**:
- Route-based splitting (Next.js automatic)
- Component lazy loading
- Dynamic imports for heavy components
- Tree-shaking for minimal bundles

**Database Optimization**:
- Indexed queries
- Pagination for large datasets
- Real-time subscriptions for live data
- Optimistic updates for better UX

### Caching Strategy

**Client-Side Caching**:
- TanStack Query for API responses
- React Query DevTools for debugging
- Stale-while-revalidate patterns
- Background refetching

**CDN & Static Assets**:
- Vercel Edge Network
- Image optimization (Next.js)
- Font optimization
- Asset compression

## 🐛 Error Handling

### Error Architecture

**Error Types**:
```typescript
// Custom error classes
class AppError extends Error {
  constructor(message: string, public code: string, public context?: any) {
    super(message);
  }
}

class NetworkError extends AppError {
  constructor(message: string, public statusCode: number) {
    super(message, 'NETWORK_ERROR');
  }
}
```

**Error Boundaries**:
```typescript
// React Error Boundary for UI errors
class ErrorBoundary extends Component {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service
    logger.error('Component error:', error, errorInfo);
  }
}
```

### Logging & Monitoring

**Error Reporting**:
- Centralized error handling
- Context-rich error logs
- User-friendly error messages
- Recovery strategies

**Development Tools**:
- React DevTools
- TanStack Query DevTools
- Supabase Dashboard
- Browser developer tools

## 🔄 State Management

### Global State (Zustand)

**Store Pattern**:
```typescript
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

interface AppActions {
  setUser: (user: User | null) => void;
  toggleTheme: () => void;
  addNotification: (notification: Notification) => void;
}

const useAppStore = create<AppState & AppActions>((set) => ({
  user: null,
  theme: 'light',
  notifications: [],
  
  setUser: (user) => set({ user }),
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification]
  })),
}));
```

### Server State (TanStack Query)

**Query Patterns**:
```typescript
// Queries for data fetching
const usePostsQuery = (filters: PostFilters) => {
  return useQuery({
    queryKey: ['posts', filters],
    queryFn: () => api.post.getAll.query(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutations for data updates
const useCreatePostMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PostInput) => api.post.create.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
```

## 📝 Documentation Standards

### Code Documentation

**JSDoc Standards**:
```typescript
/**
 * Formats a date according to the specified format string
 * @param date - The date to format
 * @param format - The format string (e.g., 'yyyy-MM-dd')
 * @returns The formatted date string
 * @example
 * ```typescript
 * formatDate(new Date(), 'yyyy-MM-dd') // '2023-12-25'
 * ```
 */
export function formatDate(date: Date, format: string): string {
  // Implementation
}
```

**README Structure**:
1. Project/package overview
2. Installation instructions
3. Quick start guide
4. API reference
5. Examples
6. Development setup
7. Contributing guidelines

### Storybook Documentation

**Story Pattern**:
```typescript
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};
```

## 🔧 Tooling & Development Experience

### IDE Configuration

**VS Code Settings**:
- TypeScript strict mode
- Auto-import organization
- Format on save
- ESLint integration
- Prettier integration

**Recommended Extensions**:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Auto Import - ES6, TS, JSX, TSX

### Development Scripts

**Monorepo Scripts**:
```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "clean": "turbo clean",
    "format": "prettier --write .",
    "commit": "cz"
  }
}
```

**Package Scripts**:
```json
{
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "storybook": "storybook dev -p 6006"
  }
}
```

## 🚨 Common Issues & Solutions

### TypeScript Issues

**Problem**: Import resolution failures
**Solution**: Check `tsconfig.json` paths and ensure proper package exports

**Problem**: Type errors in tests
**Solution**: Use proper test utilities and mock types

### Build Issues

**Problem**: Rollup build failures
**Solution**: Check external dependencies and build configuration

**Problem**: Next.js build errors
**Solution**: Verify client/server code separation and environment variables

### Database Issues

**Problem**: RLS policy failures
**Solution**: Review policy conditions and user permissions

**Problem**: Type generation errors
**Solution**: Ensure Supabase CLI is properly configured and authenticated

## 📈 Future Considerations

### Scalability Planning

**Performance**:
- Bundle size monitoring
- Database query optimization
- CDN strategy
- Caching improvements

**Architecture**:
- Micro-frontend considerations
- API rate limiting
- Database sharding
- Multi-region deployment

### Technology Updates

**Framework Updates**:
- Next.js version migrations
- React version updates
- Expo SDK upgrades
- Supabase feature adoptions

**Dependency Management**:
- Regular security updates
- Performance benchmark comparisons
- Breaking change migration plans
- Legacy code cleanup

---

## 📞 Contact & Support

This document should be updated as the project evolves. For questions about architecture decisions or implementation details, refer to:

1. Package README files for specific functionality
2. Storybook documentation for UI components
3. API documentation for backend endpoints
4. Test files for usage examples

Remember to update this document when making significant architectural changes or adding new patterns to the codebase.