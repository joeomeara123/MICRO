import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface OnboardingCard {
  id: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
}

const ONBOARDING_CARDS: OnboardingCard[] = [
  {
    id: 1,
    icon: 'swap-horizontal',
    iconColor: '#4ECDC4',
    title: 'Swipe to take action',
    description: 'Swipe right to approve or complete.\nSwipe left to dismiss or skip.',
  },
  {
    id: 2,
    icon: 'checkbox-outline',
    iconColor: '#FF6B6B',
    title: 'Tasks Mode',
    description: 'Actionable micro-tasks from Notion,\nemail, and AI suggestions.',
  },
  {
    id: 3,
    icon: 'book-outline',
    iconColor: '#9B59B6',
    title: 'Learning Mode',
    description: 'Curated content from X, team Slack,\nand sources you trust.',
  },
];

function TutorialCard({
  card,
  index,
  currentIndex,
  onSwipe
}: {
  card: OnboardingCard;
  index: number;
  currentIndex: number;
  onSwipe: () => void;
}) {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  const isActive = index === currentIndex;
  const stackOffset = index - currentIndex;

  const panGesture = Gesture.Pan()
    .enabled(isActive)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      rotate.value = e.translationX / 20;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const direction = e.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        runOnJS(onSwipe)();
      } else {
        translateX.value = withSpring(0, { damping: 15 });
        rotate.value = withSpring(0, { damping: 15 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      stackOffset,
      [0, 1, 2],
      [1, 0.95, 0.9],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      stackOffset,
      [0, 1, 2],
      [0, 10, 20],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      stackOffset,
      [0, 1, 2],
      [1, 0.7, 0.4],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: isActive ? translateX.value : 0 },
        { rotate: isActive ? `${rotate.value}deg` : '0deg' },
        { scale },
        { translateY },
      ],
      opacity,
      zIndex: ONBOARDING_CARDS.length - stackOffset,
    };
  });

  if (stackOffset < 0 || stackOffset > 2) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <View style={[styles.iconContainer, { backgroundColor: `${card.iconColor}20` }]}>
          <Ionicons name={card.icon} size={48} color={card.iconColor} />
        </View>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardDescription}>{card.description}</Text>

        {isActive && (
          <View style={styles.swipeHint}>
            <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.3)" />
            <Text style={styles.swipeHintText}>swipe to continue</Text>
            <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.3)" />
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const buttonScale = useSharedValue(1);

  const handleSwipe = () => {
    if (currentIndex < ONBOARDING_CARDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    completeOnboarding();
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const isLastCard = currentIndex === ONBOARDING_CARDS.length - 1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>How it works</Text>
        <Pressable onPress={handleSkip} hitSlop={20}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Card stack */}
      <View style={styles.cardContainer}>
        {ONBOARDING_CARDS.map((card, index) => (
          <TutorialCard
            key={card.id}
            card={card}
            index={index}
            currentIndex={currentIndex}
            onSwipe={handleSwipe}
          />
        ))}
      </View>

      {/* Progress dots */}
      <View style={styles.progressContainer}>
        {ONBOARDING_CARDS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentIndex && styles.progressDotActive,
              index < currentIndex && styles.progressDotComplete,
            ]}
          />
        ))}
      </View>

      {/* Get Started button (shows on last card) */}
      {isLastCard && (
        <AnimatedPressable
          style={[styles.getStartedButton, buttonStyle]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={completeOnboarding}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  skipText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 48,
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  swipeHintText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressDotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  progressDotComplete: {
    backgroundColor: '#4ECDC4',
  },
  getStartedButton: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 40,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});
