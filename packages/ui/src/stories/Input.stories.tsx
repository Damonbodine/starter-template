import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { useState } from 'react'
import { Input } from '../components/Input'

/**
 * The Input component is a universal text input that works on both web and native platforms.
 * It supports various input types, keyboard configurations, and validation states.
 * 
 * ## Features
 * - Cross-platform compatibility (web and React Native)
 * - Multiple input types (text, email, password, etc.)
 * - Error state styling
 * - Disabled state
 * - Native keyboard type support
 * - Multiline support (native)
 * - Accessible with proper focus management
 */
const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Universal Input component for text entry. Renders as HTML input on web and TextInput on React Native.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current value of the input',
      table: {
        type: { summary: 'string' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when input is empty',
      table: {
        type: { summary: 'string' },
      },
    },
    error: {
      control: 'boolean',
      description: 'Shows error state styling',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the input',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'HTML input type (web only)',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'text' },
      },
    },
    keyboardType: {
      control: 'select',
      options: ['default', 'email-address', 'numeric', 'phone-pad', 'number-pad'],
      description: 'Keyboard type for native platforms',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    autoCapitalize: {
      control: 'select',
      options: ['none', 'sentences', 'words', 'characters'],
      description: 'Auto capitalization behavior (native only)',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'sentences' },
      },
    },
    secureTextEntry: {
      control: 'boolean',
      description: 'Hide text for password input (native only)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    multiline: {
      control: 'boolean',
      description: 'Allow multiple lines (native only)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    numberOfLines: {
      control: 'number',
      description: 'Number of lines for multiline input (native only)',
      table: {
        type: { summary: 'number' },
      },
    },
    onChangeText: {
      action: 'changed',
      description: 'Handler called when input text changes',
      table: {
        type: { summary: '(text: string) => void' },
      },
    },
    onFocus: {
      action: 'focused',
      description: 'Handler called when input receives focus',
      table: {
        type: { summary: '(event: any) => void' },
      },
    },
    onBlur: {
      action: 'blurred',
      description: 'Handler called when input loses focus',
      table: {
        type: { summary: '(event: any) => void' },
      },
    },
  },
  args: {
    onChangeText: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The default text input.
 */
export const Default: Story = {
  args: {
    placeholder: 'Enter text here...',
  },
}

/**
 * Text input with a value.
 */
export const WithValue: Story = {
  args: {
    value: 'Hello World',
    placeholder: 'Enter text here...',
  },
}

/**
 * Email input with appropriate keyboard type.
 */
export const Email: Story = {
  args: {
    type: 'email',
    keyboardType: 'email-address',
    placeholder: 'Enter your email address',
    autoCapitalize: 'none',
  },
}

/**
 * Password input with hidden text.
 */
export const Password: Story = {
  args: {
    type: 'password',
    secureTextEntry: true,
    placeholder: 'Enter your password',
    autoCapitalize: 'none',
  },
}

/**
 * Numeric input for numbers.
 */
export const Numeric: Story = {
  args: {
    type: 'number',
    keyboardType: 'numeric',
    placeholder: 'Enter a number',
  },
}

/**
 * Phone number input.
 */
export const Phone: Story = {
  args: {
    type: 'tel',
    keyboardType: 'phone-pad',
    placeholder: 'Enter phone number',
  },
}

/**
 * Input in error state.
 */
export const Error: Story = {
  args: {
    error: true,
    value: 'invalid@email',
    placeholder: 'Enter valid email',
  },
}

/**
 * Disabled input.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'This input is disabled',
    placeholder: 'Disabled input',
  },
}

/**
 * Multiline text input (native only).
 */
export const Multiline: Story = {
  args: {
    multiline: true,
    numberOfLines: 4,
    placeholder: 'Enter multiple lines of text...',
  },
}

/**
 * Different input states side by side.
 */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input placeholder="Default state" onChangeText={fn()} />
      <Input value="With value" onChangeText={fn()} />
      <Input error placeholder="Error state" onChangeText={fn()} />
      <Input disabled value="Disabled state" onChangeText={fn()} />
    </div>
  ),
}

/**
 * Various input types for different use cases.
 */
export const InputTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
          Text Input
        </label>
        <Input type="text" placeholder="Enter text" onChangeText={fn()} />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
          Email Input
        </label>
        <Input 
          type="email" 
          keyboardType="email-address" 
          placeholder="Enter email" 
          autoCapitalize="none"
          onChangeText={fn()} 
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
          Password Input
        </label>
        <Input 
          type="password" 
          secureTextEntry 
          placeholder="Enter password" 
          autoCapitalize="none"
          onChangeText={fn()} 
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
          Number Input
        </label>
        <Input 
          type="number" 
          keyboardType="numeric" 
          placeholder="Enter number" 
          onChangeText={fn()} 
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
          Phone Input
        </label>
        <Input 
          type="tel" 
          keyboardType="phone-pad" 
          placeholder="Enter phone number" 
          onChangeText={fn()} 
        />
      </div>
    </div>
  ),
}

/**
 * Form validation examples with error states.
 */
export const FormValidation: Story = {
  render: () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    
    const emailError = email && !email.includes('@')
    const passwordError = password && password.length < 8
    const confirmError = confirmPassword && confirmPassword !== password
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '300px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
            Email Address {emailError && <span style={{ color: '#EF4444' }}>*</span>}
          </label>
          <Input
            type="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            placeholder="Enter your email"
            autoCapitalize="none"
          />
          {emailError && (
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '12px', color: '#EF4444' }}>
              Please enter a valid email address
            </p>
          )}
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
            Password {passwordError && <span style={{ color: '#EF4444' }}>*</span>}
          </label>
          <Input
            type="password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            placeholder="Enter password"
            autoCapitalize="none"
          />
          {passwordError && (
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '12px', color: '#EF4444' }}>
              Password must be at least 8 characters
            </p>
          )}
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
            Confirm Password {confirmError && <span style={{ color: '#EF4444' }}>*</span>}
          </label>
          <Input
            type="password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={confirmError}
            placeholder="Confirm password"
            autoCapitalize="none"
          />
          {confirmError && (
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '12px', color: '#EF4444' }}>
              Passwords do not match
            </p>
          )}
        </div>
      </div>
    )
  },
}

/**
 * Real-world form examples with labels and descriptions.
 */
export const RealWorldExamples: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '400px' }}>
      {/* Contact form */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Contact Form</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
              Full Name
            </label>
            <Input placeholder="John Doe" autoCapitalize="words" onChangeText={fn()} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
              Email
            </label>
            <Input 
              type="email" 
              keyboardType="email-address" 
              placeholder="john@example.com" 
              autoCapitalize="none"
              onChangeText={fn()} 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
              Phone Number
            </label>
            <Input 
              type="tel" 
              keyboardType="phone-pad" 
              placeholder="+1 (555) 123-4567" 
              onChangeText={fn()} 
            />
          </div>
        </div>
      </div>

      {/* Search form */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Search</h3>
        <Input 
          type="search" 
          placeholder="Search products..." 
          onChangeText={fn()} 
        />
      </div>

      {/* Settings form */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Account Settings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
              Username
            </label>
            <Input 
              value="johndoe" 
              autoCapitalize="none" 
              onChangeText={fn()} 
            />
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '12px', color: '#6B7280' }}>
              This will be your public username
            </p>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
              Website URL
            </label>
            <Input 
              type="url" 
              placeholder="https://example.com" 
              autoCapitalize="none"
              onChangeText={fn()} 
            />
          </div>
        </div>
      </div>
    </div>
  ),
}

/**
 * Interactive playground to test different input configurations.
 */
export const Playground: Story = {
  args: {
    placeholder: 'Type something...',
    error: false,
    disabled: false,
    type: 'text',
    keyboardType: 'default',
    autoCapitalize: 'sentences',
    secureTextEntry: false,
  },
}