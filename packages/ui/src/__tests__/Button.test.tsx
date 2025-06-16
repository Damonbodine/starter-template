/**
 * Button Component Tests
 * Tests for the cross-platform Button component
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, simulateUserEvent } from 'test-utils';
import { Button } from '../components/Button';

describe('Button', () => {
  it('should render with default props', () => {
    const { getByRole } = renderWithProviders(
      <Button>Click me</Button>
    );

    const button = getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('should handle different variants', () => {
    const { getByRole } = renderWithProviders(
      <Button variant="primary">Primary Button</Button>
    );

    const button = getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('should handle disabled state', () => {
    const { getByRole } = renderWithProviders(
      <Button disabled>Disabled Button</Button>
    );

    const button = getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
  });

  it('should handle loading state', () => {
    const { getByRole, getByTestId } = renderWithProviders(
      <Button loading>Loading Button</Button>
    );

    const button = getByRole('button');
    expect(button).toBeDisabled();
    expect(getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should call onPress when clicked', async () => {
    const onPress = vi.fn();
    const { getByRole } = renderWithProviders(
      <Button onPress={onPress}>Click me</Button>
    );

    const button = getByRole('button');
    await simulateUserEvent.click(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', async () => {
    const onPress = vi.fn();
    const { getByRole } = renderWithProviders(
      <Button onPress={onPress} disabled>Click me</Button>
    );

    const button = getByRole('button');
    await simulateUserEvent.click(button);

    expect(onPress).not.toHaveBeenCalled();
  });

  it('should not call onPress when loading', async () => {
    const onPress = vi.fn();
    const { getByRole } = renderWithProviders(
      <Button onPress={onPress} loading>Click me</Button>
    );

    const button = getByRole('button');
    await simulateUserEvent.click(button);

    expect(onPress).not.toHaveBeenCalled();
  });

  it('should render with custom className', () => {
    const { getByRole } = renderWithProviders(
      <Button className="custom-class">Custom Button</Button>
    );

    const button = getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should support different sizes', () => {
    const { getByRole } = renderWithProviders(
      <Button size="large">Large Button</Button>
    );

    const button = getByRole('button');
    expect(button).toHaveClass('px-6', 'py-3');
  });

  it('should render as link when href provided', () => {
    const { getByRole } = renderWithProviders(
      <Button href="/test">Link Button</Button>
    );

    const link = getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });
});