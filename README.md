# Dashboard de Tareas

Caso de estudio de la charla "React: Arquitectura, Ingeniería y Calidad"
(Fundamentos de Ingeniería de Software). Es un CRUD mínimo de tareas pensado
para leerse de una sentada y para señalar cada patrón en pantalla.

## Requisitos

- Node 22 y npm 10.

## Cómo correr

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm test         # batería de pruebas (Vitest + React Testing Library)
npm run lint     # ESLint
npm run build    # comprobación de tipos y build de producción
```

## Qué demuestra

- Estructura basada en características (feature-based).
- Componentes de presentación reutilizables y un único componente inteligente.
- Hook personalizado (`useTasks`) que separa la lógica de la interfaz.
- Estado como máquina de estados finitos con un reducer puro e inmutable.
- Flujo de datos unidireccional: datos por props, eventos por callbacks.
- `useEffect` con limpieza para sincronizar pestañas sin fugas de memoria.
- Principios SOLID aplicados a React (ver `ARCHITECTURE.md`).
- Pruebas en cada nivel: función pura, hook, componente e integración.

## Árbol de componentes

```
App
└── TasksDashboard        (inteligente: usa useTasks y orquesta)
    ├── TaskForm          (input controlado, estado de interfaz efímero)
    ├── TaskFilterBar     (botones de filtro a partir de una lista de datos)
    ├── TaskList          (recorre y delega)
    │   └── TaskItem      (una fila: Checkbox + Button)
    └── TaskStats         (contadores + limpiar completadas)
```

## Mapa charla a código

| Diapositiva                       | Archivo                                                                    | Qué mirar                                                               |
| --------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 7, SRP y Smart/Dumb               | `features/tasks/TasksDashboard.tsx` frente a `features/tasks/components/*` | El inteligente no pinta detalle; los de presentación no tienen lógica   |
| 8, estado como máquina de estados | `features/tasks/model/tasksReducer.ts`                                     | `switch` de acciones, siempre arreglo nuevo, `assertNever`              |
| 8, efecto con limpieza            | `features/tasks/hooks/useTasks.ts`                                         | El `useEffect` del evento "storage" y su `return` que quita el listener |
| 5, flujo unidireccional           | `features/tasks/TasksDashboard.tsx`                                        | Datos hacia abajo por props, eventos hacia arriba por callbacks         |
| 9, feature-based                  | carpeta `features/tasks/`                                                  | Todo lo de tareas junto: modelo, hook, servicios, componentes, pruebas  |
| 3, reutilización                  | `components/Button`, `components/TextField`, `components/Checkbox`         | Sin dominio, se usan en varios sitios                                   |
| 6, OCP                            | `features/tasks/model/taskFilters.ts`                                      | Mapa de predicados; agregar un filtro no toca `filterTasks`             |
| 6, DIP                            | `features/tasks/services/taskStorage.ts` y `useTasks`                      | El hook depende de `TaskStorage`, no de `localStorage`                  |
| 12, pruebas                       | `*.test.ts` y `*.test.tsx`                                                 | Unidad para el modelo, `renderHook` para el hook, RTL para componentes  |

## Guion de demo en vivo

1. Crear una tarea y abrir React DevTools para ver el árbol de componentes.
2. Completar una tarea y notar que el reducer devuelve un arreglo nuevo
   (actualización inmutable) y solo se vuelve a pintar lo mínimo.
3. Filtrar por "Activas" y "Completadas": la misma lista, distinta vista.
4. Abrir una segunda pestaña y agregar una tarea: ambas se sincronizan por
   el evento "storage". Cerrar una pestaña y ver que la limpieza del efecto
   quita el listener. Para la demo, sincronizar agregando o completando
   tareas: limpiar el almacenamiento desde DevTools deja `newValue` en
   `null` y el manejador lo ignora por diseño.
5. Abrir `features/tasks/model/tasksReducer.test.ts` y correr
   `npm test -- tasksReducer` para mostrar la prueba de una función pura.

## Estructura

Ver `ARCHITECTURE.md` para el detalle de capas, atributos de calidad,
decisiones de arquitectura y evolución.
