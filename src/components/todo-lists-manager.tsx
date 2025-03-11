'use client';

import { useTodoLists, useTodos, useCreateTodoList, useSubtractBalance } from '@/lib/mutations';
import { TodoList } from '@/components/todo-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Loader2, Layout, Calendar, ListTodo } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { type Session } from '@/lib/auth-client';

const formSchema = z.object({
  name: z.string().min(1, 'List name is required').max(50, 'List name is too long'),
});

type FormValues = z.infer<typeof formSchema>;

export function TodoListsManager({ session }: { session: Session }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const { data: lists } = useTodoLists();
  const { data: todos } = useTodos();
  const createList = useCreateTodoList();
  const subtractBalance = useSubtractBalance();

  const onSubmit = async (values: FormValues) => {
    try {
      await createList.mutateAsync(values.name);
      await subtractBalance.mutateAsync({ userId: session.user.id, amount: 10 });
      form.reset({ name: '' });
      toast.success('List created successfully');
    } catch {
      toast.error('Failed to create list');
    }
  };

  // Sort lists by creation date (newest first)
  const sortedLists = lists
    ? [...lists].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  // Count total todos and completed todos
  const totalTodos = todos?.length || 0;
  const completedTodos = todos?.filter((todo) => todo.completed).length || 0;
  const completionPercentage = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  return (
    <div className='space-y-8'>
      {/* Summary section */}
      <div className='bg-card/60 dark:bg-card/40 rounded-xl border p-4 shadow-sm'>
        <div className='flex flex-col justify-between gap-4 sm:flex-row'>
          <div>
            <h3 className='flex items-center gap-2 text-xl font-medium'>
              <ListTodo className='text-primary h-5 w-5' />
              Overview
            </h3>
            <p className='text-muted-foreground mt-1'>
              {sortedLists.length} list{sortedLists.length !== 1 ? 's' : ''} with {totalTodos} task
              {totalTodos !== 1 ? 's' : ''}
            </p>
          </div>

          <div className='flex gap-4'>
            <div className='bg-background rounded-lg border p-3 text-center shadow-sm'>
              <div className='text-2xl font-semibold'>{totalTodos}</div>
              <div className='text-muted-foreground text-xs'>Total Tasks</div>
            </div>
            <div className='bg-background rounded-lg border p-3 text-center shadow-sm'>
              <div className='text-primary text-2xl font-semibold'>{completedTodos}</div>
              <div className='text-muted-foreground text-xs'>Completed</div>
            </div>
            <div className='bg-background rounded-lg border p-3 text-center shadow-sm'>
              <div className='text-2xl font-semibold text-amber-500'>{completionPercentage}%</div>
              <div className='text-muted-foreground text-xs'>Completion</div>
            </div>
          </div>
        </div>
      </div>

      {/* New list form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='bg-background flex gap-3 rounded-lg border p-2 shadow-sm'
        >
          <div className='flex-1'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Enter list name...'
                      className='border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-transparent'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type='submit' disabled={createList.isPending}>
            {createList.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Plus className='mr-2 h-4 w-4' />
            )}
            New List
          </Button>
        </form>
      </Form>

      {/* Lists section */}
      <Tabs defaultValue='grid' className='w-full'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Your Lists</h2>
          <TabsList>
            <TabsTrigger value='grid'>
              <Layout className='mr-2 h-4 w-4' />
              Grid
            </TabsTrigger>
            <TabsTrigger value='calendar'>
              <Calendar className='mr-2 h-4 w-4' />
              Calendar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='grid' className='mt-0'>
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {sortedLists.map((list) => {
              const lastActivity =
                list.updatedAt !== list.createdAt
                  ? `Updated ${formatDistanceToNow(list.updatedAt, { addSuffix: true })}`
                  : `Created ${formatDistanceToNow(list.createdAt, { addSuffix: true })}`;

              return (
                <div key={list.id} className='animate-fade-in' title={lastActivity}>
                  <TodoList list={list} todos={todos || []} />
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value='calendar' className='mt-0'>
          <div className='flex h-[300px] items-center justify-center rounded-lg border border-dashed'>
            <div className='text-muted-foreground text-center'>
              <p className='mb-2'>Calendar view coming soon</p>
              <Badge variant='outline'>Coming Soon</Badge>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {sortedLists.length === 0 && (
        <div className='animate-fade-in flex h-[300px] items-center justify-center rounded-lg border border-dashed'>
          <div className='text-muted-foreground max-w-md text-center'>
            <div className='bg-muted/50 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full p-3'>
              <ListTodo className='h-6 w-6' />
            </div>
            <p className='text-xl font-medium'>No todo lists yet</p>
            <p className='mt-2 text-sm'>Create your first list above to get started organizing your tasks!</p>
          </div>
        </div>
      )}
    </div>
  );
}
