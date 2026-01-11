/**
 * Task Types
 *
 * Provides type-safe Task interface with source-specific metadata.
 * Uses discriminated unions to type the JSONB metadata column based on source.
 *
 * @see types/database.ts for generated database types
 * @see supabase/migrations/20260111000004_create_tasks.sql for schema
 */

import type { Database, Tables, TablesInsert, TablesUpdate } from './database';

// Database row types
export type TaskRow = Tables<'tasks'>;
export type TaskInsert = TablesInsert<'tasks'>;
export type TaskUpdate = TablesUpdate<'tasks'>;

// Enum types from database
export type TaskSource = Database['public']['Enums']['task_source'];
export type TaskStatus = Database['public']['Enums']['task_status'];
export type TaskPriority = Database['public']['Enums']['task_priority'];

// ============================================================
// Source-Specific Metadata Types
// ============================================================

/**
 * Metadata for tasks sourced from Notion
 */
export interface NotionTaskMetadata {
  page_id: string;
  database_id: string;
  properties?: Record<string, unknown>;
  url: string;
}

/**
 * Metadata for tasks sourced from Email (Gmail)
 */
export interface EmailTaskMetadata {
  message_id: string;
  thread_id: string;
  from: string;
  to: string[];
  subject: string;
  snippet?: string;
}

/**
 * Metadata for tasks sourced from Slack
 */
export interface SlackTaskMetadata {
  channel_id: string;
  channel_name: string;
  message_ts: string;
  thread_ts?: string;
  sender_id: string;
  sender_name?: string;
}

/**
 * Metadata for AI-suggested tasks
 */
export interface AISuggestionMetadata {
  confidence: number;
  reasoning?: string;
  related_task_ids?: string[];
}

/**
 * Metadata for manually created tasks
 */
export interface ManualTaskMetadata {
  created_via?: 'app' | 'api';
  notes?: string;
}

/**
 * Union of all possible metadata types
 */
export type TaskMetadata =
  | NotionTaskMetadata
  | EmailTaskMetadata
  | SlackTaskMetadata
  | AISuggestionMetadata
  | ManualTaskMetadata
  | Record<string, unknown>;

// ============================================================
// Task Interface (extends database row with typed metadata)
// ============================================================

/**
 * Base Task interface matching database schema.
 * Used by UI components for display.
 */
export interface Task extends Omit<TaskRow, 'metadata'> {
  metadata: TaskMetadata;
}

/**
 * Task with Notion source - fully typed metadata
 */
export interface NotionTask extends Omit<Task, 'source' | 'metadata'> {
  source: 'notion';
  metadata: NotionTaskMetadata;
}

/**
 * Task with Email source - fully typed metadata
 */
export interface EmailTask extends Omit<Task, 'source' | 'metadata'> {
  source: 'email';
  metadata: EmailTaskMetadata;
}

/**
 * Task with Slack source - fully typed metadata
 */
export interface SlackTask extends Omit<Task, 'source' | 'metadata'> {
  source: 'slack';
  metadata: SlackTaskMetadata;
}

/**
 * Task with AI suggestion source - fully typed metadata
 */
export interface AISuggestionTask extends Omit<Task, 'source' | 'metadata'> {
  source: 'ai_suggestion';
  metadata: AISuggestionMetadata;
}

/**
 * Task with manual source - fully typed metadata
 */
export interface ManualTask extends Omit<Task, 'source' | 'metadata'> {
  source: 'manual';
  metadata: ManualTaskMetadata;
}

// ============================================================
// Type Guards
// ============================================================

export function isNotionTask(task: Task): task is NotionTask {
  return task.source === 'notion';
}

export function isEmailTask(task: Task): task is EmailTask {
  return task.source === 'email';
}

export function isSlackTask(task: Task): task is SlackTask {
  return task.source === 'slack';
}

export function isAISuggestionTask(task: Task): task is AISuggestionTask {
  return task.source === 'ai_suggestion';
}

export function isManualTask(task: Task): task is ManualTask {
  return task.source === 'manual';
}

// ============================================================
// UI-Friendly Types
// ============================================================

/**
 * Priority display values (capitalized for UI)
 */
export type PriorityDisplay = 'High' | 'Medium' | 'Low';

/**
 * Extended source types for UI (includes learning mode sources)
 */
export type CardSource = TaskSource | 'twitter' | 'newsletter' | 'article';

/**
 * CardTask - UI-compatible Task type for components
 *
 * Extends the database Task with UI-specific fields:
 * - brand: Display name for the source (e.g., "Notion", "Gmail")
 * - owner: Who the task is from (e.g., email sender, database name)
 * - priority_level: Uses capitalized display values
 * - source: Includes additional learning mode sources
 *
 * Use this type in components. Convert from Task when fetching from database.
 */
export interface CardTask {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priority_level?: PriorityDisplay;
  source: CardSource;
  due_date?: string;
  // UI-specific fields
  owner?: string;
  brand?: string;
}

/**
 * Map database priority to display value
 */
export function priorityToDisplay(priority: TaskPriority | null): PriorityDisplay | undefined {
  if (!priority) return undefined;
  const map: Record<TaskPriority, PriorityDisplay> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return map[priority];
}

/**
 * Map display value to database priority
 */
export function displayToPriority(display: PriorityDisplay): TaskPriority {
  const map: Record<PriorityDisplay, TaskPriority> = {
    High: 'high',
    Medium: 'medium',
    Low: 'low',
  };
  return map[display];
}

/**
 * Convert database Task to CardTask for UI display
 */
export function taskToCardTask(task: Task): CardTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? undefined,
    category: task.category ?? undefined,
    priority_level: priorityToDisplay(task.priority_level),
    source: task.source,
    due_date: task.due_date ?? undefined,
    // These will be populated from metadata in integration-specific code
    owner: undefined,
    brand: getSourceBrand(task.source),
  };
}

/**
 * Get display brand name for a source
 */
export function getSourceBrand(source: CardSource): string {
  const brands: Record<CardSource, string> = {
    notion: 'Notion',
    email: 'Gmail',
    slack: 'Slack',
    ai_suggestion: 'AI',
    manual: 'Manual',
    twitter: 'X',
    newsletter: 'Newsletter',
    article: 'Article',
  };
  return brands[source];
}
