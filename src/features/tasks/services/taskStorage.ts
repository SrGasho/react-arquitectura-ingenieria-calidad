import type { Task } from '../model/task';

// DIP: los consumidores dependen de esta interfaz, no de una implementación concreta.
export interface TaskStorage {
  load(): Task[];
  save(tasks: Task[]): void;
}

export const STORAGE_KEY = 'task-dashboard.tasks';

export function createLocalStorageTaskStorage(): TaskStorage {
  return {
    load() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return [];
      try {
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as Task[]) : [];
      } catch (error) {
        // Sin fallo silencioso: se informa y se degrada a lista vacía.
        console.warn('No se pudieron leer las tareas guardadas, se empieza vacío.', error);
        return [];
      }
    },
    save(tasks) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    },
  };
}

// Implementación en memoria para pruebas: no depende del navegador y permite inyectar estado.
export function createMemoryTaskStorage(initial: Task[] = []): TaskStorage {
  let tasks = [...initial];
  return {
    load() {
      return [...tasks];
    },
    save(next) {
      tasks = [...next];
    },
  };
}
