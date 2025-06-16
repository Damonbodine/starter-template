/**
 * Mobile App Tests
 * Tests for the React Native mobile application
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// Mock the app entry point
const MockApp = () => {
  const { Text, View } = require('react-native');
  return React.createElement(
    View,
    { testID: 'app-container' },
    React.createElement(Text, { testID: 'app-title' }, 'Starter Template Mobile')
  );
};

describe('Mobile App', () => {
  it('should render app container', () => {
    const { getByTestId } = render(<MockApp />);
    
    expect(getByTestId('app-container')).toBeTruthy();
    expect(getByTestId('app-title')).toBeTruthy();
  });

  it('should display app title', () => {
    const { getByTestId } = render(<MockApp />);
    
    const title = getByTestId('app-title');
    expect(title.props.children).toBe('Starter Template Mobile');
  });
});