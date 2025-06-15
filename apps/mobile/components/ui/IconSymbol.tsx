import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolScale } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'plus': 'add',
  'minus': 'remove',
  'person.fill': 'person',
  'gear': 'settings',
  'magnifyingglass': 'search',
  'bell.fill': 'notifications',
  'heart.fill': 'favorite',
  'star.fill': 'star',
  'bookmark.fill': 'bookmark',
  'share': 'share',
  'trash': 'delete',
  'pencil': 'edit',
  'checkmark': 'check',
  'xmark': 'close',
  'info.circle': 'info',
  'exclamationmark.triangle': 'warning',
  'checkmark.circle': 'check-circle',
  'xmark.circle': 'cancel',
} as const;

export type IconSymbolName = keyof typeof MAPPING;

interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
  scale?: SymbolScale;
}

/**
 * An icon component that uses expo-symbols on iOS, and MaterialIcons on Android and web.
 * This ensures a consistent look across platforms while adapting to each platform's design language.
 *
 * Add new icons by including them in the `MAPPING` object and updating the `IconSymbolName` type.
 */
export function IconSymbol({
  name,
  size = 24,
  color = '#000000',
  style,
  weight = 'regular',
  scale = 'default',
}: IconSymbolProps) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}