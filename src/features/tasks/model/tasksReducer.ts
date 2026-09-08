import { createTask, type Task } from './task';

export type TaskAction =
  | { type: 'added'; title: string }
  | { type: 'toggled'; id: string }
  | { type: 'removed'; id: string }
  | { type: 'clearedCompleted' }
  | { type: 'hydrated'; tasks: Task[] };

// Falla en compilación si se agrega una acción y se olvida su caso en el switch.
function assertNever(action: never): never {
  throw new Error(`Acción desconocida: ${JSON.stringify(action)}`);
}

// Función pura: sin efectos, siempre devuelve un arreglo nuevo. Es la máquina de estados.
export function tasksReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'added':
      // La regla de "no vacío" vive aquí, único punto de creación.
      if (action.title.trim() === '') return state;
      return [...state, createTask(action.title)];
    case 'toggled':
      // Inmutabilidad: map crea un arreglo nuevo y solo reemplaza el objeto afectado.
      return state.map((task) =>
        task.id === action.id ? { ...task, completed: !task.completed } : task,
      );
    case 'removed':
      return state.filter((task) => task.id !== action.id);
    case 'clearedCompleted':
      return state.filter((task) => !task.completed);
    case 'hydrated':
      return action.tasks;
    default:
      return assertNever(action);
  }
}
