'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useUpdateTodoList,
  useDeleteTodoList,
  useSubtractBalance,
} from '@/lib/mutations';
import { TodoList as TodoListType, Todo } from '@/db/schema/todos';
import { PomodoroTimerDialog } from '@/components/pomodoro-timer-dialog';
import { toast } from 'sonner';
import {
  MoreVertical,
  Timer,
  Pencil,
  Trash2,
  X,
  Check,
  Plus,
  Loader2,
  Clock,
  CalendarClock,
  BarChart,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

const todoSchema = z.object({
  content: z.string().min(1, 'Todo name is required').max(100, 'Todo name is too long'),
});

type FormValues = z.infer<typeof todoSchema>;

interface TodoListProps {
  list: TodoListType;
  todos: Todo[];
}

export function TodoList({ list, todos }: TodoListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(list.name);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      content: '',
    },
  });

  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const updateList = useUpdateTodoList();
  const deleteList = useDeleteTodoList();
  const subtractBalance = useSubtractBalance();

  // Filter todos for this list
  const filteredTodos = todos.filter((todo) => todo.listId === list.id);

  // Sort incomplete todos by creation date (newest first)
  const incompleteTodos = filteredTodos
    .filter((todo) => !todo.completed)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Sort completed todos by completion date (most recently completed first)
  const completedTodos = filteredTodos
    .filter((todo) => todo.completed)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Calculate completion percentage
  const completionPercentage =
    filteredTodos.length > 0 ? Math.round((completedTodos.length / filteredTodos.length) * 100) : 0;

  const handleNameSubmit = async () => {
    if (editedName.trim() === '') return;
    try {
      await updateList.mutateAsync({ id: list.id, name: editedName.trim() });
      setIsEditing(false);
    } catch {
      toast.error('Failed to update list name');
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createTodo.mutateAsync({ content: values.content, listId: list.id });
      await subtractBalance.mutateAsync({
        userId: list.userId,
        amount: 5,
      });
      form.reset({ content: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create todo');
    }
  };

  const handleTodoComplete = async (todo: Todo) => {
    try {
      await updateTodo.mutateAsync({
        id: todo.id,
        data: { completed: !todo.completed },
      });
    } catch {
      toast.error('Failed to update todo');
    }
  };

  const handlePomodoroComplete = async () => {
    if (!selectedTodo) return;
    try {
      await subtractBalance.mutateAsync({
        userId: list.userId, // We're using the list's userId since it's the same as the session user
        amount: 20,
      });

      // Then mark the todo as completed
      await updateTodo.mutateAsync({
        id: selectedTodo.id,
        data: { completed: true },
      });
      setIsPomodoroOpen(false);
      setSelectedTodo(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete Pomodoro session');
    }
  };

  const handleDeleteList = () => {
    deleteList.mutate(list.id);
    setShowDeleteAlert(false);
  };

  return (
    <Card className='w-full overflow-hidden transition-all hover:shadow-md'>
      <CardHeader
        className={cn(
          'flex flex-row items-center space-y-0 pb-2',
          completionPercentage === 100 ? 'bg-emerald-50 dark:bg-emerald-950/20' : '',
        )}
      >
        {isEditing ? (
          <div className='flex w-full items-center gap-2'>
            <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} className='h-7' autoFocus />
            <Button size='icon' variant='ghost' onClick={handleNameSubmit}>
              <Check className='h-4 w-4' />
            </Button>
            <Button size='icon' variant='ghost' onClick={() => setIsEditing(false)}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        ) : (
          <>
            <div className='mr-2 flex-1'>
              <CardTitle className='flex items-center gap-2 text-xl'>
                {list.name}
                {completionPercentage === 100 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Check className='h-4 w-4 text-emerald-500' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>All tasks completed!</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardTitle>

              <div className='text-muted-foreground mt-1 flex items-center text-xs'>
                <CalendarClock className='mr-1 inline-block h-3 w-3' />
                Created {formatDistanceToNow(list.createdAt, { addSuffix: true })}
              </div>
            </div>
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <MoreVertical className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className='mr-2 h-4 w-4' />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowCompleted(!showCompleted)}>
              <Check className='mr-2 h-4 w-4' />
              {showCompleted ? 'Hide completed' : 'Show completed'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-destructive' onClick={() => setShowDeleteAlert(true)}>
              <Trash2 className='mr-2 h-4 w-4' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Progress bar */}
      <Progress value={completionPercentage} className='h-1 rounded-none' />

      <CardContent className='space-y-4 pt-4'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex gap-2'>
            <div className='flex-1'>
              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder='Add a new task...'
                        {...field}
                        autoComplete='off'
                        disabled={createTodo.isPending}
                        className='border-dashed'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type='submit' size='icon' disabled={createTodo.isPending} variant='secondary'>
              {createTodo.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4' />}
            </Button>
          </form>
        </Form>

        <div className='max-h-[330px] space-y-2 overflow-y-auto pr-1'>
          {incompleteTodos.map((todo) => (
            <div
              key={todo.id}
              className={`hover:bg-muted/50 animate-fade-in flex items-center gap-3 rounded-md p-2 ${updateTodo.isPending ? 'opacity-50' : ''}`}
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => handleTodoComplete(todo)}
                disabled={updateTodo.isPending}
              />
              <span className='flex-1'>{todo.content}</span>
              <div className='flex items-center gap-1'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className='text-muted-foreground flex items-center text-xs'>
                        <Clock className='mr-1 h-3 w-3' />
                        {formatDistanceToNow(todo.createdAt, { addSuffix: true })}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Created: {new Date(todo.createdAt).toLocaleString()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => {
                    setSelectedTodo(todo);
                    setIsPomodoroOpen(true);
                  }}
                  disabled={updateTodo.isPending}
                  className='h-8 w-8'
                >
                  <Timer className='h-4 w-4' />
                </Button>

                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => deleteTodo.mutate(todo.id)}
                  disabled={deleteTodo.isPending || updateTodo.isPending}
                  className='h-8 w-8'
                >
                  {deleteTodo.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Trash2 className='h-4 w-4' />}
                </Button>
              </div>
            </div>
          ))}

          {showCompleted && completedTodos.length > 0 && (
            <div className='mt-4 border-t pt-4'>
              <div className='mb-2 flex items-center'>
                <h4 className='text-muted-foreground flex items-center text-sm font-medium'>
                  <Check className='mr-1 h-3 w-3' />
                  Completed ({completedTodos.length})
                </h4>
              </div>
              <div className='space-y-2'>
                {completedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className='text-muted-foreground hover:bg-muted/50 animate-fade-in-slow flex items-center gap-3 rounded-md p-2'
                  >
                    <Checkbox checked={todo.completed} onCheckedChange={() => handleTodoComplete(todo)} />
                    <span className='flex-1 line-through'>{todo.content}</span>
                    <div className='flex items-center gap-1'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className='text-muted-foreground flex items-center text-xs'>
                              <Clock className='mr-1 h-3 w-3' />
                              {formatDistanceToNow(todo.updatedAt, { addSuffix: true })}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Completed: {new Date(todo.updatedAt).toLocaleString()}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => deleteTodo.mutate(todo.id)}
                        className='h-8 w-8'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredTodos.length === 0 && (
            <div className='flex flex-col items-center justify-center py-8 text-center'>
              <div className='bg-muted mb-2 rounded-full p-2'>
                <Pencil className='text-muted-foreground h-4 w-4' />
              </div>
              <p className='text-muted-foreground text-sm'>No tasks yet</p>
              <p className='text-muted-foreground text-xs'>Add your first task above</p>
            </div>
          )}
        </div>
      </CardContent>

      {filteredTodos.length > 0 && (
        <CardFooter className='bg-muted/20 flex items-center justify-between border-t px-6 py-2'>
          <div className='flex items-center text-xs'>
            <BarChart className='text-muted-foreground mr-1 h-3 w-3' />
            <span>
              {completedTodos.length}/{filteredTodos.length} completed
            </span>
          </div>
          <div className='text-xs'>{completionPercentage}% complete</div>
        </CardFooter>
      )}

      {selectedTodo && (
        <PomodoroTimerDialog
          isOpen={isPomodoroOpen}
          onClose={() => {
            setIsPomodoroOpen(false);
            setSelectedTodo(null);
          }}
          onComplete={handlePomodoroComplete}
          todoTitle={selectedTodo.content}
        />
      )}

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{list.name}&quot;? This will also delete all todos in this list.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteList}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteList.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Trash2 className='mr-2 h-4 w-4' />
              )}
              Delete List
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
