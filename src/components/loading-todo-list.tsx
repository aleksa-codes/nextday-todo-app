import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingTodoList() {
  return (
    <Card className='w-full animate-pulse'>
      <CardHeader className='flex flex-row items-center space-y-0 pb-2'>
        <div className='flex-1'>
          <Skeleton className='h-6 w-3/4' />
          <Skeleton className='mt-2 h-4 w-1/2' />
        </div>
        <Skeleton className='h-8 w-8 rounded-md' />
      </CardHeader>
      <CardContent className='space-y-4 pt-4'>
        <div className='flex gap-2'>
          <Skeleton className='h-10 flex-1' />
          <Skeleton className='h-10 w-10' />
        </div>
        <div className='space-y-2'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='flex items-center gap-2'>
              <Skeleton className='h-4 w-4' />
              <Skeleton className='h-4 flex-1' />
              <Skeleton className='h-8 w-20' />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
