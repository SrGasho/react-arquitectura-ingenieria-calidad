import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('App', () => {
  it('muestra el encabezado y el formulario de tareas', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Dashboard de Tareas' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nueva tarea')).toBeInTheDocument();
  });
});
