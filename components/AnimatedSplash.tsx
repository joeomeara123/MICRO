import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
  Easing,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Polymarket easing: cubic-bezier(0.33, 1, 0.68, 1)
const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);

interface AnimatedSplashProps {
  onAnimationComplete: () => void;
}

export function AnimatedSplash({ onAnimationComplete }: AnimatedSplashProps) {
  // Animation progress: 0 → 1 (appear) → 2 (slide/reveal) → 3 (tagline) → 4 (fade)
  const progress = useSharedValue(0);

  const hapticMedium = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  const hapticLight = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  useEffect(() => {
    console.log('[Splash] Starting animation sequence');

    // PHASE 1 (0-500ms): M appears at center with scale + fade
    progress.value = withTiming(1, {
      duration: 500,
      easing: EASE_OUT
    }, (finished) => {
      if (finished) {
        console.log('[Splash] Phase 1 complete - M visible');
        runOnJS(hapticMedium)();

        // PHASE 2 (500-1200ms): M slides left, ICRO reveals
        progress.value = withDelay(200,
          withTiming(2, {
            duration: 700,
            easing: EASE_OUT
          }, (finished2) => {
            if (finished2) {
              console.log('[Splash] Phase 2 complete - MICRO visible');
              runOnJS(hapticLight)();

              // PHASE 3 (1400-2000ms): "by palindrom" fades in
              progress.value = withDelay(200,
                withTiming(3, {
                  duration: 600,
                  easing: EASE_OUT
                }, (finished3) => {
                  if (finished3) {
                    console.log('[Splash] Phase 3 complete - tagline visible');

                    // PHASE 4: Fade out
                    progress.value = withDelay(800,
                      withTiming(4, {
                        duration: 400,
                        easing: EASE_OUT
                      }, (finished4) => {
                        if (finished4) {
                          console.log('[Splash] Animation complete');
                          runOnJS(onAnimationComplete)();
                        }
                      })
                    );
                  }
                })
              );
            }
          })
        );
      }
    });
  }, []);

  // M letter - appears with scale, no horizontal movement needed
  const mStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.5],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // ICRO text - revealed via expanding clip as M slides
  const icroContainerStyle = useAnimatedStyle(() => {
    // Only start revealing after M starts sliding (progress > 1)
    const clipWidth = interpolate(
      progress.value,
      [1.2, 2],
      [0, 115], // Wipe from 0 to full ICRO width
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      progress.value,
      [1.2, 1.5],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      width: clipWidth,
      opacity,
    };
  });

  // Tagline - clean fade in
  const taglineStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [2.2, 3],
      [0, 1],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      progress.value,
      [2.2, 3],
      [10, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Container fade out
  const containerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [3, 4],
      [1, 0],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Logo row: M + ICRO */}
      <View style={styles.logoRow}>
        {/* The M - slides left */}
        <Animated.Text style={[styles.logoM, mStyle]}>M</Animated.Text>

        {/* ICRO - revealed via clip/mask effect */}
        <Animated.View style={[styles.icroClip, icroContainerStyle]}>
          <Text style={styles.icroText}>ICRO</Text>
        </Animated.View>
      </View>

      {/* Tagline - fades in cleanly underneath */}
      <Animated.Text style={[styles.tagline, taglineStyle]}>
        by palindrom
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline', // Align text baselines
  },
  logoM: {
    fontSize: 52,
    fontWeight: '700',
    color: '#fff',
  },
  icroClip: {
    overflow: 'hidden',
    marginLeft: -2, // Tight kerning with M
  },
  icroText: {
    fontSize: 52,
    fontWeight: '700',
    color: '#fff',
    width: 115, // Fixed width prevents text reflow during wipe
  },
  tagline: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 3,
    marginTop: 24,
    textTransform: 'uppercase',
  },
});
