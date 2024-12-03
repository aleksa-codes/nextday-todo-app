'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type TodoList } from '@/db/schema/todos';
import { Trash2, Loader2, Pencil, Plus, Save, X, List } from 'lucide-react';
import { toast } from 'sonner';
import { TodoList as TodoListComponent } from '@/components/todo-list';
import { motion, AnimatePresence } from 'framer-motion';
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

export function TodoListsManager() {
  const [lists, setLists] = useState<TodoList[]>([]);
  const [newListName, setNewListName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<number | null>(null);

  const fetchLists = useCallback(async () => {
    try {
      const response = await fetch('/api/todo-lists');
      const data = await response.json();
      setLists(data);
      if (data.length > 0 && !selectedListId) {
        setSelectedListId(data[0].id);
      }
    } catch {
      toast.error('Failed to fetch todo lists');
    } finally {
      setIsLoading(false);
    }
  }, [selectedListId]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const addList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/todo-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newListName }),
      });
      const newList = await response.json();
      setLists((prev) => [...prev, newList]);
      setNewListName('');
      toast.success('List created successfully');
      if (!selectedListId) {
        setSelectedListId(newList.id);
      }
    } catch {
      toast.error('Failed to create list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateList = async (id: number) => {
    if (!editName.trim()) return;

    try {
      const response = await fetch(`/api/todo-lists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editName }),
      });
      const updatedList = await response.json();
      setLists((prev) => prev.map((list) => (list.id === id ? updatedList : list)));
      setEditingListId(null);
      toast.success('List renamed successfully');
    } catch {
      toast.error('Failed to rename list');
    }
  };

  const deleteList = async (id: number) => {
    setIsAlertDialogOpen(true);
    setListToDelete(id);
  };

  const handleDeleteList = async () => {
    if (!listToDelete) return;

    try {
      await fetch(`/api/todo-lists/${listToDelete}`, {
        method: 'DELETE',
      });
      setLists((prev) => prev.filter((list) => list.id !== listToDelete));
      if (selectedListId === listToDelete) {
        const remainingLists = lists.filter((list) => list.id !== listToDelete);
        setSelectedListId(remainingLists[0]?.id || null);
      }
      toast.success('List deleted successfully');
    } catch {
      toast.error('Failed to delete list');
    } finally {
      setIsAlertDialogOpen(false);
      setListToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
      <Card className='border-2 transition-colors hover:border-primary/20 md:col-span-1'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <List className='h-5 w-5 text-primary' />
            Lists
          </CardTitle>
          <CardDescription>Manage your todo lists</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <form onSubmit={addList} className='flex gap-2'>
            <Input
              placeholder='New list name'
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className='flex-1'
            />
            <Button type='submit' size='icon' disabled={isSubmitting} aria-label='Add new list' variant='secondary'>
              {isSubmitting ? <Loader2 className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4' />}
            </Button>
          </form>

          <Separator />

          <ScrollArea className='h-96'>
            <div className='space-y-1'>
              <AnimatePresence mode='popLayout'>
                {lists.map((list) => (
                  <motion.div
                    key={list.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <div
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-md p-2 transition-all hover:bg-accent hover:shadow-sm',
                        selectedListId === list.id && 'bg-accent shadow-sm',
                      )}
                      onClick={() => setSelectedListId(list.id)}
                      role='listitem'
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedListId(list.id);
                        }
                      }}
                      aria-current={selectedListId === list.id ? 'true' : undefined}
                      aria-label={`Select ${list.name} list`}
                    >
                      {editingListId === list.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            updateList(list.id);
                          }}
                          className='flex flex-1 gap-2'
                        >
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className='flex-1'
                            autoFocus
                          />
                          <Button type='submit' size='icon' variant='ghost' aria-label='Save list name'>
                            <Save className='h-4 w-4' />
                          </Button>
                          <Button
                            type='button'
                            size='icon'
                            variant='ghost'
                            onClick={() => setEditingListId(null)}
                            aria-label='Cancel editing'
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </form>
                      ) : (
                        <>
                          <List className='h-4 w-4 text-primary' />
                          <span className='flex-1 truncate font-medium'>{list.name}</span>
                          <div className='flex gap-1'>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-8 w-8'
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingListId(list.id);
                                setEditName(list.name);
                              }}
                              aria-label='Edit list name'
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-8 w-8 hover:text-destructive'
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteList(list.id);
                              }}
                              aria-label='Delete list'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {lists.length === 0 && (
                <motion.div
                  className='flex flex-col items-center justify-center gap-2 p-4'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge variant='secondary' className='text-sm'>
                    No Lists
                  </Badge>
                  <p className='text-center text-sm text-muted-foreground'>Create a list to get started!</p>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className='md:col-span-3'>
        <CardHeader>
          <CardTitle>{lists.find((list) => list.id === selectedListId)?.name || 'Select a List'}</CardTitle>
          <CardDescription>
            {selectedListId ? 'Manage your todos in this list' : 'Choose a list from the sidebar to manage todos'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedListId ? (
            <TodoListComponent listId={selectedListId} />
          ) : (
            <motion.div
              className='flex flex-col items-center justify-center gap-2 p-8'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Badge variant='outline' className='text-sm'>
                No List Selected
              </Badge>
              <p className='text-center text-sm text-muted-foreground'>
                Select a list from the sidebar or create a new one to manage your todos.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete List</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>Are you sure you want to delete this list and all its todos?</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteList}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
