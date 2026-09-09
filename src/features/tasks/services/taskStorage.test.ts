import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLocalStorageTaskStorage, createMemoryTaskStorage, STORAGE_KEY } from './taskStorage';
import { createTask } from '../model/task';

describe('createMemoryTaskStorage', () => {
  it('guarda y devuelve una copia independiente', () => {
    const storage = createMemoryTaskStorage();
    const tasks = [createTask('A')];
    storage.save(tasks);
    const loaded = storage.load();
    expect(loaded).toEqual(tasks);
    expect(loaded).not.toBe(tasks);
  });

  it('acepta un estado inicial', () => {
    const seed = [createTask('Semilla')];
    expect(createMemoryTaskStorage(seed).load()).toEqual(seed);
  });
});

describe('createLocalStorageTaskStorage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('devuelve lista vacía cuando no hay nada guardado', () => {
    expect(createLocalStorageTaskStorage().load()).toEqual([]);
  });

  it('hace ida y vuelta por localStorage', () => {
    const storage = createLocalStorageTaskStorage();
    const tasks = [createTask('Persistente')];
    storage.save(tasks);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(tasks));
    expect(storage.load()).toEqual(tasks);
  });

  it('ante un valor corrupto avisa y devuelve lista vacía', () => {
    localStorage.setItem(STORAGE_KEY, '{no es json');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(createLocalStorageTaskStorage().load()).toEqual([]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
