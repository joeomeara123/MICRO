import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardStack } from '@/components/CardStack';
import { Task } from '@/components/TaskCard';

// Sample learning content - curated articles, tweets, links
const SAMPLE_LEARNING: Task[] = [
  {
    id: '1',
    title: 'AI agents are changing how we work',
    description: 'Thread on the latest developments in AI agent frameworks and what it means for productivity.',
    category: 'AI',
    priority_level: 'High',
    source: 'twitter',
    brand: 'Twitter',
    owner: '@sama',
  },
  {
    id: '2',
    title: 'The future of remote collaboration',
    description: 'Great insights from the team at Linear on async-first communication.',
    category: 'Team',
    priority_level: 'Medium',
    source: 'slack',
    brand: 'Slack',
    owner: '#general',
  },
  {
    id: '3',
    title: 'Building products users love',
    description: 'Lenny\'s newsletter on product-market fit and user research techniques.',
    category: 'Product',
    priority_level: 'Medium',
    source: 'newsletter',
    brand: 'Lenny',
    owner: 'Lenny Rachitsky',
  },
  {
    id: '4',
    title: 'Startup fundraising in 2025',
    description: 'Key trends and what VCs are looking for in the current market.',
    category: 'Finance',
    priority_level: 'Low',
    source: 'article',
    brand: 'First Round',
    owner: 'First Round Review',
  },
];

export default function LearningScreen() {
  const handleSwipeLeft = (task: Task) => {
    console.log('[Learning] Skipped:', task.title);
  };

  const handleSwipeRight = (task: Task) => {
    console.log('[Learning] Saved:', task.title);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning</Text>
        <Text style={styles.headerSubtitle}>Curated content for you</Text>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        <CardStack
          tasks={SAMPLE_LEARNING}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  cardContainer: {
    flex: 1,
  },
});
