import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { Card, CardHeader, CardContent, CardFooter } from '../components/Card'
import { Button } from '../components/Button'

/**
 * The Card component is a universal container that works on both web and native platforms.
 * It provides a clean, elevated surface for grouping related content and actions.
 * 
 * ## Features
 * - Cross-platform compatibility (web and React Native)
 * - Modular structure with Header, Content, and Footer components
 * - Consistent styling with shadows and borders
 * - Flexible content composition
 * - Accessible with proper semantic structure
 * 
 * ## Subcomponents
 * - **Card**: Main container component
 * - **CardHeader**: For titles, descriptions, and header content
 * - **CardContent**: For main content area
 * - **CardFooter**: For actions and additional information
 */
const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Universal Card component for displaying grouped content. Renders as styled div on web and View on React Native.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: false,
      description: 'Card content - typically CardHeader, CardContent, and CardFooter',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes (web only)',
      table: {
        type: { summary: 'string' },
      },
    },
    style: {
      control: 'object',
      description: 'Additional styles (native only)',
      table: {
        type: { summary: 'StyleProp<ViewStyle>' },
      },
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A simple card with just content.
 */
export const Default: Story = {
  render: () => (
    <Card>
      <CardContent>
        <p style={{ margin: 0, color: '#374151' }}>
          This is a simple card with just content.
        </p>
      </CardContent>
    </Card>
  ),
}

/**
 * Card with header, content, and footer.
 */
export const Complete: Story = {
  render: () => (
    <Card style={{ width: '350px' }}>
      <CardHeader>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
          Card Title
        </h3>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px', color: '#6B7280' }}>
          Card description or subtitle goes here.
        </p>
      </CardHeader>
      <CardContent>
        <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>
          This is the main content area of the card. You can put any content here,
          including text, images, forms, or other components.
        </p>
      </CardContent>
      <CardFooter>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" size="sm" onPress={fn()}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onPress={fn()}>
            Continue
          </Button>
        </div>
      </CardFooter>
    </Card>
  ),
}

/**
 * Card with only header and content.
 */
export const WithoutFooter: Story = {
  render: () => (
    <Card style={{ width: '300px' }}>
      <CardHeader>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
          Article Title
        </h3>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px', color: '#6B7280' }}>
          Published on March 15, 2024
        </p>
      </CardHeader>
      <CardContent>
        <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>
          This is a preview of the article content. Click to read the full article
          and discover more interesting insights.
        </p>
      </CardContent>
    </Card>
  ),
}

/**
 * Card with only content and footer.
 */
export const WithoutHeader: Story = {
  render: () => (
    <Card style={{ width: '300px' }}>
      <CardContent>
        <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>
          This card doesn't have a header. It goes straight to the content
          and has action buttons in the footer.
        </p>
      </CardContent>
      <CardFooter>
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onPress={fn()}>
            Skip
          </Button>
          <Button variant="primary" size="sm" onPress={fn()}>
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  ),
}

/**
 * Product card example with image placeholder.
 */
export const ProductCard: Story = {
  render: () => (
    <Card style={{ width: '280px' }}>
      <div style={{ 
        height: '200px', 
        backgroundColor: '#F3F4F6', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '0.5rem 0.5rem 0 0',
        color: '#9CA3AF',
        fontSize: '14px'
      }}>
        Product Image
      </div>
      <CardHeader>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
          Premium Headphones
        </h3>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '18px', fontWeight: '700', color: '#059669' }}>
          $299.99
        </p>
      </CardHeader>
      <CardContent>
        <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', lineHeight: '1.4' }}>
          High-quality wireless headphones with noise cancellation and 30-hour battery life.
        </p>
      </CardContent>
      <CardFooter>
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
          <Button variant="outline" size="sm" style={{ flex: 1 }} onPress={fn()}>
            Add to Cart
          </Button>
          <Button variant="primary" size="sm" style={{ flex: 1 }} onPress={fn()}>
            Buy Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  ),
}

/**
 * Profile card example.
 */
export const ProfileCard: Story = {
  render: () => (
    <Card style={{ width: '320px' }}>
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            JD
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              John Doe
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '14px', color: '#6B7280' }}>
              Software Engineer
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
          Passionate about building great user experiences and scalable applications.
          Loves React, TypeScript, and modern web technologies.
        </p>
      </CardContent>
      <CardFooter>
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
          <Button variant="outline" size="sm" style={{ flex: 1 }} onPress={fn()}>
            Message
          </Button>
          <Button variant="primary" size="sm" style={{ flex: 1 }} onPress={fn()}>
            Connect
          </Button>
        </div>
      </CardFooter>
    </Card>
  ),
}

/**
 * Notification card example.
 */
export const NotificationCard: Story = {
  render: () => (
    <Card style={{ width: '380px' }}>
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: '#3B82F6'
          }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              New message received
            </h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '12px', color: '#6B7280' }}>
              2 minutes ago
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
          Sarah Johnson sent you a message: "Hey, are we still on for the meeting at 3 PM?"
        </p>
      </CardContent>
      <CardFooter>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onPress={fn()}>
            Dismiss
          </Button>
          <Button variant="primary" size="sm" onPress={fn()}>
            Reply
          </Button>
        </div>
      </CardFooter>
    </Card>
  ),
}

/**
 * Statistics card example.
 */
export const StatsCard: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Card style={{ width: '180px' }}>
        <CardContent>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginBottom: '0.5rem' }}>
              1,234
            </div>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '0.25rem' }}>
              Total Users
            </div>
            <div style={{ fontSize: '12px', color: '#059669' }}>
              ↗ +12% from last month
            </div>
          </div>
        </CardContent>
      </Card>

      <Card style={{ width: '180px' }}>
        <CardContent>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#DC2626', marginBottom: '0.5rem' }}>
              $5,678
            </div>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '0.25rem' }}>
              Revenue
            </div>
            <div style={{ fontSize: '12px', color: '#DC2626' }}>
              ↘ -3% from last month
            </div>
          </div>
        </CardContent>
      </Card>

      <Card style={{ width: '180px' }}>
        <CardContent>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#3B82F6', marginBottom: '0.5rem' }}>
              98.5%
            </div>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '0.25rem' }}>
              Uptime
            </div>
            <div style={{ fontSize: '12px', color: '#3B82F6' }}>
              → Same as last month
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
}

/**
 * Form card example.
 */
export const FormCard: Story = {
  render: () => (
    <Card style={{ width: '400px' }}>
      <CardHeader>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
          Contact Information
        </h3>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px', color: '#6B7280' }}>
          Please fill in your contact details below.
        </p>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
              Full Name
            </label>
            <input 
              type="text" 
              placeholder="Enter your full name"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
              Email Address
            </label>
            <input 
              type="email" 
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'flex-end' }}>
          <Button variant="outline" onPress={fn()}>
            Cancel
          </Button>
          <Button variant="primary" onPress={fn()}>
            Save
          </Button>
        </div>
      </CardFooter>
    </Card>
  ),
}

/**
 * Multiple cards in a grid layout.
 */
export const CardGrid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', maxWidth: '800px' }}>
      <Card>
        <CardHeader>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Feature 1</h4>
        </CardHeader>
        <CardContent>
          <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
            Description of the first feature and its benefits.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Feature 2</h4>
        </CardHeader>
        <CardContent>
          <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
            Description of the second feature and its benefits.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Feature 3</h4>
        </CardHeader>
        <CardContent>
          <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
            Description of the third feature and its benefits.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Feature 4</h4>
        </CardHeader>
        <CardContent>
          <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
            Description of the fourth feature and its benefits.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
}

/**
 * Interactive playground to test different card configurations.
 */
export const Playground: Story = {
  render: () => (
    <Card style={{ width: '350px' }}>
      <CardHeader>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
          Playground Card
        </h3>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px', color: '#6B7280' }}>
          This is a customizable card for testing.
        </p>
      </CardHeader>
      <CardContent>
        <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>
          You can use the controls below to modify the card's appearance and behavior.
          Try different combinations to see how they work together.
        </p>
      </CardContent>
      <CardFooter>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" size="sm" onPress={fn()}>
            Secondary
          </Button>
          <Button variant="primary" size="sm" onPress={fn()}>
            Primary
          </Button>
        </div>
      </CardFooter>
    </Card>
  ),
}