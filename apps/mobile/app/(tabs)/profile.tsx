import { View, Text, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ProfileScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="pt-16 px-4">
        <ThemedView className="items-center mb-8">
          <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-4">
            <Text className="text-primary-foreground text-2xl font-bold">ST</Text>
          </View>
          <ThemedText type="title">Starter Template</ThemedText>
          <ThemedText type="default" className="text-muted-foreground">
            Mobile App Profile
          </ThemedText>
        </ThemedView>

        <ThemedView className="gap-4">
          <View className="bg-card rounded-lg p-4 border border-border">
            <ThemedText type="subtitle" className="mb-2">About</ThemedText>
            <ThemedText className="text-muted-foreground">
              This is a sample profile screen built with Expo Router and NativeWind. 
              It demonstrates how to create beautiful, responsive layouts using Tailwind utility classes.
            </ThemedText>
          </View>

          <View className="bg-card rounded-lg p-4 border border-border">
            <ThemedText type="subtitle" className="mb-2">Features</ThemedText>
            <View className="gap-2">
              <Text className="text-foreground">✓ TypeScript support</Text>
              <Text className="text-foreground">✓ Expo Router navigation</Text>
              <Text className="text-foreground">✓ NativeWind styling</Text>
              <Text className="text-foreground">✓ Shared component library</Text>
              <Text className="text-foreground">✓ Turborepo monorepo</Text>
            </View>
          </View>

          <View className="bg-card rounded-lg p-4 border border-border">
            <ThemedText type="subtitle" className="mb-2">Settings</ThemedText>
            <View className="gap-3">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-foreground">Dark Mode</Text>
                <Text className="text-muted-foreground">Auto</Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-foreground">Notifications</Text>
                <Text className="text-muted-foreground">Enabled</Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-foreground">Version</Text>
                <Text className="text-muted-foreground">1.0.0</Text>
              </View>
            </View>
          </View>
        </ThemedView>
      </View>
    </ScrollView>
  );
}