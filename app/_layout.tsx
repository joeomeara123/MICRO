import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';

import { AnimatedSplash } from '@/components/AnimatedSplash';

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
    <RootLayoutNav
      showAnimatedSplash={showAnimatedSplash}
      onSplashComplete={() => setShowAnimatedSplash(false)}
    />
  );
}

interface RootLayoutNavProps {
  showAnimatedSplash: boolean;
  onSplashComplete: () => void;
}

function RootLayoutNav({ showAnimatedSplash, onSplashComplete }: RootLayoutNavProps) {
  // Force dark theme for consistent look
  const darkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#000',
      card: '#000',
    },
  };

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
