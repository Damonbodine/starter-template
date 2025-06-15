import React from 'react';
import { View, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';

interface TabBarBackgroundProps {
  style?: any;
}

export default function TabBarBackground({ style }: TabBarBackgroundProps) {
  const theme = useColorScheme() ?? 'light';

  return (
    <BlurView
      intensity={95}
      tint={theme === 'dark' ? 'dark' : 'light'}
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)',
        },
        style,
      ]}
    />
  );
}