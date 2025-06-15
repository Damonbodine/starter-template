import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { 
  Typography, 
  H1, 
  H2, 
  H3, 
  H4, 
  H5, 
  H6, 
  Body, 
  BodySmall, 
  Caption, 
  Label 
} from '../components/Typography'

/**
 * The Typography component is a universal text component that works on both web and native platforms.
 * It provides consistent text styling across different variants and supports semantic HTML on web.
 * 
 * ## Features
 * - Cross-platform compatibility (web and React Native)
 * - Semantic HTML elements on web (h1, h2, h3, etc.)
 * - Consistent text styling across platforms
 * - Multiple text variants (h1-h6, body, bodySmall, caption, label)
 * - Text alignment options
 * - Color customization
 * - Native-specific features (selectable, numberOfLines, ellipsizeMode)
 * - Click/press handlers
 * 
 * ## Text Variants
 * - **h1-h6**: Heading variants with decreasing sizes
 * - **body**: Regular body text
 * - **bodySmall**: Smaller body text
 * - **caption**: Small caption text
 * - **label**: Text for form labels
 * 
 * ## Convenience Components
 * Pre-configured components for each variant: H1, H2, H3, H4, H5, H6, Body, BodySmall, Caption, Label
 */
const meta = {
  title: 'Components/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Universal Typography component for consistent text styling. Renders semantic HTML on web and Text components on React Native.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'bodySmall', 'caption', 'label'],
      description: 'Text variant to apply',
      table: {
        type: { summary: 'TextVariant' },
      },
    },
    children: {
      control: 'text',
      description: 'Text content',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    color: {
      control: 'color',
      description: 'Text color override',
      table: {
        type: { summary: 'string' },
      },
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
      description: 'Text alignment',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'left' },
      },
    },
    selectable: {
      control: 'boolean',
      description: 'Whether text should be selectable (native only)',
      table: {
        type: { summary: 'boolean' },
      },
    },
    numberOfLines: {
      control: 'number',
      description: 'Number of lines to show before truncating (native only)',
      table: {
        type: { summary: 'number' },
      },
    },
    ellipsizeMode: {
      control: 'select',
      options: ['head', 'middle', 'tail', 'clip'],
      description: 'Ellipsize mode (native only)',
      table: {
        type: { summary: 'string' },
      },
    },
    onPress: {
      action: 'pressed',
      description: 'Click/press handler',
      table: {
        type: { summary: '() => void' },
      },
    },
  },
  args: {
    children: 'Typography Text',
    onPress: fn(),
  },
} satisfies Meta<typeof Typography>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The default typography component.
 */
export const Default: Story = {
  args: {
    variant: 'body',
    children: 'This is default body text',
  },
}

/**
 * All heading variants (h1 through h6).
 */
export const Headings: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <Typography variant="h1">Heading 1 - Main Title</Typography>
      <Typography variant="h2">Heading 2 - Section Title</Typography>
      <Typography variant="h3">Heading 3 - Subsection Title</Typography>
      <Typography variant="h4">Heading 4 - Article Title</Typography>
      <Typography variant="h5">Heading 5 - Card Title</Typography>
      <Typography variant="h6">Heading 6 - Small Title</Typography>
    </div>
  ),
}

/**
 * Body text variants for different content types.
 */
export const BodyText: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <Typography variant="body">
        This is regular body text. It's perfect for paragraphs, descriptions, and general content.
        The line height and font size are optimized for readability across different screen sizes.
      </Typography>
      <Typography variant="bodySmall">
        This is small body text. It's useful for secondary information, metadata, or when you need
        to fit more text in a smaller space while maintaining readability.
      </Typography>
      <Typography variant="caption">
        This is caption text. It's the smallest text variant, perfect for image captions,
        timestamps, or auxiliary information.
      </Typography>
      <Typography variant="label">
        This is label text. It's designed for form labels and UI elements that need emphasis.
      </Typography>
    </div>
  ),
}

/**
 * Different text alignment options.
 */
export const TextAlignment: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <div style={{ border: '1px dashed #D1D5DB', padding: '1rem' }}>
        <Typography variant="body" align="left">
          Left-aligned text (default)
        </Typography>
      </div>
      <div style={{ border: '1px dashed #D1D5DB', padding: '1rem' }}>
        <Typography variant="body" align="center">
          Center-aligned text
        </Typography>
      </div>
      <div style={{ border: '1px dashed #D1D5DB', padding: '1rem' }}>
        <Typography variant="body" align="right">
          Right-aligned text
        </Typography>
      </div>
      <div style={{ border: '1px dashed #D1D5DB', padding: '1rem' }}>
        <Typography variant="body" align="justify">
          Justified text spreads evenly across the full width of the container,
          creating clean edges on both sides. This is useful for formal documents
          or when you want a more structured appearance.
        </Typography>
      </div>
    </div>
  ),
}

/**
 * Different text colors and customization.
 */
export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <Typography variant="h3">Text Colors</Typography>
      <Typography variant="body" color="#374151">
        Default text color (gray-700)
      </Typography>
      <Typography variant="body" color="#059669">
        Success color (green-600)
      </Typography>
      <Typography variant="body" color="#DC2626">
        Error color (red-600)
      </Typography>
      <Typography variant="body" color="#D97706">
        Warning color (amber-600)
      </Typography>
      <Typography variant="body" color="#3B82F6">
        Primary color (blue-500)
      </Typography>
      <Typography variant="body" color="#6B7280">
        Muted color (gray-500)
      </Typography>
      <Typography variant="body" color="#111827">
        Strong emphasis (gray-900)
      </Typography>
    </div>
  ),
}

/**
 * Interactive text with click handlers.
 */
export const Interactive: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <Typography variant="h4">Interactive Text</Typography>
      <Typography 
        variant="body" 
        color="#3B82F6" 
        onPress={fn()}
        style={{ cursor: 'pointer', textDecoration: 'underline' }}
      >
        This text is clickable and will trigger an action
      </Typography>
      <Typography 
        variant="label" 
        color="#059669" 
        onPress={fn()}
        style={{ cursor: 'pointer' }}
      >
        Click here to learn more →
      </Typography>
      <Typography 
        variant="caption" 
        color="#6B7280" 
        onPress={fn()}
        style={{ cursor: 'pointer' }}
      >
        Terms and conditions apply (click to view)
      </Typography>
    </div>
  ),
}

/**
 * Long text with truncation (native feature).
 */
export const TextTruncation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Typography variant="h4">Text Truncation</Typography>
      <div style={{ border: '1px dashed #D1D5DB', padding: '1rem' }}>
        <Typography 
          variant="body" 
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          This is a very long text that will be truncated after two lines. 
          The ellipsizeMode prop controls where the ellipsis appears. 
          This feature is particularly useful for cards, lists, and other 
          components where space is limited.
        </Typography>
      </div>
      <div style={{ border: '1px dashed #D1D5DB', padding: '1rem' }}>
        <Typography 
          variant="body" 
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          This single line text will be truncated in the middle if it's too long
        </Typography>
      </div>
    </div>
  ),
}

/**
 * Convenience components for each variant.
 */
export const ConvenienceComponents: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <div>
        <Typography variant="h3">Convenience Components</Typography>
        <Typography variant="body" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Pre-configured components for each text variant:
        </Typography>
      </div>
      
      <H1>H1 Component</H1>
      <H2>H2 Component</H2>
      <H3>H3 Component</H3>
      <H4>H4 Component</H4>
      <H5>H5 Component</H5>
      <H6>H6 Component</H6>
      <Body>Body Component</Body>
      <BodySmall>BodySmall Component</BodySmall>
      <Caption>Caption Component</Caption>
      <Label>Label Component</Label>
    </div>
  ),
}

/**
 * Real-world usage examples showing typography in context.
 */
export const RealWorldExamples: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '700px' }}>
      {/* Article layout */}
      <article>
        <H1>The Future of Web Development</H1>
        <BodySmall color="#6B7280" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Published on March 15, 2024 by John Doe
        </BodySmall>
        <Body style={{ marginBottom: '1.5rem' }}>
          Web development continues to evolve at a rapid pace, with new frameworks, 
          tools, and methodologies emerging regularly. As we look toward the future, 
          several key trends are shaping the landscape of web development.
        </Body>
        <H2>Modern Frameworks</H2>
        <Body style={{ marginBottom: '1.5rem' }}>
          The rise of component-based frameworks has revolutionized how we build 
          user interfaces. React, Vue, and Angular have paved the way for more 
          maintainable and scalable applications.
        </Body>
        <H3>Performance Optimization</H3>
        <Body>
          Performance remains a critical factor in user experience. Modern tools 
          and techniques help developers create faster, more efficient applications.
        </Body>
      </article>

      {/* Profile card */}
      <div style={{ 
        border: '1px solid #E5E7EB', 
        borderRadius: '0.5rem', 
        padding: '1.5rem',
        backgroundColor: '#FAFAFA'
      }}>
        <H3 style={{ marginBottom: '0.5rem' }}>Sarah Johnson</H3>
        <Label color="#059669" style={{ marginBottom: '1rem' }}>Senior Developer</Label>
        <Body style={{ marginBottom: '1rem' }}>
          Full-stack developer with 8 years of experience in React, Node.js, 
          and cloud technologies. Passionate about creating accessible and 
          performant web applications.
        </Body>
        <Caption color="#6B7280">
          Joined March 2020 • San Francisco, CA
        </Caption>
      </div>

      {/* Product listing */}
      <div style={{ 
        border: '1px solid #E5E7EB', 
        borderRadius: '0.5rem', 
        padding: '1.5rem' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
          <H4 style={{ margin: 0 }}>Premium Wireless Headphones</H4>
          <H4 color="#059669" style={{ margin: 0 }}>$299.99</H4>
        </div>
        <BodySmall color="#6B7280" style={{ marginBottom: '1rem' }}>
          SKU: WH-1000XM4 • In Stock
        </BodySmall>
        <Body style={{ marginBottom: '1rem' }}>
          Experience industry-leading noise cancellation with exceptional sound quality. 
          Features 30-hour battery life and quick charge capability.
        </Body>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Label>Rating:</Label>
          <BodySmall>⭐⭐⭐⭐⭐ (4.8/5)</BodySmall>
          <Caption color="#6B7280">Based on 234 reviews</Caption>
        </div>
      </div>

      {/* Form example */}
      <div style={{ 
        border: '1px solid #E5E7EB', 
        borderRadius: '0.5rem', 
        padding: '1.5rem' 
      }}>
        <H3 style={{ marginBottom: '1rem' }}>Contact Form</H3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <Label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Full Name
            </Label>
            <input 
              type="text" 
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #D1D5DB', 
                borderRadius: '0.25rem',
                boxSizing: 'border-box'
              }} 
            />
          </div>
          <div>
            <Label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Email Address
            </Label>
            <input 
              type="email" 
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #D1D5DB', 
                borderRadius: '0.25rem',
                boxSizing: 'border-box'
              }} 
            />
            <Caption color="#6B7280" style={{ marginTop: '0.25rem', display: 'block' }}>
              We'll never share your email with anyone else
            </Caption>
          </div>
        </div>
      </div>
    </div>
  ),
}

/**
 * Typography scale showing the relationship between different sizes.
 */
export const TypographyScale: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
      <div>
        <H2>Typography Scale</H2>
        <Body style={{ marginTop: '0.5rem', marginBottom: '2rem' }}>
          Visual hierarchy showing all text variants and their relative sizes:
        </Body>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
          <Typography variant="h1">H1</Typography>
          <BodySmall color="#6B7280">36px / 40px line height</BodySmall>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
          <Typography variant="h2">H2</Typography>
          <BodySmall color="#6B7280">30px / 36px line height</BodySmall>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
          <Typography variant="h3">H3</Typography>
          <BodySmall color="#6B7280">24px / 32px line height</BodySmall>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
          <Typography variant="h4">H4</Typography>
          <BodySmall color="#6B7280">20px / 28px line height</BodySmall>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
          <Typography variant="h5">H5</Typography>
          <BodySmall color="#6B7280">18px / 28px line height</BodySmall>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
          <Typography variant="h6">H6</Typography>
          <BodySmall color="#6B7280">16px / 24px line height</BodySmall>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
          <Typography variant="body">Body</Typography>
          <BodySmall color="#6B7280">16px / 24px line height</BodySmall>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
          <Typography variant="bodySmall">Body Small</Typography>
          <BodySmall color="#6B7280">14px / 20px line height</BodySmall>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
          <Typography variant="label">Label</Typography>
          <BodySmall color="#6B7280">14px / 20px line height</BodySmall>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem' }}>
          <Typography variant="caption">Caption</Typography>
          <BodySmall color="#6B7280">12px / 16px line height</BodySmall>
        </div>
      </div>
    </div>
  ),
}

/**
 * Interactive playground to test different typography configurations.
 */
export const Playground: Story = {
  args: {
    variant: 'body',
    children: 'Customize this text using the controls below',
    color: '#374151',
    align: 'left',
  },
}