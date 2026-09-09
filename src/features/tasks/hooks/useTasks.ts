import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { isTask, type Task } from '../model/task';
import { tasksReducer } from '../model/tasksReducer';
import { filterTasks, type FilterName } from '../model/taskFilters';
import {
  createLocalStorageTaskStorage,
  STORAGE_KEY,
  type TaskStorage,
} from '../services/taskStorage';

export interface TaskStats {
  total: number;
  active: number;
  completed: number;
}

export interface UseTasksResult {
  tasks: Task[]; // ya filtradas
  filter: FilterName;
  stats: TaskStats; // siempre sobre el total, no sobre lo filtrado
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;
  setFilter: (filter: FilterName) => void;
}

const defaultStorage = createLocalStorageTaskStorage();

// SRP: coordina estado, filtro y efectos. Las reglas de negocio viven en el reducer y en los filtros.
export function useTasks(storage: TaskStorage = defaultStorage): UseTasksResult {
  // DIP: el estado inicial se pide a la interfaz de almacenamiento, no a localStorage directo.
  // Init perezoso: la carga solo corre en el primer render.
  const [allTasks, dispatch] = useReducer(tasksReducer, [], () => storage.load());
  const [filter, setFilter] = useState<FilterName>('all');

  // Efecto de persistencia: no hay suscripción, no necesita limpieza.
  useEffect(() => {
    storage.save(allTasks);
  }, [allTasks, storage]);

  // Efecto + limpieza: sincroniza pestañas por el evento "storage" y quita el listener al desmontar.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || event.newValue === null) return;
      try {
        const parsed: unknown = JSON.parse(event.newValue);
        if (Array.isArray(parsed) && parsed.every(isTask)) {
          dispatch({ type: 'hydrated', tasks: parsed });
        }
      } catch {
        // Un valor corrupto de otra pestaña no debe romper esta.
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const tasks = useMemo(() => filterTasks(allTasks, filter), [allTasks, filter]);

  const stats = useMemo<TaskStats>(
    () => ({
      total: allTasks.length,
      active: allTasks.filter((task) => !task.completed).length,
      completed: allTasks.filter((task) => task.completed).length,
    }),
    [allTasks],
  );

  // useCallback: identidad estable al pasar estas funciones como props hacia abajo.
  const addTask = useCallback((title: string) => dispatch({ type: 'added', title }), []);
  const toggleTask = useCallback((id: string) => dispatch({ type: 'toggled', id }), []);
  const removeTask = useCallback((id: string) => dispatch({ type: 'removed', id }), []);
  const clearCompleted = useCallback(() => dispatch({ type: 'clearedCompleted' }), []);

  return { tasks, filter, stats, addTask, toggleTask, removeTask, clearCompleted, setFilter };
}
