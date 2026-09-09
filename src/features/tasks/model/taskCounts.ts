import { taskFilters } from './taskFilters';
import type { Task } from './task';

export interface TaskCounts {
  total: number;
  active: number;
  completed: number;
}

// Derivación pura sobre el total, no sobre lo filtrado. Reutiliza los mismos
// predicados que la barra de filtros: una sola definición de "activa".
export function countTasks(tasks: Task[]): TaskCounts {
  const completed = tasks.filter(taskFilters.completed).length;
  return { total: tasks.length, active: tasks.length - completed, completed };
}
