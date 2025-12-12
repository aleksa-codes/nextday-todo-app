import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Todo, TodoList } from '@/db/schema/todos';
import { type CustomerState } from '@polar-sh/sdk/models/components/customerstate';

const fetchBalance = async () => {
  const response = await fetch('/api/balance');
  if (!response.ok) {
    throw new Error('Failed to fetch balance');
  }
  const data = await response.json();
  return data[0]?.balance ?? 0;
};

export function useBalance() {
  return useQuery({
    queryKey: ['balance'],
    queryFn: fetchBalance,
    // Balance should be refreshed on page reload for accuracy
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep unused data in cache for 10 minutes
  });
}

const handleSubtractBalance = async ({ userId, amount }: { userId: string; amount: number }) => {
  const response = await fetch('/api/balance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, amount }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to subtract balance');
  }

  return result.balance;
};

export function useSubtractBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: handleSubtractBalance,
    onSuccess: (newBalance, context) => {
      queryClient.setQueryData(['balance'], newBalance);
      toast.success(`${context?.amount} credits used!`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to use balance');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}

// Todo queries
export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await fetch('/api/todos');
      if (!response.ok) throw new Error('Failed to fetch todos');
      return response.json() as Promise<Todo[]>;
    },
  });
}

// Todo mutations
export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, listId }: { content: string; listId: number }) => {
      const response = await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ content, listId }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to create todo');
      return response.json() as Promise<Todo>;
    },
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      queryClient.setQueryData<Todo[]>(['todos'], (old = []) => [
        ...old,
        {
          id: Math.random(), // temporary ID
          content: newTodo.content,
          listId: newTodo.listId,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Todo,
      ]);

      return { previousTodos };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Todo> }) => {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to update todo');
      return response.json() as Promise<Todo>;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      queryClient.setQueryData<Todo[]>(['todos'], (old = []) =>
        old.map((todo) => (todo.id === id ? { ...todo, ...data } : todo)),
      );

      return { previousTodos };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete todo');
      return response.json();
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      queryClient.setQueryData<Todo[]>(['todos'], (old = []) => old.filter((todo) => todo.id !== deletedId));

      return { previousTodos };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

// TodoList queries
export function useTodoLists() {
  return useQuery({
    queryKey: ['todoLists'],
    queryFn: async () => {
      const response = await fetch('/api/todo-lists');
      if (!response.ok) throw new Error('Failed to fetch todo lists');
      return response.json() as Promise<TodoList[]>;
    },
  });
}

// TodoList mutations
export function useCreateTodoList(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/todo-lists', {
        method: 'POST',
        body: JSON.stringify({ name }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to create todo list');
      return response.json() as Promise<TodoList>;
    },
    onMutate: async (newListName) => {
      await queryClient.cancelQueries({ queryKey: ['todoLists'] });
      const previousLists = queryClient.getQueryData<TodoList[]>(['todoLists']);

      queryClient.setQueryData<TodoList[]>(['todoLists'], (old = []) => [
        ...old,
        {
          id: Math.random(), // temporary ID
          name: newListName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as TodoList,
      ]);

      return { previousLists };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(['todoLists'], context.previousLists);
      }
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todoLists'] });
    },
  });
}

export function useUpdateTodoList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const response = await fetch(`/api/todo-lists/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to update todo list');
      return response.json() as Promise<TodoList>;
    },
    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: ['todoLists'] });
      const previousLists = queryClient.getQueryData<TodoList[]>(['todoLists']);

      queryClient.setQueryData<TodoList[]>(['todoLists'], (old = []) =>
        old.map((list) => (list.id === id ? { ...list, name } : list)),
      );

      return { previousLists };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(['todoLists'], context.previousLists);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todoLists'] });
    },
  });
}

export function useDeleteTodoList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/todo-lists/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete todo list');
      return response.json();
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['todoLists'] });
      const previousLists = queryClient.getQueryData<TodoList[]>(['todoLists']);

      queryClient.setQueryData<TodoList[]>(['todoLists'], (old = []) => old.filter((list) => list.id !== deletedId));

      // Also remove todos associated with this list
      queryClient.setQueryData<Todo[]>(['todos'], (old = []) => old.filter((todo) => todo.listId !== deletedId));

      return { previousLists };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(['todoLists'], context.previousLists);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todoLists'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
