import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { Button } from '../components/Button'

/**
 * The Button component is a universal component that works on both web and native platforms.
 * It supports multiple variants, sizes, and states including loading and disabled states.
 * 
 * ## Features
 * - Cross-platform compatibility (web and React Native)
 * - Multiple variants: primary, secondary, outline, ghost, destructive
 * - Three sizes: small (sm), medium (md), large (lg)
 * - Loading state with spinner
 * - Disabled state
 * - Accessible with proper focus management
 */
const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Universal Button component with multiple variants and states. Renders as HTML button on web and TouchableOpacity on React Native.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
      description: 'Visual style variant of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'md' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading spinner and disables interaction',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button interaction',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      control: 'text',
      description: 'Button label or content',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    onPress: {
      action: 'pressed',
      description: 'Handler called when button is pressed/clicked',
      table: {
        type: { summary: '() => void' },
      },
    },
  },
  args: {
    onPress: fn(),
    children: 'Button',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The default primary button with medium size.
 */
export const Default: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Button',
  },
}

/**
 * Primary button examples in all available sizes.
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button {...args} size="sm">Small Primary</Button>
      <Button {...args} size="md">Medium Primary</Button>
      <Button {...args} size="lg">Large Primary</Button>
    </div>
  ),
}

/**
 * Secondary button with subtle styling.
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button {...args} size="sm">Small Secondary</Button>
      <Button {...args} size="md">Medium Secondary</Button>
      <Button {...args} size="lg">Large Secondary</Button>
    </div>
  ),
}

/**
 * Outline button with border styling.
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button {...args} size="sm">Small Outline</Button>
      <Button {...args} size="md">Medium Outline</Button>
      <Button {...args} size="lg">Large Outline</Button>
    </div>
  ),
}

/**
 * Ghost button with minimal styling.
 */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button {...args} size="sm">Small Ghost</Button>
      <Button {...args} size="md">Medium Ghost</Button>
      <Button {...args} size="lg">Large Ghost</Button>
    </div>
  ),
}

/**
 * Destructive button for dangerous actions.
 */
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button {...args} size="sm">Delete</Button>
      <Button {...args} size="md">Delete Account</Button>
      <Button {...args} size="lg">Permanently Delete</Button>
    </div>
  ),
}

/**
 * All button variants side by side for comparison.
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary" onPress={fn()}>Primary</Button>
      <Button variant="secondary" onPress={fn()}>Secondary</Button>
      <Button variant="outline" onPress={fn()}>Outline</Button>
      <Button variant="ghost" onPress={fn()}>Ghost</Button>
      <Button variant="destructive" onPress={fn()}>Destructive</Button>
    </div>
  ),
}

/**
 * Buttons in loading state with spinner.
 */
export const Loading: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary" loading onPress={fn()}>Loading</Button>
      <Button variant="secondary" loading onPress={fn()}>Please wait</Button>
      <Button variant="outline" loading onPress={fn()}>Submitting</Button>
      <Button variant="ghost" loading onPress={fn()}>Processing</Button>
      <Button variant="destructive" loading onPress={fn()}>Deleting</Button>
    </div>
  ),
}

/**
 * Disabled buttons in various states.
 */
export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary" disabled onPress={fn()}>Disabled</Button>
      <Button variant="secondary" disabled onPress={fn()}>Disabled</Button>
      <Button variant="outline" disabled onPress={fn()}>Disabled</Button>
      <Button variant="ghost" disabled onPress={fn()}>Disabled</Button>
      <Button variant="destructive" disabled onPress={fn()}>Disabled</Button>
    </div>
  ),
}

/**
 * Buttons demonstrating different sizes.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button size="sm" onPress={fn()}>Small</Button>
        <Button size="md" onPress={fn()}>Medium</Button>
        <Button size="lg" onPress={fn()}>Large</Button>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button variant="outline" size="sm" onPress={fn()}>Small Outline</Button>
        <Button variant="outline" size="md" onPress={fn()}>Medium Outline</Button>
        <Button variant="outline" size="lg" onPress={fn()}>Large Outline</Button>
      </div>
    </div>
  ),
}

/**
 * Real-world usage examples demonstrating common button combinations.
 */
export const RealWorldExamples: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '600px' }}>
      {/* Form buttons */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Form Actions</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="primary" onPress={fn()}>Save Changes</Button>
          <Button variant="outline" onPress={fn()}>Cancel</Button>
        </div>
      </div>

      {/* Card actions */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Card Actions</h3>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onPress={fn()}>Learn More</Button>
          <Button variant="primary" size="sm" onPress={fn()}>Get Started</Button>
        </div>
      </div>

      {/* Dangerous actions */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Dangerous Actions</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="destructive" onPress={fn()}>Delete Account</Button>
          <Button variant="outline" onPress={fn()}>Keep Account</Button>
        </div>
      </div>

      {/* Loading states */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Loading States</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="primary" loading onPress={fn()}>Uploading...</Button>
          <Button variant="outline" disabled onPress={fn()}>Cancel</Button>
        </div>
      </div>
    </div>
  ),
}

/**
 * Interactive playground to test different button configurations.
 */
export const Playground: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    children: 'Click me!',
  },
}