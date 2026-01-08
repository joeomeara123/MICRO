import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardStack } from '@/components/CardStack';
import { Task } from '@/components/TaskCard';

// Sample tasks for demo - will be replaced with Notion/Supabase data
const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'Review CV: Sarah Johnson - Senior Engineer',
    description: 'Strong background in React Native and TypeScript. 5 years experience at FAANG companies. Referred by Mike.',
    category: 'Hiring',
    priority_level: 'High',
    source: 'notion',
    brand: 'Notion',
    owner: 'Hiring Pipeline',
    due_date: 'Today',
  },
  {
    id: '2',
    title: 'Approve contract: Acme Corp Partnership',
    description: 'Q1 partnership agreement. Legal has reviewed. Standard terms with 10% discount.',
    category: 'Contracts',
    priority_level: 'High',
    source: 'notion',
    brand: 'Notion',
    owner: 'Legal Docs',
    due_date: 'Tomorrow',
  },
  {
    id: '3',
    title: 'Reply to James about project timeline',
    description: 'Client asking about updated delivery schedule for the mobile app MVP.',
    category: 'Client',
    priority_level: 'Medium',
    source: 'email',
    brand: 'Gmail',
    owner: 'james@acme.com',
    due_date: 'Today',
  },
  {
    id: '4',
    title: 'Review budget proposal for Q2',
    description: 'Finance team submitted updated numbers. Need approval before board meeting.',
    category: 'Finance',
    priority_level: 'Medium',
    source: 'notion',
    brand: 'Notion',
    owner: 'Finance',
    due_date: 'This week',
  },
  {
    id: '5',
    title: 'Consider new AI tool recommendation',
    description: 'Based on your recent searches, this tool might help with code reviews.',
    category: 'AI Suggestion',
    priority_level: 'Low',
    source: 'ai_suggestion',
    owner: 'MICRO AI',
  },
];

export default function TaskFeedScreen() {
  const handleSwipeLeft = (task: Task) => {
    console.log('[Tasks] Dismissed:', task.title);
  };

  const handleSwipeRight = (task: Task) => {
    console.log('[Tasks] Approved:', task.title);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <Text style={styles.headerSubtitle}>{SAMPLE_TASKS.length} items to review</Text>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        <CardStack
          tasks={SAMPLE_TASKS}
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
