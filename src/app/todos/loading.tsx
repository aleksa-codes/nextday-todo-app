import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';

export default function Loading() {
  return (
    <div className='size-full flex-grow space-y-8'>
      {/* User greeting skeleton */}
      <div className='flex flex-col gap-2'>
        <div className='text-foreground/80 flex items-center gap-2 text-2xl font-semibold'>
          <Clock className='h-6 w-6' />
          <Skeleton className='h-8 w-[180px]' />
        </div>
        <Skeleton className='h-6 w-[320px]' />
      </div>

      <div className='space-y-8'>
        {/* Summary section skeleton */}
        <div className='bg-card/60 dark:bg-card/40 rounded-xl border p-4 shadow-sm'>
          <div className='flex flex-col justify-between gap-4 sm:flex-row'>
            <div>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-5 w-5' />
                <Skeleton className='h-6 w-[120px]' />
              </div>
              <Skeleton className='mt-1 h-4 w-[200px]' />
            </div>

            <div className='flex gap-4'>
              <div className='bg-background rounded-lg border p-3 text-center shadow-sm'>
                <Skeleton className='mx-auto h-7 w-[30px]' />
                <div className='text-muted-foreground text-xs'>Total Tasks</div>
              </div>
              <div className='bg-background rounded-lg border p-3 text-center shadow-sm'>
                <Skeleton className='mx-auto h-7 w-[30px]' />
                <div className='text-muted-foreground text-xs'>Completed</div>
              </div>
              <div className='bg-background rounded-lg border p-3 text-center shadow-sm'>
                <Skeleton className='mx-auto h-7 w-[30px]' />
                <div className='text-muted-foreground text-xs'>Completion</div>
              </div>
            </div>
          </div>
        </div>

        {/* New list form skeleton */}
        <div className='bg-background flex gap-3 rounded-lg border p-2 shadow-sm'>
          <Skeleton className='h-10 flex-1' />
          <Skeleton className='h-10 w-[100px]' />
        </div>

        {/* Lists section with tabs */}
        <div className='w-full'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='text-xl font-semibold'>Your Lists</div>
            <div className='bg-muted rounded-lg p-1'>
              <div className='flex'>
                <div className='bg-background flex w-[80px] items-center justify-center gap-2 rounded px-3 py-1.5 text-sm font-medium'>
                  <Skeleton className='h-4 w-4' />
                  Grid
                </div>
                <div className='flex w-[80px] items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium'>
                  <Skeleton className='h-4 w-4' />
                  Calendar
                </div>
              </div>
            </div>
          </div>

          {/* Todo lists grid skeleton */}
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <ListSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <Card className='w-full'>
      <CardHeader className='flex flex-row items-center space-y-0 pb-2'>
        <Skeleton className='h-7 w-[150px]' />
        <Skeleton className='ml-2 h-5 w-10' />
        <div className='ml-auto'>
          <Skeleton className='h-8 w-8 rounded-md' />
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex gap-2'>
          <Skeleton className='h-10 flex-1' />
          <Skeleton className='h-10 w-10' />
        </div>
        <div className='space-y-2'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='flex items-center gap-2 py-1'>
              <Skeleton className='h-4 w-4 rounded' />
              <Skeleton className='h-4 flex-1' />
              <div className='flex gap-1'>
                <Skeleton className='h-8 w-8 rounded-md' />
                <Skeleton className='h-8 w-8 rounded-md' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
