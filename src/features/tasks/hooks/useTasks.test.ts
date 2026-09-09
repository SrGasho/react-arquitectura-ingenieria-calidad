import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTasks } from './useTasks';
import { createMemoryTaskStorage, STORAGE_KEY } from '../services/taskStorage';
import { createTask } from '../model/task';

describe('useTasks', () => {
  it('carga el estado inicial desde el almacenamiento inyectado', () => {
    const storage = createMemoryTaskStorage([createTask('Preparar demo')]);
    const { result } = renderHook(() => useTasks(storage));
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('Preparar demo');
  });

  it('addTask agrega una tarea y la persiste', () => {
    const storage = createMemoryTaskStorage();
    const saveSpy = vi.spyOn(storage, 'save');
    const { result } = renderHook(() => useTasks(storage));
    // El montaje ya llamó a save una vez; se limpia para afirmar solo el efecto del addTask.
    saveSpy.mockClear();
    act(() => result.current.addTask('Escribir pruebas'));
    expect(result.current.tasks).toHaveLength(1);
    expect(saveSpy).toHaveBeenCalledWith([expect.objectContaining({ title: 'Escribir pruebas' })]);
  });

  it('toggleTask invierte el estado completado', () => {
    const { result } = renderHook(() => useTasks(createMemoryTaskStorage()));
    act(() => result.current.addTask('Tarea'));
    const id = result.current.tasks[0].id;
    act(() => result.current.toggleTask(id));
    expect(result.current.tasks[0].completed).toBe(true);
  });

  it('removeTask elimina la tarea', () => {
    const { result } = renderHook(() => useTasks(createMemoryTaskStorage()));
    act(() => result.current.addTask('Tarea'));
    act(() => result.current.removeTask(result.current.tasks[0].id));
    expect(result.current.tasks).toHaveLength(0);
  });

  it('clearCompleted elimina solo las completadas', () => {
    const { result } = renderHook(() => useTasks(createMemoryTaskStorage()));
    act(() => {
      result.current.addTask('A');
      result.current.addTask('B');
    });
    act(() => result.current.toggleTask(result.current.tasks[0].id));
    act(() => result.current.clearCompleted());
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('B');
  });

  it('setFilter cambia las tareas visibles y stats se mantiene sobre el total', () => {
    const { result } = renderHook(() => useTasks(createMemoryTaskStorage()));
    act(() => {
      result.current.addTask('A');
      result.current.addTask('B');
    });
    act(() => result.current.toggleTask(result.current.tasks[0].id));
    act(() => result.current.setFilter('active'));
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.stats).toEqual({ total: 2, active: 1, completed: 1 });
  });

  it('se sincroniza con el evento storage de otra pestaña', () => {
    const { result } = renderHook(() => useTasks(createMemoryTaskStorage()));
    const incoming = [createTask('Desde otra pestaña')];
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(incoming) }),
      );
    });
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('Desde otra pestaña');
  });

  it('quita el listener de storage al desmontar', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useTasks(createMemoryTaskStorage()));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    removeSpy.mockRestore();
  });
});
