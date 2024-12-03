'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type Todo } from '@/db/schema/todos';
import { Trash2, Loader2, Pencil, Plus, Save, X, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { PomodoroTimerDialog } from '@/components/pomodoro-timer-dialog';

interface TodoListProps {
  listId: number;
}

export function TodoList({ listId }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingTodo, setEditingTodo] = useState<{ id: number; content: string } | null>(null);
  const [selectedTodoForTimer, setSelectedTodoForTimer] = useState<Todo | null>(null);

  // Fetch todos on component mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const response = await fetch('/api/todos');
        if (!response.ok) throw new Error('Failed to fetch todos');
        const data = await response.json();
        setTodos(data.filter((todo: Todo) => todo.listId === listId));
      } catch (error) {
        toast.error('Failed to load todos');
        console.error('Error loading todos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTodos();
  }, [listId]);

  // Add new todo
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newTodo, listId }),
      });

      if (!response.ok) throw new Error('Failed to create todo');

      const newTodoData = await response.json();
      setTodos((prev) => [...prev, newTodoData]);
      setNewTodo('');
      toast.success('Todo created successfully');
    } catch (error) {
      toast.error('Failed to create todo');
      console.error('Error creating todo:', error);
    }
  };

  // Toggle todo completion
  const toggleTodo = useCallback(async (id: number, completed: boolean, showToast = true) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) throw new Error('Failed to update todo');

      const updatedTodo = await response.json();
      setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, ...updatedTodo } : todo)));

      if (showToast) {
        toast.success(`Todo marked as ${completed ? 'completed' : 'incomplete'}`);
      }
    } catch (error) {
      if (showToast) {
        toast.error('Failed to update todo');
      }
      console.error('Error toggling todo:', error);
    }
  }, []);

  // Delete todo
  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete todo');

      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      toast.success('Todo deleted successfully');
    } catch (error) {
      toast.error('Failed to delete todo');
      console.error('Error deleting todo:', error);
    }
  };

  // Update todo content
  const updateTodoContent = async () => {
    if (!editingTodo || !editingTodo.content.trim()) return;

    try {
      const response = await fetch(`/api/todos/${editingTodo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingTodo.content }),
      });

      if (!response.ok) throw new Error('Failed to update todo');

      const updatedTodo = await response.json();
      setTodos((prev) => prev.map((todo) => (todo.id === editingTodo.id ? { ...todo, ...updatedTodo } : todo)));
      setEditingTodo(null);
      toast.success('Todo updated successfully');
    } catch (error) {
      toast.error('Failed to update todo');
      console.error('Error updating todo:', error);
    }
  };

  // Timer completion handler
  const handleTimerComplete = useCallback(() => {
    if (selectedTodoForTimer) {
      const todoId = selectedTodoForTimer.id;
      toggleTodo(todoId, true, false)
        .then(() => {
          setSelectedTodoForTimer(null);
        })
        .catch(() => {
          toast.error('Failed to complete todo after timer');
        });
    }
  }, [selectedTodoForTimer, toggleTodo]);

  // Loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* New Todo Input */}
      <form onSubmit={addTodo} className='flex gap-2'>
        <Input
          placeholder='What needs to be done?'
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className='flex-1'
        />
        <Button type='submit' size='icon' variant='secondary'>
          <Plus className='h-4 w-4' />
        </Button>
      </form>

      <Separator />

      {/* Todo List */}
      <ScrollArea className='h-96'>
        <div className='space-y-2'>
          <AnimatePresence mode='popLayout'>
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Card className='border transition-colors hover:border-primary/20'>
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-3'>
                      {editingTodo?.id === todo.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            updateTodoContent();
                          }}
                          className='flex flex-1 gap-2'
                        >
                          <Input
                            value={editingTodo.content}
                            onChange={(e) =>
                              setEditingTodo({
                                id: todo.id,
                                content: e.target.value,
                              })
                            }
                            className='flex-1'
                            autoFocus
                          />
                          <Button type='submit' size='icon' variant='ghost' aria-label='Save todo'>
                            <Save className='h-4 w-4' />
                          </Button>
                          <Button
                            type='button'
                            size='icon'
                            variant='ghost'
                            onClick={() => setEditingTodo(null)}
                            aria-label='Cancel editing'
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </form>
                      ) : (
                        <>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id={`todo-${todo.id}`}
                              checked={todo.completed}
                              onCheckedChange={(checked) => toggleTodo(todo.id, checked as boolean)}
                              aria-label={`Mark "${todo.content}" as ${todo.completed ? 'incomplete' : 'complete'}`}
                            />
                            <label
                              htmlFor={`todo-${todo.id}`}
                              className={cn(
                                'flex-1 cursor-pointer select-none text-sm transition-colors',
                                todo.completed && 'text-muted-foreground line-through',
                              )}
                            >
                              {todo.content}
                            </label>
                          </div>
                          <div className='ml-auto flex gap-1'>
                            {!todo.completed && (
                              <Button
                                size='icon'
                                variant='ghost'
                                className='h-8 w-8'
                                onClick={() => setSelectedTodoForTimer(todo)}
                                aria-label='Start Pomodoro Timer'
                              >
                                <Timer className='h-4 w-4' />
                              </Button>
                            )}
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-8 w-8'
                              onClick={() =>
                                setEditingTodo({
                                  id: todo.id,
                                  content: todo.content,
                                })
                              }
                              aria-label='Edit todo'
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-8 w-8 hover:text-destructive'
                              onClick={() => deleteTodo(todo.id)}
                              aria-label='Delete todo'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {todos.length === 0 && (
            <motion.div
              className='flex flex-col items-center justify-center gap-2 p-8'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Badge variant='secondary' className='text-sm'>
                No Todos
              </Badge>
              <p className='text-center text-sm text-muted-foreground'>Add a todo to get started!</p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <PomodoroTimerDialog
        isOpen={!!selectedTodoForTimer}
        onClose={() => setSelectedTodoForTimer(null)}
        onComplete={handleTimerComplete}
        todoTitle={selectedTodoForTimer?.content || ''}
      />
    </div>
  );
}
