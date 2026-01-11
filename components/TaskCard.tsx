import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo } from './BrandLogo';
import { CardTask } from '@/types/task';

// Re-export for backward compatibility with existing imports
export type Task = CardTask;

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  High: '#FF6B6B',
  Medium: '#FFE66D',
  Low: '#4ECDC4',
};

export function TaskCard({ task, onPress }: TaskCardProps) {
  const priorityColor = task.priority_level
    ? PRIORITY_COLORS[task.priority_level]
    : '#E0E0E0';

  // Use brand if provided, otherwise fall back to source
  const logoBrand = task.brand || task.source;

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {/* Header with brand logo and priority */}
      <View style={styles.header}>
        <View style={styles.sourceContainer}>
          <BrandLogo brand={logoBrand} size={28} />
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceText}>{task.owner || task.source}</Text>
            {task.brand && (
              <Text style={styles.brandText}>{task.brand}</Text>
            )}
          </View>
        </View>
        {task.priority_level && (
          <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
            <Text style={styles.priorityText}>{task.priority_level}</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {task.title}
      </Text>

      {/* Description */}
      {task.description && (
        <Text style={styles.description} numberOfLines={3}>
          {task.description}
        </Text>
      )}

      {/* Footer with category and due date */}
      <View style={styles.footer}>
        {task.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{task.category}</Text>
          </View>
        )}
        {task.due_date && (
          <View style={styles.dueDateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#999" />
            <Text style={styles.dueDateText}>{task.due_date}</Text>
          </View>
        )}
      </View>

      {/* Swipe hint */}
      <View style={styles.swipeHint}>
        <Text style={styles.swipeHintText}>← Dismiss | Approve →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sourceInfo: {
    flexDirection: 'column',
  },
  sourceText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  brandText: {
    fontSize: 11,
    color: '#999',
    marginTop: 1,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    lineHeight: 28,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  categoryBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: 12,
    color: '#999',
  },
  swipeHint: {
    marginTop: 20,
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 12,
    color: '#ccc',
    letterSpacing: 1,
  },
});
