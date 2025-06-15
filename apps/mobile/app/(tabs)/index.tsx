import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <View className="h-44 w-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
          <Text className="text-white text-3xl font-bold">Starter Template</Text>
        </View>
      }>
      <ThemedView className="flex-row items-center gap-2">
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView className="gap-2 mb-2">
        <ThemedText type="subtitle">This app includes:</ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">Expo Router</ThemedText> for file-based navigation
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">NativeWind</ThemedText> for Tailwind CSS styling
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">TypeScript</ThemedText> for type safety
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">Shared packages</ThemedText> across web and mobile
        </ThemedText>
      </ThemedView>
      <StatusBar style="auto" />
    </ParallaxScrollView>
  );
}