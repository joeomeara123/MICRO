/**
 * Task Service Layer
 *
 * Encapsulates all task database operations.
 * Components call these functions instead of directly using Supabase.
 *
 * @see types/task.ts for Task types
 * @see types/database.ts for database types
 */

import { supabase } from '../supabase';
import type { Task, TaskInsert, TaskStatus, TaskSource } from '../../types/task';

// ============================================================
// Result Types
// ============================================================

/**
 * Standard result type for all service operations.
 * Either contains data on success, or error on failure.
 */
export interface TaskServiceResult<T> {
  data: T | null;
  error: Error | null;
}

// ============================================================
// Query Options
// ============================================================

/**
 * Options for fetching tasks
 */
export interface FetchTasksOptions {
  /** Filter by task status */
  status?: TaskStatus | TaskStatus[];
  /** Filter by task source */
  source?: TaskSource | TaskSource[];
  /** Maximum number of tasks to return (default: 50) */
  limit?: number;
  /** Include soft-deleted tasks (default: false) */
  includeDeleted?: boolean;
}

// ============================================================
// Service Functions
// ============================================================

/**
 * Fetch tasks for a user with optional filtering.
 *
 * @param userId - The user's ID from auth
 * @param options - Optional filters for status, source, limit
 * @returns TaskServiceResult with array of tasks or error
 *
 * @example
 * const { data, error } = await fetchUserTasks(userId, { status: 'pending', limit: 20 });
 */
export async function fetchUserTasks(
  userId: string,
  options: FetchTasksOptions = {}
): Promise<TaskServiceResult<Task[]>> {
  console.log('[TaskService] fetchUserTasks called', { userId, options });

  try {
    const { status, source, limit = 50, includeDeleted = false } = options;

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by deleted_at unless includeDeleted is true
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    // Filter by status
    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
    }

    // Filter by source
    if (source) {
      if (Array.isArray(source)) {
        query = query.in('source', source);
      } else {
        query = query.eq('source', source);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('[TaskService] fetchUserTasks error:', error);
      return { data: null, error: new Error(error.message) };
    }

    console.log('[TaskService] fetchUserTasks success, count:', data?.length ?? 0);
    return { data: data as Task[], error: null };
  } catch (err) {
    console.error('[TaskService] fetchUserTasks exception:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error fetching tasks'),
    };
  }
}

/**
 * Update a task's status.
 *
 * @param taskId - The task's ID
 * @param status - New status (approved, dismissed, snoozed, pending)
 * @returns TaskServiceResult with updated task or error
 *
 * @example
 * const { data, error } = await updateTaskStatus(taskId, 'approved');
 */
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<TaskServiceResult<Task>> {
  console.log('[TaskService] updateTaskStatus called', { taskId, status });

  try {
    const updateData: { status: TaskStatus; actioned_at?: string } = { status };

    // Set actioned_at timestamp for terminal statuses
    if (status === 'approved' || status === 'dismissed') {
      updateData.actioned_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('[TaskService] updateTaskStatus error:', error);
      return { data: null, error: new Error(error.message) };
    }

    console.log('[TaskService] updateTaskStatus success:', data);
    return { data: data as Task, error: null };
  } catch (err) {
    console.error('[TaskService] updateTaskStatus exception:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error updating task status'),
    };
  }
}

/**
 * Snooze a task until a specified time.
 *
 * @param taskId - The task's ID
 * @param until - ISO date string for when to unsnooze
 * @returns TaskServiceResult with updated task or error
 *
 * @example
 * const tomorrow = new Date();
 * tomorrow.setDate(tomorrow.getDate() + 1);
 * const { data, error } = await snoozeTask(taskId, tomorrow.toISOString());
 */
export async function snoozeTask(
  taskId: string,
  until: string
): Promise<TaskServiceResult<Task>> {
  console.log('[TaskService] snoozeTask called', { taskId, until });

  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'snoozed' as TaskStatus,
        snoozed_until: until,
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('[TaskService] snoozeTask error:', error);
      return { data: null, error: new Error(error.message) };
    }

    console.log('[TaskService] snoozeTask success:', data);
    return { data: data as Task, error: null };
  } catch (err) {
    console.error('[TaskService] snoozeTask exception:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error snoozing task'),
    };
  }
}

/**
 * Create a new task.
 *
 * @param task - Task data to insert (user_id, source, title required)
 * @returns TaskServiceResult with created task or error
 *
 * @example
 * const { data, error } = await createTask({
 *   user_id: userId,
 *   source: 'manual',
 *   title: 'New task',
 *   priority_level: 'medium',
 * });
 */
export async function createTask(
  task: TaskInsert
): Promise<TaskServiceResult<Task>> {
  console.log('[TaskService] createTask called', { task });

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) {
      console.error('[TaskService] createTask error:', error);
      return { data: null, error: new Error(error.message) };
    }

    console.log('[TaskService] createTask success:', data);
    return { data: data as Task, error: null };
  } catch (err) {
    console.error('[TaskService] createTask exception:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error creating task'),
    };
  }
}

/**
 * Soft delete a task.
 *
 * @param taskId - The task's ID
 * @returns TaskServiceResult with deleted task or error
 *
 * @example
 * const { data, error } = await deleteTask(taskId);
 */
export async function deleteTask(
  taskId: string
): Promise<TaskServiceResult<Task>> {
  console.log('[TaskService] deleteTask called', { taskId });

  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('[TaskService] deleteTask error:', error);
      return { data: null, error: new Error(error.message) };
    }

    console.log('[TaskService] deleteTask success:', data);
    return { data: data as Task, error: null };
  } catch (err) {
    console.error('[TaskService] deleteTask exception:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error deleting task'),
    };
  }
}
