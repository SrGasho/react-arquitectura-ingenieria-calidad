export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number; // epoch en milisegundos
}

// Recorta el título con trim. No valida vacío: esa regla vive en el reducer,
// que es el único punto de entrada de creación.
export function createTask(title: string): Task {
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: false,
    createdAt: Date.now(),
  };
}
