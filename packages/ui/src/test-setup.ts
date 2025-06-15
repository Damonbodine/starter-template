import '@testing-library/jest-dom'

// Mock React Native modules for web testing
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native')
  
  // Mock platform
  RN.Platform.OS = 'web'
  RN.Platform.select = (obj: any) => obj.web || obj.default
  
  return RN
})

// Mock expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}))

// Global test utilities
global.mockConsoleError = () => {
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })
}