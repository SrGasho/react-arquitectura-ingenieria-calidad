// Contadores derivados del total de tareas. Datos puros, sin React: por eso
// viven en la capa de modelo y no en el hook que los calcula.
export interface TaskCounts {
  total: number;
  active: number;
  completed: number;
}
