/**
 * Task Service Module
 *
 * Exports all task-related service functions.
 */

export {
  fetchUserTasks,
  updateTaskStatus,
  snoozeTask,
  createTask,
  deleteTask,
} from './task-service';

export type {
  TaskServiceResult,
  FetchTasksOptions,
} from './task-service';
