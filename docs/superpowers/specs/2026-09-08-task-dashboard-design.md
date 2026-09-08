# Diseño: Dashboard de Tareas (proyecto de ejemplo para la charla)

Fecha: 2026-09-08
Autores de la charla: Juan David Quiroga, Felipe Cárdenas Mora
Materia: Fundamentos de Ingeniería de Software
Estado: aprobado en conversación, pendiente de revisión del documento

## 1. Contexto y objetivo

La charla "React: Arquitectura, Ingeniería y Calidad" necesita un caso de estudio
ejecutable para la demo en vivo (diapositivas 10 y 11). El proyecto debe ser
pequeño y legible en una sola pasada, y cada archivo debe poder señalarse en
pantalla como evidencia de un concepto de la charla:

- Estructura basada en características (feature-based), diapositiva 9.
- Componentes inteligentes frente a componentes de presentación, SRP, diapositiva 7.
- DOM Virtual y flujo de datos unidireccional, diapositivas 4 y 5.
- Estado como máquina de estados finitos, inmutabilidad, useEffect con limpieza,
  diapositiva 8.
- Pruebas con un runner estilo Jest y React Testing Library, ESLint, Prettier,
  tipado, diapositivas 12 y 13.
- Principios SOLID aplicados a React, diapositiva 6.

El objetivo no es un producto, es material didáctico. Prima la claridad sobre
cualquier optimización.

## 2. Decisiones ya tomadas

| Tema | Decisión | Motivo |
|------|----------|--------|
| Lenguaje | TypeScript | Hace tangibles ISP y DIP con contratos de props explícitos; la diapositiva 13 pide "tipado". |
| Bundler | Vite + React 18 | Estándar actual, configuración mínima, arranque rápido para demo. |
| Pruebas | Vitest + React Testing Library | API compatible con Jest (describe/it/expect); todo lo que se diga de Jest aplica. Configuración casi nula con Vite. |
| Estado | useReducer dentro de un hook personalizado, props hacia abajo, sin Context | El flujo unidireccional queda visible y explícito; el reducer puro es la máquina de estados y se testea trivialmente. |
| Persistencia | localStorage detrás de un adaptador (interfaz TaskStorage) | Ilustra DIP: el hook depende de una abstracción, no de localStorage. |
| Efecto con limpieza | Sincronización entre pestañas con el evento window "storage" | Uso real de addEventListener con removeEventListener en la limpieza; refuerza el mensaje de fugas de memoria. |
| Estilos | CSS Modules mínimos | La charla no es de diseño; estilos con alcance por componente sin dependencias extra. |
| Alcance CRUD | Crear, completar, eliminar, filtrar, limpiar completadas | CRUD real suficiente para narrar el flujo sin saturar. Sin edición en línea. |
| Idioma | Identificadores en inglés, interfaz y comentarios y documentación en español | Convención de industria para el código; español para el público. |

## 3. Alcance

### Dentro

- Alta de tarea desde un formulario controlado.
- Marcar y desmarcar una tarea como completada.
- Eliminar una tarea.
- Filtrar por todas, activas, completadas.
- Limpiar todas las completadas.
- Contadores (total, activas, completadas).
- Persistencia en localStorage y sincronización entre pestañas abiertas.
- Pruebas representativas en cada nivel (función pura, hook, componente, integración).
- README con recorrido guiado y guion de demo.
- ARCHITECTURE.md con el razonamiento de ingeniería.
- Una fase final de re-revisión de código con corrección de hallazgos.

### Fuera (YAGNI)

Routing, backend o API real, Context, librería de estado global, framework de CSS,
internacionalización, edición en línea del título, arrastrar y soltar,
autenticación, prioridades o fechas de vencimiento, animaciones, paginación.

En ARCHITECTURE.md se explica cómo evolucionaría cada uno sin reescribir.

## 4. Arquitectura

### 4.1 Estilo

- Basada en componentes con flujo de datos unidireccional (top down).
- Dentro de la característica "tasks", cuatro capas con dependencia en un solo sentido:

```
presentación  ->  lógica de estado  ->  modelo puro
(componentes)     (hook useTasks)       (reducer, filtros, tipo Task)
                        |
                        v
                    servicios
                  (adaptador de almacenamiento)
```

- El modelo puro no importa React. El hook es el único que importa React y toca
  efectos. Los componentes de presentación no conocen el almacenamiento ni el
  reducer.

### 4.2 Estructura de carpetas exacta

```
task-dashboard/
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── README.md
├── ARCHITECTURE.md
├── docs/
│   └── superpowers/
│       ├── specs/2026-09-08-task-dashboard-design.md   (este documento)
│       └── plans/2026-09-08-task-dashboard-plan.md      (plan de implementación)
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── App.module.css
    ├── styles/
    │   └── global.css
    ├── test/
    │   └── setup.ts
    ├── components/                       UI atómica, reutilizable, sin dominio
    │   ├── Button/
    │   │   ├── Button.tsx
    │   │   └── Button.module.css
    │   ├── TextField/
    │   │   ├── TextField.tsx
    │   │   └── TextField.module.css
    │   └── Checkbox/
    │       ├── Checkbox.tsx
    │       └── Checkbox.module.css
    └── features/
        └── tasks/
            ├── TasksDashboard.tsx        componente inteligente (orquesta)
            ├── TasksDashboard.module.css
            ├── TasksDashboard.test.tsx   integración (RTL)
            ├── components/               presentación propia del dominio
            │   ├── TaskForm.tsx
            │   ├── TaskForm.module.css
            │   ├── TaskList.tsx
            │   ├── TaskList.module.css
            │   ├── TaskItem.tsx
            │   ├── TaskItem.module.css
            │   ├── TaskItem.test.tsx
            │   ├── TaskFilterBar.tsx
            │   ├── TaskFilterBar.module.css
            │   ├── TaskStats.tsx
            │   └── TaskStats.module.css
            ├── hooks/
            │   ├── useTasks.ts
            │   └── useTasks.test.ts
            ├── model/
            │   ├── task.ts
            │   ├── tasksReducer.ts
            │   ├── tasksReducer.test.ts
            │   ├── taskFilters.ts
            │   └── taskFilters.test.ts
            └── services/
                └── taskStorage.ts
```

## 5. Contrato de cada archivo (responsabilidad y lógica)

Firmas orientativas en TypeScript. El plan de implementación fija los detalles
finales.

### 5.1 Modelo puro (sin React, sin efectos)

**`src/features/tasks/model/task.ts`**
Responsabilidad: definir la entidad y su fábrica.

```ts
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number; // epoch en milisegundos
}

// Recorta el título con trim. No valida vacío: esa regla vive en el reducer,
// que es el único punto de entrada de creación.
export function createTask(title: string): Task;
```

Lógica: `title` recortado con `trim()`, `id` con `crypto.randomUUID()`,
`completed` en `false`, `createdAt` con `Date.now()`.

**`src/features/tasks/model/tasksReducer.ts`**
Responsabilidad: calcular el siguiente estado. Función pura, sin efectos, siempre
devuelve un arreglo nuevo (inmutabilidad). Es la máquina de estados.

```ts
export type TaskAction =
  | { type: 'added'; title: string }
  | { type: 'toggled'; id: string }
  | { type: 'removed'; id: string }
  | { type: 'clearedCompleted' }
  | { type: 'hydrated'; tasks: Task[] };

export function tasksReducer(state: Task[], action: TaskAction): Task[];
```

Lógica por acción:
- `added`: si el título recortado está vacío, devuelve `state` sin cambios; si no,
  `[...state, createTask(title)]`.
- `toggled`: `state.map` invirtiendo `completed` solo en la coincidencia por `id`.
- `removed`: `state.filter` quitando el `id`.
- `clearedCompleted`: `state.filter(t => !t.completed)`.
- `hydrated`: devuelve `action.tasks` (reemplazo total desde almacenamiento).
- `default`: devuelve `state` (exhaustividad con `never`).

**`src/features/tasks/model/taskFilters.ts`**
Responsabilidad: estrategia de filtrado extensible. Ejemplo de OCP.

```ts
export type FilterName = 'all' | 'active' | 'completed';

export const taskFilters: Record<FilterName, (task: Task) => boolean> = {
  all: () => true,
  active: (t) => !t.completed,
  completed: (t) => t.completed,
};

export const filterOrder: FilterName[]; // orden de render en la barra
export const filterLabels: Record<FilterName, string>; // etiquetas en español

export function filterTasks(tasks: Task[], filter: FilterName): Task[];
```

Lógica: `filterTasks` aplica `taskFilters[filter]` con `Array.filter`. Añadir un
filtro nuevo es añadir una clave, sin tocar `filterTasks` ni el reducer.

### 5.2 Servicios

**`src/features/tasks/services/taskStorage.ts`**
Responsabilidad: aislar la persistencia detrás de una interfaz. Ejemplo de DIP.

```ts
export interface TaskStorage {
  load(): Task[];
  save(tasks: Task[]): void;
}

export const STORAGE_KEY = 'task-dashboard.tasks';

export function createLocalStorageTaskStorage(): TaskStorage;
export function createMemoryTaskStorage(initial?: Task[]): TaskStorage; // para pruebas
```

Lógica de `createLocalStorageTaskStorage`:
- `load`: lee `STORAGE_KEY`; si es `null` devuelve `[]`; si el `JSON.parse` falla
  captura el error y devuelve `[]` (sin fallo silencioso: registra con
  `console.warn`).
- `save`: `localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))`.

`createMemoryTaskStorage` mantiene el arreglo en memoria; permite inyectar estado
inicial en las pruebas y no depende del navegador.

### 5.3 Lógica de estado (único módulo que usa React y efectos)

**`src/features/tasks/hooks/useTasks.ts`**
Responsabilidad: coordinar estado, filtro y efectos. No contiene reglas de
negocio (viven en el reducer y en los filtros).

```ts
export interface TaskStats {
  total: number;
  active: number;
  completed: number;
}

export interface UseTasksResult {
  tasks: Task[];        // ya filtradas
  filter: FilterName;
  stats: TaskStats;     // siempre sobre el total, no sobre lo filtrado
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;
  setFilter: (filter: FilterName) => void;
}

export function useTasks(storage?: TaskStorage): UseTasksResult;
```

Lógica interna:
- `storage` por defecto es `createLocalStorageTaskStorage()` (DIP con valor por
  defecto; las pruebas inyectan memoria).
- `useReducer(tasksReducer, [], () => storage.load())`: init perezoso desde
  almacenamiento.
- `useState<FilterName>('all')` para el filtro.
- Efecto de persistencia: `useEffect(() => storage.save(tasks), [tasks, storage])`.
  Sin limpieza (no hay suscripción).
- Efecto de sincronización entre pestañas: `useEffect` que registra un manejador
  del evento `window` "storage"; si `event.key === STORAGE_KEY`, parsea
  `event.newValue` y hace `dispatch({ type: 'hydrated', tasks })`. La limpieza
  llama `removeEventListener`. Este es el ejemplo de la diapositiva 8.
- `tasks` filtradas con `useMemo(() => filterTasks(tasks, filter), [tasks, filter])`.
- `stats` con `useMemo` sobre el total.
- Envoltorios `addTask`, `toggleTask`, etc. con `useCallback` para identidad
  estable de props (buena práctica al pasar funciones hacia abajo). Un comentario
  corto explica el porqué.

### 5.4 Componentes compartidos (presentación, sin dominio, reutilizables)

Todos: solo presentación, sin estado de negocio, props mínimas, reenvían props
nativas. Ejemplos de SRP e ISP.

**`src/components/Button/Button.tsx`**
```ts
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
};
```
Aplica la clase del `variant` y reenvía el resto (`...rest`). Sin lógica.

**`src/components/TextField/TextField.tsx`**
```ts
type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};
```
Asocia `label` e `input` con `id` generado por `useId`. Controlado desde el padre.

**`src/components/Checkbox/Checkbox.tsx`**
```ts
type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};
```
Checkbox nativo con etiqueta asociada. Controlado desde el padre.

### 5.5 Componentes de la característica (presentación propia del dominio)

Todos reciben datos y callbacks por props. Ninguno llama a `useTasks` ni al
almacenamiento. Único estado permitido: estado de interfaz efímero (el texto en
edición del formulario).

**`TaskForm.tsx`** — `{ onSubmit: (title: string) => void }`
`useState` local para el valor del input. Al enviar: si está vacío no hace nada;
si no, llama `onSubmit(value)` y limpia el input. Usa `TextField` y `Button`.

**`TaskItem.tsx`** — `{ task: Task; onToggle: (id: string) => void; onRemove: (id: string) => void }`
Render puro de una fila: `Checkbox` reflejando `task.completed` que al cambiar
llama `onToggle(task.id)`; título con estilo tachado si está completada; `Button`
variante `danger` que llama `onRemove(task.id)`. Ejemplo de props mínimas (ISP).

**`TaskList.tsx`** — `{ tasks: Task[]; onToggle; onRemove }`
`tasks.map` a `TaskItem` con `key={task.id}`. Si `tasks.length === 0` muestra un
mensaje de estado vacío. Propaga los callbacks sin modificarlos.

**`TaskFilterBar.tsx`** — `{ current: FilterName; onChange: (f: FilterName) => void }`
Un `Button` por cada entrada de `filterOrder` con `filterLabels`. El activo lleva
`aria-pressed`. Ejemplo de recorrer una estructura de datos en vez de repetir JSX.

**`TaskStats.tsx`** — `{ stats: TaskStats; onClearCompleted: () => void }`
Muestra "X activas, Y completadas, Z en total". `Button` "Limpiar completadas"
deshabilitado cuando `stats.completed === 0`.

### 5.6 Componente inteligente

**`src/features/tasks/TasksDashboard.tsx`** — sin props.
Llama `useTasks()` una vez. Compone `TaskForm`, `TaskFilterBar`, `TaskList`,
`TaskStats` y les pasa el estado y los callbacks. No contiene lógica de negocio ni
condiciones complejas. Es el único componente "inteligente" del proyecto.

### 5.7 Raíz

**`src/App.tsx`**: encabezado con el título y una línea de intro, monta
`<TasksDashboard />`. **`src/main.tsx`**: `createRoot` con `React.StrictMode`.

## 6. Flujo de datos (lo que se narra en la demo)

1. `TasksDashboard` llama `useTasks()` y recibe estado y callbacks.
2. Pasa las tareas filtradas y los callbacks a los hijos por props (top down).
3. El usuario marca el checkbox de una fila.
4. `TaskItem` llama `props.onToggle(task.id)`.
5. `TasksDashboard` recibe la llamada y ejecuta `toggleTask(id)` del hook.
6. El hook hace `dispatch({ type: 'toggled', id })`.
7. `tasksReducer` devuelve un arreglo nuevo con esa tarea invertida (inmutable).
8. React reconcilia el DOM Virtual y actualiza solo lo mínimo en el DOM real.
9. El efecto de persistencia guarda en el almacenamiento.
10. Si hay otra pestaña abierta, su evento "storage" dispara `hydrated` y ambas
    quedan sincronizadas. Al desmontar, la limpieza quita el listener.

## 7. Mapeo SOLID

| Principio | Dónde | Cómo señalarlo |
|-----------|-------|----------------|
| SRP | `components/*` y componentes de `features/tasks/components` solo pintan; `useTasks` solo coordina; `tasksReducer` solo calcula; `taskStorage` solo persiste | Contraste componente inteligente (`TasksDashboard`) frente a los de presentación |
| OCP | `taskFilters` como mapa de predicados; añadir un filtro no toca código existente | Mostrar `filterTasks` y el mapa lado a lado |
| LSP | Cualquier componente que respete el contrato de props de `Button` o `TaskItem` es intercambiable; en las pruebas los callbacks reales se sustituyen por espías sin tocar el componente | El test de `TaskItem` pasa `vi.fn()` en lugar de la función real |
| ISP | `TaskItem` recibe `{ task, onToggle, onRemove }`, no el estado completo ni funciones que no usa | Comparar la firma de props de cada componente |
| DIP | `useTasks(storage: TaskStorage)` depende de la interfaz; el valor por defecto es localStorage, las pruebas inyectan memoria | El test del hook inyecta `createMemoryTaskStorage()` |

## 8. Estrategia de pruebas

Pirámide con cinco archivos, rápida y representativa. Vitest con `environment`
jsdom y `@testing-library/jest-dom`.

| Archivo | Nivel | Qué verifica |
|---------|-------|--------------|
| `model/tasksReducer.test.ts` | unidad, sin DOM | Cada acción produce el estado esperado; el estado previo no se muta (comprobación de identidad de referencia) |
| `model/taskFilters.test.ts` | unidad, sin DOM | Cada predicado y `filterTasks` para las tres opciones |
| `hooks/useTasks.test.ts` | hook con `renderHook` | Inyecta `createMemoryTaskStorage`; `addTask` agrega; `toggleTask` invierte; el almacenamiento recibe `save`; `stats` cuadra |
| `features/tasks/components/TaskItem.test.tsx` | componente con RTL | Renderiza el título; el checkbox refleja `completed`; el click dispara `onToggle` con el `id`; el botón dispara `onRemove` |
| `features/tasks/TasksDashboard.test.tsx` | integración con RTL | Escribir y enviar agrega una fila; completar mueve los contadores; el filtro "activas" oculta las completadas |

`taskStorage` queda cubierto de forma indirecta por el test del hook (rutas de
`load` y `save`). Si en la re-revisión se ve necesario, se añade
`taskStorage.test.ts` para la ruta de error de `JSON.parse`.

Scripts de `package.json`: `dev`, `build`, `preview`, `test`, `test:watch`,
`lint`, `format`.

## 9. Documentación entregable

### `README.md`

- Requisitos y cómo correr (`npm install`, `npm run dev`, `npm test`, `npm run lint`).
- Árbol de componentes en ASCII.
- Tabla "Diapositiva, Archivo, Qué mirar".
- "Guion de demo en vivo": 5 pasos (crear una tarea y ver el árbol en DevTools;
  completar y ver la actualización inmutable; filtrar; abrir una segunda pestaña y
  ver la sincronización; abrir un test y correrlo).

### `ARCHITECTURE.md`

1. Contexto, objetivo, límites del sistema y qué queda fuera.
2. Estilo arquitectónico: componentes, flujo unidireccional, capas de la
   característica.
3. Vistas con diagramas Mermaid: jerarquía de componentes y recorrido de un
   evento de principio a fin.
4. Atributos de calidad (mantenibilidad, testeabilidad, escalabilidad,
   legibilidad) y la decisión concreta que sostiene cada uno.
5. Cohesión y acoplamiento: cómo se controlan aquí (props mínimas, funciones
   puras, dependencia por interfaz).
6. Decisiones de arquitectura en formato ADR ligero (contexto, decisión,
   alternativas, consecuencias): feature-based frente a organización por tipo;
   useReducer frente a Redux; sin Context; adaptador de localStorage; CSS Modules.
7. Evolución: cómo se añadiría estado global, API real y routing sin reescribir.

Un enlace cruzado entre README y ARCHITECTURE. El mapeo SOLID de la sección 7 se
incluye en ARCHITECTURE.

### Comentarios de anclaje en el código

Cortos, solo en los puntos que se señalan en pantalla, con prefijo del principio:
`// SRP:`, `// DIP:`, `// OCP:`, `// Inmutabilidad:`, `// Efecto + limpieza:`.
Sin comentar lo obvio.

## 10. Fase final de re-revisión

Después de implementar y de que las pruebas pasen:

1. Auto-revisión con el flujo `superpowers:requesting-code-review` sobre todos los
   archivos creados.
2. Registro de hallazgos por severidad.
3. Corrección de los que apliquen, con nota de los descartados y el motivo.
4. Nueva corrida de `lint` y `test`.

Esto deja las buenas prácticas verificadas y de paso ilustra "refactorización
continua" de la diapositiva 13.

## 11. Criterios de éxito y verificación

- `npm install` y `npm run dev` levantan la app sin errores.
- `npm test` pasa los cinco archivos.
- `npm run lint` sin errores ni advertencias.
- `npm run build` compila sin errores de TypeScript.
- La app crea, completa, elimina y filtra tareas, y persiste al recargar.
- Dos pestañas abiertas se mantienen sincronizadas.
- `README.md` y `ARCHITECTURE.md` presentes y con el contenido de la sección 9.
- Ningún componente de presentación importa `useTasks` ni `taskStorage`.
- El modelo puro (`model/`) no importa React.

## 12. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| El proyecto crece y deja de ser "corto" | Lista "Fuera de alcance" cerrada; archivos de 10 a 60 líneas; revisión de tamaño en la re-revisión |
| `useCallback` y `useMemo` se ven como ruido para el público | Comentario de una línea que explica el porqué; se mencionan como buena práctica, no como obligación |
| El evento "storage" no dispara en la misma pestaña que escribe (comportamiento normal del navegador) | Se documenta en el guion: la sincronización se demuestra con dos pestañas |
| Vitest en lugar de Jest genera dudas en el público | README aclara que la API es la misma; la charla puede seguir diciendo "Jest" |
