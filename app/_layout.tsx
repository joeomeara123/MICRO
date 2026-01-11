import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AnimatedSplash } from '@/components/AnimatedSplash';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav
        showAnimatedSplash={showAnimatedSplash}
        onSplashComplete={() => setShowAnimatedSplash(false)}
      />
    </AuthProvider>
  );
}

interface RootLayoutNavProps {
  showAnimatedSplash: boolean;
  onSplashComplete: () => void;
}

function RootLayoutNav({ showAnimatedSplash, onSplashComplete }: RootLayoutNavProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  // Handle auth-based routing
  useEffect(() => {
    if (isLoading || showAnimatedSplash) return;

    const checkRouting = async () => {
      const inAuthGroup = segments[0] === '(tabs)';
      const onSignIn = segments[0] === 'sign-in';
      const onOnboarding = segments[0] === 'onboarding';

      if (isAuthenticated) {
        // User is signed in
        if (onSignIn) {
          // Check if onboarding is complete
          const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');
          if (onboardingComplete === 'true') {
            router.replace('/(tabs)');
          } else {
            router.replace('/onboarding');
          }
        }
      } else {
        // User is not signed in
        if (inAuthGroup || onOnboarding) {
          router.replace('/sign-in');
        }
      }
      setIsCheckingOnboarding(false);
    };

    checkRouting();
  }, [isAuthenticated, isLoading, segments, showAnimatedSplash]);

  // Force dark theme for consistent look
  const darkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#000',
      card: '#000',
    },
  };

  // Show loading while checking auth
  if (isLoading || isCheckingOnboarding) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={darkTheme}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>

          {/* Animated splash overlay */}
          {showAnimatedSplash && (
            <AnimatedSplash onAnimationComplete={onSplashComplete} />
          )}
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
