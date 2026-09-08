import { useTasks } from './hooks/useTasks';
import { TaskFilterBar } from './components/TaskFilterBar';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { TaskStats } from './components/TaskStats';
import styles from './TasksDashboard.module.css';

// Único componente "inteligente": usa el hook y orquesta. Sin reglas de negocio aquí.
export function TasksDashboard() {
  const { tasks, filter, stats, addTask, toggleTask, removeTask, clearCompleted, setFilter } =
    useTasks();

  return (
    <section className={styles.dashboard}>
      <TaskForm onSubmit={addTask} />
      <TaskFilterBar current={filter} onChange={setFilter} />
      <TaskList tasks={tasks} onToggle={toggleTask} onRemove={removeTask} />
      <TaskStats stats={stats} onClearCompleted={clearCompleted} />
    </section>
  );
}
