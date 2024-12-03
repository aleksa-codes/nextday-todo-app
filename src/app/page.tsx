import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckSquare2, Clock, Music2, Rocket, Zap, Heart } from 'lucide-react';

export default function Home() {
  return (
    <div className='flex max-w-5xl flex-col items-center justify-center gap-12'>
      <div className='flex max-w-3xl flex-col items-center gap-4 text-center'>
        <h1 className='text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]'>
          NextDay: Your Productivity Companion
        </h1>
        <p className='max-w-2xl text-lg text-muted-foreground sm:text-xl'>
          Seamlessly manage tasks, stay focused, and boost your productivity with an all-in-one productivity toolkit.
        </p>
      </div>
      <div className='flex gap-4'>
        <Link href='/todo'>
          <Button size='lg'>Get Started</Button>
        </Link>
        <Link href='/signin'>
          <Button variant='outline' size='lg'>
            Sign In
          </Button>
        </Link>
      </div>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
        <div className='flex flex-col items-center space-y-4 rounded-lg border p-6 text-center'>
          <CheckSquare2 className='h-12 w-12 text-primary' />
          <h2 className='text-xl font-bold'>Smart Todo Lists</h2>
          <p className='text-muted-foreground'>
            Organize and prioritize your tasks with intuitive list management and tracking
          </p>
        </div>
        <div className='flex flex-col items-center space-y-4 rounded-lg border p-6 text-center'>
          <Clock className='h-12 w-12 text-primary' />
          <h2 className='text-xl font-bold'>Pomodoro Timer</h2>
          <p className='text-muted-foreground'>
            Stay focused with customizable Pomodoro technique timers and motivational quotes
          </p>
        </div>
        <div className='flex flex-col items-center space-y-4 rounded-lg border p-6 text-center'>
          <Music2 className='h-12 w-12 text-primary' />
          <h2 className='text-xl font-bold'>Ambient Music</h2>
          <p className='text-muted-foreground'>
            Create the perfect work environment with integrated lo-fi music streaming
          </p>
        </div>
      </div>

      <div className='w-full rounded-lg border bg-card p-8'>
        <h2 className='mb-6 text-2xl font-bold'>Why NextDay?</h2>
        <div className='grid gap-6 md:grid-cols-2'>
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold'>Holistic Productivity</h3>
            <p className='text-muted-foreground'>
              Combine task management, focus techniques, and ambient music in one seamless application
            </p>
          </div>
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold'>Modern & Intuitive</h3>
            <p className='text-muted-foreground'>
              Built with cutting-edge technologies for a smooth, responsive, and delightful user experience
            </p>
          </div>
        </div>
      </div>

      <div className='w-full rounded-lg border bg-card p-8'>
        <h2 className='mb-6 text-2xl font-bold'>Our Commitment</h2>
        <div className='grid gap-6 md:grid-cols-3'>
          <div className='space-y-4 text-center'>
            <Rocket className='mx-auto h-12 w-12 text-primary' />
            <h3 className='text-xl font-semibold'>Continuous Innovation</h3>
            <p className='text-muted-foreground'>
              We&apos;re constantly evolving, adding new features and improvements based on user feedback
            </p>
          </div>
          <div className='space-y-4 text-center'>
            <Zap className='mx-auto h-12 w-12 text-primary' />
            <h3 className='text-xl font-semibold'>Performance First</h3>
            <p className='text-muted-foreground'>
              Blazing-fast performance and smooth user experience are at the core of our design philosophy
            </p>
          </div>
          <div className='space-y-4 text-center'>
            <Heart className='mx-auto h-12 w-12 text-primary' />
            <h3 className='text-xl font-semibold'>User-Centric Design</h3>
            <p className='text-muted-foreground'>
              Every feature is carefully crafted to enhance your productivity and make work feel more enjoyable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
