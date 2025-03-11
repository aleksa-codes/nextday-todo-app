import { Suspense } from 'react';
import { TodoListsManager } from '@/components/todo-lists-manager';
import { LoadingTodoLists } from '@/components/loading-todo-lists';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Clock } from 'lucide-react';

export default async function TodoPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div className='flex h-full items-center justify-center'>Unauthorized</div>;
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className='size-full flex-grow space-y-8'>
      <div className='flex flex-col gap-2'>
        <div className='text-foreground/80 flex items-center gap-2 text-2xl font-semibold'>
          <Clock className='h-6 w-6' />
          <h2>
            {greeting()}, {session.user.name || session.user.email}
          </h2>
        </div>
        <p className='text-muted-foreground text-lg'>Welcome back! Make the most of your day.</p>
      </div>
      <Suspense fallback={<LoadingTodoLists />}>
        <TodoListsManager session={session} />
      </Suspense>
    </div>
  );
}
