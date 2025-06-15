import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View, Platform } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="code-slash" style={styles.headerImage} />}>
      <ThemedView className="gap-2 mb-2">
        <ThemedText type="title">Explore</ThemedText>
        <ThemedText>This app is built with modern React Native technologies.</ThemedText>
      </ThemedView>
      
      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      
      <Collapsible title="NativeWind + Tailwind CSS">
        <ThemedText>
          This template uses{' '}
          <ThemedText type="defaultSemiBold">NativeWind</ThemedText> to bring Tailwind CSS 
          to React Native. You can use familiar utility classes for styling.
        </ThemedText>
        <ExternalLink href="https://www.nativewind.dev/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      
      <Collapsible title="Shared packages">
        <ThemedText>
          Code is shared between web and mobile apps through workspace packages:
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">@starter-template/ui</ThemedText> - Shared components
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">@starter-template/database</ThemedText> - Supabase utilities
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">@starter-template/shared</ThemedText> - Common utilities
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
});