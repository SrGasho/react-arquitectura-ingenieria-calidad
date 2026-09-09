import { TasksDashboard } from './features/tasks/TasksDashboard';
import styles from './App.module.css';

export function App() {
  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1>Dashboard de Tareas</h1>
        <p className={styles.subtitle}>
          Caso de estudio: componentes reutilizables, hook personalizado, estado inmutable y flujo
          de datos unidireccional.
        </p>
      </header>
      <TasksDashboard />
    </main>
  );
}
