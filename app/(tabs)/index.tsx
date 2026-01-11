import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { CardStack } from '@/components/CardStack';
import { Task } from '@/components/TaskCard';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchUserTasks,
  updateTaskStatus,
} from '@/services/tasks/task-service';
import { taskToCardTask } from '@/types/task';

// Sample tasks for demo - used as fallback when database is empty
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
  const { user, isLoading: isAuthLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);

  // Fetch tasks when user is available
  const loadTasks = useCallback(async () => {
    if (!user?.id) {
      console.log('[Feed] No user, using sample tasks');
      setTasks(SAMPLE_TASKS);
      setUsingSampleData(true);
      setIsLoading(false);
      return;
    }

    console.log('[Feed] Fetching tasks for user:', user.id);
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await fetchUserTasks(user.id, {
      status: 'pending',
    });

    if (fetchError) {
      console.error('[Feed] Error fetching tasks:', fetchError);
      setError(fetchError.message);
      setTasks(SAMPLE_TASKS);
      setUsingSampleData(true);
    } else if (data && data.length > 0) {
      console.log('[Feed] Loaded', data.length, 'tasks from database');
      // Convert database tasks to CardTask format
      const cardTasks = data.map((task) => taskToCardTask(task));
      setTasks(cardTasks);
      setUsingSampleData(false);
    } else {
      console.log('[Feed] No tasks in database, using sample tasks');
      setTasks(SAMPLE_TASKS);
      setUsingSampleData(true);
    }

    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthLoading) {
      loadTasks();
    }
  }, [isAuthLoading, loadTasks]);

  const handleSwipeLeft = async (task: Task) => {
    console.log('[Feed] Dismissed:', task.title);

    // Only update database if using real data
    if (!usingSampleData && user?.id) {
      const { error } = await updateTaskStatus(task.id, 'dismissed');
      if (error) {
        console.error('[Feed] Error updating task status:', error);
      } else {
        console.log('[Feed] Task status updated to dismissed');
      }
    }
  };

  const handleSwipeRight = async (task: Task) => {
    console.log('[Feed] Approved:', task.title);

    // Only update database if using real data
    if (!usingSampleData && user?.id) {
      const { error } = await updateTaskStatus(task.id, 'approved');
      if (error) {
        console.error('[Feed] Error updating task status:', error);
      } else {
        console.log('[Feed] Task status updated to approved');
      }
    }
  };

  // Loading state
  if (isAuthLoading || isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  // Error state with retry option
  if (error && !usingSampleData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error loading tasks</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadTasks}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
        <Pressable
          style={styles.useSampleButton}
          onPress={() => {
            setTasks(SAMPLE_TASKS);
            setUsingSampleData(true);
            setError(null);
          }}
        >
          <Text style={styles.useSampleButtonText}>Use Sample Data</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <Text style={styles.headerSubtitle}>
          {tasks.length} items to review
          {usingSampleData && ' (Sample)'}
        </Text>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        <CardStack
          tasks={tasks}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorDetail: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  useSampleButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  useSampleButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
});
