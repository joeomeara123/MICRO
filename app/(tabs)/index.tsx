import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
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
    due_date: 'Today',
  },
  {
    id: '2',
    title: 'Approve contract: Acme Corp Partnership',
    description: 'Q1 partnership agreement. Legal has reviewed. Standard terms with 10% discount.',
    category: 'Contracts',
    priority_level: 'High',
    source: 'notion',
    due_date: 'Tomorrow',
  },
  {
    id: '3',
    title: 'Reply to James about project timeline',
    description: 'Client asking about updated delivery schedule for the mobile app MVP.',
    category: 'Client',
    priority_level: 'Medium',
    source: 'email',
    due_date: 'Today',
  },
  {
    id: '4',
    title: 'Review budget proposal for Q2',
    description: 'Finance team submitted updated numbers. Need approval before board meeting.',
    category: 'Finance',
    priority_level: 'Medium',
    source: 'notion',
    due_date: 'This week',
  },
  {
    id: '5',
    title: 'Consider new AI tool recommendation',
    description: 'Based on your recent searches, this tool might help with code reviews.',
    category: 'AI Suggestion',
    priority_level: 'Low',
    source: 'ai_suggestion',
  },
];

export default function TaskFeedScreen() {
  const handleSwipeLeft = (task: Task) => {
    console.log('Dismissed:', task.title);
    // TODO: Update task status in Notion/Supabase
  };

  const handleSwipeRight = (task: Task) => {
    console.log('Approved:', task.title);
    // TODO: Trigger agent action and update status
  };

  const handleCardPress = (task: Task) => {
    console.log('View details:', task.title);
    // TODO: Navigate to task detail modal
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <CardStack
        tasks={SAMPLE_TASKS}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onCardPress={handleCardPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
