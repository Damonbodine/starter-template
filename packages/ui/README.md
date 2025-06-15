# @starter-template/ui

A shared UI component library for web and mobile applications built with React and React Native.

## Features

- 🌐 **Cross-platform**: Works with both React (web) and React Native (mobile)
- 🎨 **Consistent Design**: Unified theme system across platforms
- 📱 **Responsive**: Adaptive components that work on all screen sizes
- 🎭 **Themed**: Support for light and dark modes
- 📚 **Well Documented**: Comprehensive Storybook documentation
- 🔧 **TypeScript**: Full TypeScript support with proper types
- 🧪 **Tested**: Unit tests with Jest and React Testing Library

## Installation

```bash
# Using pnpm (recommended)
pnpm add @starter-template/ui

# Using npm
npm install @starter-template/ui

# Using yarn
yarn add @starter-template/ui
```

## Usage

### Web (React)

```tsx
import { Button, Card, Typography } from '@starter-template/ui'
// or import web-specific exports
import { Button, Card, Typography } from '@starter-template/ui/web'

function App() {
  return (
    <Card>
      <Card.Header>
        <Typography variant="h2">Welcome</Typography>
      </Card.Header>
      <Card.Content>
        <Typography variant="body">
          This is a cross-platform UI component library.
        </Typography>
      </Card.Content>
      <Card.Footer>
        <Button variant="primary" onPress={() => alert('Hello!')}>
          Click me
        </Button>
      </Card.Footer>
    </Card>
  )
}
```

### Mobile (React Native)

```tsx
import { Button, Card, Typography } from '@starter-template/ui'
// or import native-specific exports
import { Button, Card, Typography } from '@starter-template/ui/native'

function App() {
  return (
    <Card>
      <Card.Header>
        <Typography variant="h2">Welcome</Typography>
      </Card.Header>
      <Card.Content>
        <Typography variant="body">
          This is a cross-platform UI component library.
        </Typography>
      </Card.Content>
      <Card.Footer>
        <Button variant="primary" onPress={() => console.log('Hello!')}>
          Click me
        </Button>
      </Card.Footer>
    </Card>
  )
}
```

## Components

### Button

A versatile button component with multiple variants and sizes.

```tsx
<Button variant="primary" size="md" onPress={() => {}}>
  Primary Button
</Button>
```

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `destructive`
**Sizes**: `sm`, `md`, `lg`

### Input

A cross-platform input component for forms.

```tsx
<Input
  placeholder="Enter your email"
  value={email}
  onChange={setEmail}
  type="email"
/>
```

### Card

A container component with optional header, content, and footer.

```tsx
<Card>
  <Card.Header>
    <Typography variant="h3">Card Title</Typography>
  </Card.Header>
  <Card.Content>
    <Typography variant="body">Card content goes here.</Typography>
  </Card.Content>
  <Card.Footer>
    <Button variant="outline">Action</Button>
  </Card.Footer>
</Card>
```

### Typography

Semantic text component with predefined variants.

```tsx
<Typography variant="h1">Heading 1</Typography>
<Typography variant="body">Body text</Typography>
<Typography variant="caption">Caption text</Typography>
```

**Variants**: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `body`, `bodySmall`, `caption`, `label`

## Theme

The library includes a comprehensive theme system that works across platforms:

```tsx
import { theme, colors } from '@starter-template/ui'

// Access theme values
const primaryColor = theme.colors.primary[500]
const spacing = theme.spacing[4] // 16px
const typography = theme.textVariants.h1
```

## Development

### Running Storybook

```bash
pnpm storybook
```

### Building the Library

```bash
pnpm build
```

### Running Tests

```bash
pnpm test
```

### Type Checking

```bash
pnpm type-check
```

## Platform-Specific Considerations

### Web
- Uses CSS-in-JS with Tailwind CSS classes
- Semantic HTML elements for accessibility
- Supports CSS variables for theming

### React Native
- Uses StyleSheet and inline styles
- Platform-specific components (TouchableOpacity, TextInput, etc.)
- Optimized for mobile performance

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © Starter Template