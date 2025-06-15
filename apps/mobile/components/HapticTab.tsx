import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import * as Haptics from 'expo-haptics';

interface HapticTabProps extends TouchableOpacityProps {
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'selection';
}

export function HapticTab({
  hapticFeedback = 'light',
  onPress,
  ...rest
}: HapticTabProps) {
  const handlePress = async (event: any) => {
    // Trigger haptic feedback
    switch (hapticFeedback) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'selection':
        await Haptics.selectionAsync();
        break;
    }

    // Call the original onPress handler
    onPress?.(event);
  };

  return <TouchableOpacity onPress={handlePress} {...rest} />;
}