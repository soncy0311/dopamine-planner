// Supabase client
export * from './supabase/createClient';
export * from './supabase/types';

// Query keys (single source of truth for TanStack Query keys)
export * from './queryKeys';

// Domain types + mappers
export * from './domain/category';
export * from './domain/epic';
export * from './domain/todo';

// Services (Supabase access layer + RPC wrappers)
export * as categoryService from './services/category';
export * as epicService from './services/epic';
export * as todoService from './services/todo';
export { carryOverTodos } from './services/carryOver';
export { recalcEpicProgress } from './services/epicProgress';

// Hooks — Categories
export * from './hooks/useCategories';
export * from './hooks/useCreateCategory';
export * from './hooks/useUpdateCategory';
export * from './hooks/useDeleteCategory';

// Hooks — Epics
export * from './hooks/useEpics';
export * from './hooks/useCreateEpic';
export * from './hooks/useUpdateEpic';
export * from './hooks/useDeleteEpic';

// Hooks — Todos
export * from './hooks/useTodos';
export * from './hooks/useCreateTodo';
export * from './hooks/useUpdateTodo';
export * from './hooks/useDeleteTodo';
export * from './hooks/useToggleTodo';

// Realtime
export * from './realtime/subscribeTodos';
