import React, { ReactNode, useState } from 'react';
import {
  View,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface CollapsibleProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function Collapsible({
  title,
  children,
  defaultExpanded = false,
}: CollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <ThemedView>
      <TouchableOpacity
        onPress={toggleExpanded}
        className="flex-row items-center justify-between py-3 px-4"
        activeOpacity={0.7}
      >
        <ThemedText type="defaultSemiBold" className="flex-1">
          {title}
        </ThemedText>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#666"
        />
      </TouchableOpacity>
      {isExpanded && (
        <View className="px-4 pb-3">
          {children}
        </View>
      )}
    </ThemedView>
  );
}