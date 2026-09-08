import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TasksDashboard } from './TasksDashboard';
import { STORAGE_KEY } from './services/taskStorage';

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

async function addTask(title: string) {
  await userEvent.type(screen.getByLabelText('Nueva tarea'), title);
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
}

describe('TasksDashboard', () => {
  it('agrega una tarea desde el formulario', async () => {
    render(<TasksDashboard />);
    await addTask('Escribir el guion');
    expect(screen.getByText('Escribir el guion')).toBeInTheDocument();
  });

  it('actualiza los contadores al completar', async () => {
    render(<TasksDashboard />);
    await addTask('Tarea uno');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Tarea uno' }));
    expect(screen.getByText('0 activas, 1 completadas, 1 en total')).toBeInTheDocument();
  });

  it('el filtro "Activas" oculta las completadas', async () => {
    render(<TasksDashboard />);
    await addTask('Visible');
    await addTask('Oculta');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Oculta' }));
    await userEvent.click(screen.getByRole('button', { name: 'Activas' }));
    expect(screen.getByText('Visible')).toBeInTheDocument();
    expect(screen.queryByText('Oculta')).not.toBeInTheDocument();
  });

  it('persiste las tareas en localStorage', async () => {
    render(<TasksDashboard />);
    await addTask('Persistente');
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe('Persistente');
  });
});
