import React from 'react';
import { View, ViewProps, useColorScheme } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const theme = useColorScheme() ?? 'light';
  const backgroundColor = theme === 'dark' ? darkColor : lightColor;

  return (
    <View
      style={[
        {
          backgroundColor:
            backgroundColor || (theme === 'dark' ? '#151718' : '#FFFFFF'),
        },
        style,
      ]}
      {...otherProps}
    />
  );
}