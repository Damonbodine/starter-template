import React, { ReactNode, useRef } from 'react';
import {
  ScrollView,
  View,
  Animated,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

interface ParallaxScrollViewProps {
  children: ReactNode;
  headerBackgroundColor?: string;
  headerImage?: ReactNode;
  headerHeight?: number;
}

export default function ParallaxScrollView({
  children,
  headerBackgroundColor = '#A1CEDC',
  headerImage,
  headerHeight = 250,
}: ParallaxScrollViewProps) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollView}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[styles.header, { height: headerHeight }]}>
          <Animated.View
            style={[
              styles.headerBackground,
              {
                backgroundColor: headerBackgroundColor,
                transform: [
                  {
                    translateY: scrollY.interpolate({
                      inputRange: [0, headerHeight],
                      outputRange: [0, -headerHeight / 2],
                      extrapolate: 'clamp',
                    }),
                  },
                  {
                    scale: scrollY.interpolate({
                      inputRange: [-headerHeight, 0],
                      outputRange: [1.5, 1],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
          />
          {headerImage && (
            <Animated.View
              style={[
                styles.headerImageContainer,
                {
                  transform: [
                    {
                      translateY: scrollY.interpolate({
                        inputRange: [0, headerHeight],
                        outputRange: [0, -headerHeight / 3],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            >
              {headerImage}
            </Animated.View>
          )}
        </View>
        <View style={styles.content}>{children}</View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});