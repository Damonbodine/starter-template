# @starter-template/ui

A cross-platform UI component library that works seamlessly on both web (React) and mobile (React Native) platforms.

## 🎯 Overview

This package provides a comprehensive set of reusable UI components with consistent design tokens and behavior across platforms. Built with TypeScript and designed for maximum flexibility and developer experience.

## ✨ Features

- **Cross-Platform**: Works on both web and React Native
- **TypeScript First**: Full type safety and IntelliSense support
- **Consistent Design**: Shared design tokens and styling
- **Accessible**: Built with accessibility best practices
- **Customizable**: Extensive theming and styling options
- **Tree Shakeable**: Import only what you need
- **Storybook Integration**: Interactive component documentation

## 📦 Installation

This package is part of the monorepo and automatically available to other packages and apps.

For external use:

```bash
npm install @starter-template/ui
# or
yarn add @starter-template/ui
# or
pnpm add @starter-template/ui
```

## 🚀 Usage

### Web (React)

```tsx
import { Button, Input, Card } from '@starter-template/ui';

function App() {
  return (
    <Card>
      <Input 
        placeholder="Enter your email"
        type="email"
        validation="email"
      />
      <Button 
        variant="primary"
        size="large"
        onPress={() => console.log('Clicked!')}
      >
        Sign In
      </Button>
    </Card>
  );
}
```

### Mobile (React Native)

```tsx
import { Button, Input, Card } from '@starter-template/ui/native';

function Screen() {
  return (
    <Card>
      <Input 
        placeholder="Enter your email"
        keyboardType="email-address"
        validation="email"
      />
      <Button 
        variant="primary"
        size="large"
        onPress={() => console.log('Pressed!')}
      >
        Sign In
      </Button>
    </Card>
  );
}
```

## 🧩 Components

### Core Components

#### Button
A versatile button component with multiple variants and states.

```tsx
<Button 
  variant="primary" | "secondary" | "outline" | "ghost"
  size="small" | "medium" | "large"
  loading={boolean}
  disabled={boolean}
  onPress={() => void}
>
  Button Text
</Button>
```

**Props:**
- `variant`: Visual style of the button
- `size`: Size variant
- `loading`: Shows loading spinner and disables interaction
- `disabled`: Disables the button
- `onPress`: Click/press handler
- `href`: Makes button act as a link (web only)

#### Input
Text input component with validation and error states.

```tsx
<Input 
  placeholder="Enter text"
  type="text" | "email" | "password" | "number"
  validation="email" | "required" | "phone"
  error="Error message"
  disabled={boolean}
  value={string}
  onChangeText={(text) => void}
/>
```

**Props:**
- `type`: Input type for appropriate keyboard/validation
- `validation`: Built-in validation rules
- `error`: Error message to display
- `secure`: Secure text entry (password input)
- `multiline`: Multi-line text input

#### Card
Container component for grouping content.

```tsx
<Card 
  variant="default" | "outlined" | "elevated"
  padding="none" | "small" | "medium" | "large"
>
  <Text>Card content</Text>
</Card>
```

#### Text
Typography component with consistent styling.

```tsx
<Text 
  variant="h1" | "h2" | "h3" | "body" | "caption"
  color="primary" | "secondary" | "muted"
  align="left" | "center" | "right"
>
  Text content
</Text>
```

### Form Components

#### FormField
Wrapper for form inputs with labels and error handling.

```tsx
<FormField 
  label="Email Address"
  error="Please enter a valid email"
  required={true}
>
  <Input type="email" />
</FormField>
```

#### Select
Dropdown selection component.

```tsx
<Select 
  placeholder="Choose an option"
  options={[
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' }
  ]}
  value={selectedValue}
  onValueChange={(value) => setSelectedValue(value)}
/>
```

### Layout Components

#### Container
Main layout container with responsive behavior.

```tsx
<Container 
  maxWidth="sm" | "md" | "lg" | "xl"
  padding={boolean}
>
  <Text>Container content</Text>
</Container>
```

#### Stack
Flexible layout component for arranging children.

```tsx
<Stack 
  direction="row" | "column"
  spacing="small" | "medium" | "large"
  align="start" | "center" | "end"
  justify="start" | "center" | "end" | "between"
>
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</Stack>
```

#### Divider
Visual separator component.

```tsx
<Divider 
  orientation="horizontal" | "vertical"
  variant="solid" | "dashed"
/>
```

### Feedback Components

#### LoadingSpinner
Loading indicator component.

```tsx
<LoadingSpinner 
  size="small" | "medium" | "large"
  color="primary" | "secondary"
/>
```

#### Alert
Alert message component for notifications.

```tsx
<Alert 
  variant="info" | "success" | "warning" | "error"
  title="Alert Title"
  onDismiss={() => void}
>
  Alert message content
</Alert>
```

### Navigation Components

#### TabBar
Tab navigation component.

```tsx
<TabBar 
  tabs={[
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'profile', label: 'Profile', icon: ProfileIcon }
  ]}
  activeTab="home"
  onTabChange={(tabId) => void}
/>
```

## 🎨 Theming

### Design Tokens

The component library uses a comprehensive design system:

```tsx
// Colors
const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#FFFFFF',
  surface: '#F2F2F7',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
};

// Typography
const typography = {
  fontFamily: {
    body: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    heading: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    mono: 'SF Mono, Monaco, monospace',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Spacing
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};
```

### Custom Theming

You can customize the theme by providing a theme object:

```tsx
import { ThemeProvider } from '@starter-template/ui';

const customTheme = {
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
  },
  spacing: {
    md: '20px',
  },
};

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      <YourApp />
    </ThemeProvider>
  );
}
```

## 📱 Platform Differences

The library handles platform differences automatically:

### Web-Specific Features
- CSS-in-JS styling with emotion
- HTML semantic elements
- Web accessibility attributes
- CSS animations and transitions
- Responsive breakpoints

### React Native-Specific Features
- React Native StyleSheet
- Platform-specific components
- Native animations
- iOS and Android design guidelines
- Safe area handling

### Conditional Rendering

```tsx
import { Platform } from '@starter-template/ui';

function MyComponent() {
  return (
    <Stack>
      {Platform.isWeb ? (
        <WebSpecificComponent />
      ) : (
        <NativeSpecificComponent />
      )}
    </Stack>
  );
}
```

## 🧪 Testing

The component library includes comprehensive tests:

```bash
# Run component tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run Storybook tests
pnpm storybook
```

### Writing Component Tests

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Click me</Button>);
    
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

## 📖 Storybook

Interactive component documentation is available in Storybook:

```bash
# Start Storybook
pnpm storybook

# Build Storybook
pnpm build-storybook
```

Visit `http://localhost:6006` to explore components interactively.

### Story Examples

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...',
  },
};
```

## 🏗️ Development

### Building

```bash
# Build the package
pnpm build

# Build in watch mode
pnpm dev
```

### Adding New Components

1. Create component file in `src/components/`
2. Add TypeScript interfaces
3. Implement web and native versions if needed
4. Add tests in `__tests__/`
5. Create Storybook stories
6. Export from `src/index.ts`

### Component Template

```tsx
// src/components/NewComponent.tsx
import React from 'react';
import { styled } from '../utils/styled';

export interface NewComponentProps {
  /**
   * Component children
   */
  children: React.ReactNode;
  /**
   * Visual variant
   */
  variant?: 'default' | 'primary';
  /**
   * Size variant
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Custom className for styling
   */
  className?: string;
}

const StyledNewComponent = styled.div<NewComponentProps>`
  /* Base styles */
  display: flex;
  align-items: center;
  
  /* Variant styles */
  ${({ variant }) => variant === 'primary' && `
    color: var(--color-primary);
  `}
  
  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'small':
        return 'padding: 8px;';
      case 'large':
        return 'padding: 24px;';
      default:
        return 'padding: 16px;';
    }
  }}
`;

export const NewComponent: React.FC<NewComponentProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  className,
  ...props
}) => {
  return (
    <StyledNewComponent
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {children}
    </StyledNewComponent>
  );
};
```

## 📚 Best Practices

### Component Design
- Follow single responsibility principle
- Use composition over inheritance
- Provide sensible defaults
- Support both controlled and uncontrolled usage
- Include proper TypeScript types

### Styling
- Use design tokens consistently
- Avoid hardcoded values
- Support theme customization
- Consider platform differences
- Use semantic class names

### Accessibility
- Include proper ARIA attributes
- Support keyboard navigation
- Provide screen reader support
- Use semantic HTML elements
- Test with accessibility tools

### Performance
- Minimize re-renders with React.memo
- Use callback refs for DOM access
- Avoid creating objects in render
- Implement proper shouldComponentUpdate
- Use lazy loading for heavy components

## 🔗 Related Packages

- [`@starter-template/shared`](../shared) - Shared utilities and types
- [`@starter-template/database`](../database) - Database client and types

## 📄 License

MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🤝 Contributing

Please read our contributing guidelines and ensure all tests pass before submitting a pull request.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed changes and version history.