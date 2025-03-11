import { Skeleton } from '@/components/ui/skeleton';
import { LoadingTodoList } from './loading-todo-list';

export function LoadingTodoLists() {
  return (
    <div className='space-y-8'>
      {/* Summary skeleton */}
      <div className='bg-card/60 dark:bg-card/40 rounded-xl border p-4 shadow-sm'>
        <div className='flex flex-col justify-between gap-4 sm:flex-row'>
          <div className='space-y-2'>
            <Skeleton className='h-7 w-32' />
            <Skeleton className='h-5 w-48' />
          </div>
          <div className='flex gap-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='bg-background rounded-lg border p-3 text-center'>
                <Skeleton className='mx-auto h-8 w-16' />
                <Skeleton className='mx-auto mt-1 h-4 w-20' />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form skeleton */}
      <div className='bg-background flex gap-3 rounded-lg border p-2'>
        <Skeleton className='h-10 flex-1' />
        <Skeleton className='h-10 w-28' />
      </div>

      {/* Lists skeleton */}
      <div>
        <div className='mb-4 flex items-center justify-between'>
          <Skeleton className='h-7 w-32' />
          <Skeleton className='h-10 w-48' />
        </div>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingTodoList key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
