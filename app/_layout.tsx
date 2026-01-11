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

  // Backup timeout in case animated splash doesn't complete
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (showAnimatedSplash) {
        console.log('[Splash] Backup timeout - forcing splash complete');
        setShowAnimatedSplash(false);
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [showAnimatedSplash]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav
        showAnimatedSplash={showAnimatedSplash}
        onSplashComplete={() => {
          console.log('[Splash] onSplashComplete called');
          setShowAnimatedSplash(false);
        }}
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

  // Handle auth-based routing
  useEffect(() => {
    if (isLoading || showAnimatedSplash) {
      console.log('[Layout] Waiting... isLoading:', isLoading, 'showAnimatedSplash:', showAnimatedSplash);
      return;
    }

    console.log('[Layout] Checking routing. isAuthenticated:', isAuthenticated, 'segments:', segments);

    const inAuthGroup = segments[0] === '(tabs)';
    const onSignIn = segments[0] === 'sign-in';
    const onOnboarding = segments[0] === 'onboarding';

    if (isAuthenticated) {
      // User is signed in
      if (onSignIn) {
        // Check if onboarding is complete
        AsyncStorage.getItem('onboarding_complete').then((value) => {
          if (value === 'true') {
            console.log('[Layout] Redirecting to tabs');
            router.replace('/(tabs)');
          } else {
            console.log('[Layout] Redirecting to onboarding');
            router.replace('/onboarding');
          }
        });
      }
    } else {
      // User is not signed in
      if (inAuthGroup || onOnboarding) {
        console.log('[Layout] Redirecting to sign-in');
        router.replace('/sign-in');
      }
    }
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

  // Show loading only during auth check (after splash completes)
  if (isLoading && !showAnimatedSplash) {
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
