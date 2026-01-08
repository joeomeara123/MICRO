import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SwipeableCard } from './SwipeableCard';
import { TaskCard, Task } from './TaskCard';

interface CardStackProps {
  tasks: Task[];
  onSwipeLeft?: (task: Task) => void;
  onSwipeRight?: (task: Task) => void;
  onCardPress?: (task: Task) => void;
}

export function CardStack({
  tasks,
  onSwipeLeft,
  onSwipeRight,
  onCardPress,
}: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = useCallback(() => {
    const task = tasks[currentIndex];
    if (onSwipeLeft) {
      onSwipeLeft(task);
    }
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, tasks, onSwipeLeft]);

  const handleSwipeRight = useCallback(() => {
    const task = tasks[currentIndex];
    if (onSwipeRight) {
      onSwipeRight(task);
    }
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, tasks, onSwipeRight]);

  // Show only 3 cards for performance
  const visibleTasks = tasks.slice(currentIndex, currentIndex + 3);

  if (visibleTasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎉</Text>
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptySubtitle}>
          No more tasks to review right now.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Render cards in reverse order so top card is rendered last (on top) */}
      {visibleTasks
        .slice()
        .reverse()
        .map((task, reversedIndex) => {
          const actualIndex = visibleTasks.length - 1 - reversedIndex;
          return (
            <SwipeableCard
              key={task.id}
              cardIndex={actualIndex}
              onSwipeLeft={actualIndex === 0 ? handleSwipeLeft : undefined}
              onSwipeRight={actualIndex === 0 ? handleSwipeRight : undefined}
            >
              <TaskCard
                task={task}
                onPress={() => onCardPress?.(task)}
              />
            </SwipeableCard>
          );
        })}

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {tasks.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
