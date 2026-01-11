import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SignInScreen() {
  const { signIn, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const progress = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    console.log('[SignIn] Screen mounted');
    // Animate in
    progress.value = withTiming(1, { duration: 800, easing: EASE_OUT });
  }, []);

  // Header animation - slides down and fades in
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 0.5],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      progress.value,
      [0, 0.6],
      [-30, 0],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateY }] };
  });

  // Subtitle animation - fades in after header
  const subtitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0.3, 0.7],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      progress.value,
      [0.3, 0.7],
      [20, 0],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateY }] };
  });

  // Button animation - slides up from bottom
  const buttonContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0.5, 1],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      progress.value,
      [0.5, 1],
      [40, 0],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateY }] };
  });

  // Button press animation
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError(null);
    setIsSigningIn(true);

    try {
      await signIn();
      // Navigation is handled by auth state change in _layout.tsx
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo/Brand */}
      <Animated.View style={[styles.headerContainer, headerStyle]}>
        <Text style={styles.logo}>MICRO</Text>
        <View style={styles.taglineRow}>
          <Text style={styles.tagline}>by palindrom</Text>
        </View>
      </Animated.View>

      {/* Value proposition */}
      <Animated.View style={[styles.subtitleContainer, subtitleStyle]}>
        <Text style={styles.subtitle}>
          Replace doom scrolling{'\n'}with productive micro-tasks
        </Text>
      </Animated.View>

      {/* Sign in button */}
      <Animated.View style={[styles.buttonContainer, buttonContainerStyle]}>
        <AnimatedPressable
          style={[styles.googleButton, buttonStyle, (isSigningIn || isLoading) && styles.googleButtonDisabled]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleSignIn}
          disabled={isSigningIn || isLoading}
        >
          {isSigningIn || isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#000" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </AnimatedPressable>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 24,
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -1,
  },
  taglineRow: {
    marginTop: 8,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitleContainer: {
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 34,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  disclaimer: {
    marginTop: 20,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
});
