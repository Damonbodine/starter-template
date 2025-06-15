import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

interface HelloWaveProps {
  style?: object;
}

export default function HelloWave({ style }: HelloWaveProps) {
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.sequence([
        Animated.timing(rotateAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnimation, {
          toValue: -1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnimation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Repeat animation after a delay
        setTimeout(startAnimation, 2000);
      });
    };

    startAnimation();
  }, [rotateAnimation]);

  const animatedStyle = {
    transform: [
      {
        rotate: rotateAnimation.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-20deg', '0deg', '20deg'],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <Text style={styles.wave}>👋</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    fontSize: 28,
  },
});