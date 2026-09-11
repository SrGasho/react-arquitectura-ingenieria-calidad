import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { isTask, type Task } from '../model/task';
import { tasksReducer } from '../model/tasksReducer';
import { filterTasks, type FilterName } from '../model/taskFilters';
import { countTasks, type TaskCounts } from '../model/taskCounts';
import {
  createLocalStorageTaskStorage,
  STORAGE_KEY,
  type TaskStorage,
} from '../services/taskStorage';

export interface UseTasksResult {
  tasks: Task[];
  filter: FilterName;
  stats: TaskCounts;
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;
  setFilter: (filter: FilterName) => void;
}

const defaultStorage = createLocalStorageTaskStorage();

// coordina estado, filtro y efectos. Las reglas de negocio viven en el reducer y en los filtros.
export function useTasks(storage: TaskStorage = defaultStorage): UseTasksResult {
  const [allTasks, dispatch] = useReducer(tasksReducer, [], () => storage.load());
  const [filter, setFilter] = useState<FilterName>('all');

  // Efecto de persistencia: no hay suscripción, no necesita limpieza.
  useEffect(() => {
    storage.save(allTasks);
  }, [allTasks, storage]);

  // sincroniza pestañas por el evento "storage" y quita el listener al desmontar.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || event.newValue === null) return;
      try {
        const parsed: unknown = JSON.parse(event.newValue);
        // Si no pasa isTask se descarta sin aviso a propósito el emisor es
        // otra pestaña de esta misma app, no una fuente externa.
        if (Array.isArray(parsed) && parsed.every(isTask)) {
          dispatch({ type: 'hydrated', tasks: parsed });
        }
      } catch {
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const tasks = useMemo(() => filterTasks(allTasks, filter), [allTasks, filter]);

  // Los contadores son derivación pura se calculan en el modelo, no aquí.
  const stats = useMemo(() => countTasks(allTasks), [allTasks]);

  const addTask = useCallback((title: string) => dispatch({ type: 'added', title }), []);
  const toggleTask = useCallback((id: string) => dispatch({ type: 'toggled', id }), []);
  const removeTask = useCallback((id: string) => dispatch({ type: 'removed', id }), []);
  const clearCompleted = useCallback(() => dispatch({ type: 'clearedCompleted' }), []);

  return { tasks, filter, stats, addTask, toggleTask, removeTask, clearCompleted, setFilter };
}
