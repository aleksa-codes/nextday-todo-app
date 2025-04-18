import Link from 'next/link';
import { CheckCircle2, CheckSquare2, Clock, Music2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthButton } from '@/components/auth-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import marketingImg from '@/assets/nextday.png';

const testimonials = [
  {
    name: 'Emma Thompson',
    title: 'Product Designer',
    avatar: 'https://i.pravatar.cc/100?img=1',
    content:
      'NextDay has completely transformed how I organize my work. The Pomodoro timer helps me stay focused, and I love earning coins for completed tasks!',
  },
  {
    name: 'Michael Chen',
    title: 'Software Engineer',
    avatar: 'https://i.pravatar.cc/100?img=3',
    content:
      'As a developer, I need to stay focused for long periods. The ambient music feature combined with task management is exactly what I needed.',
  },
  {
    name: 'Sophia Rodriguez',
    title: 'Marketing Manager',
    avatar: 'https://i.pravatar.cc/100?img=5',
    content:
      'I manage multiple projects and NextDay helps me stay organized. The interface is beautiful, and the app is so intuitive to use.',
  },
];

export default async function Home() {
  const session = await auth.api
    .getSession({
      headers: await headers(),
    })
    .catch(() => {
      redirect('/signin');
    });

  return (
    <div className='flex w-full flex-col items-center justify-center gap-16'>
      {/* Hero Section */}
      <section className='flex w-full flex-col items-center justify-center gap-8 pt-12 md:pt-24'>
        <div className='bg-background absolute inset-0 -z-10 h-full w-full'>
          <div className='absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]'></div>
        </div>

        <Badge variant='outline' className='px-3 py-1'>
          <Star className='mr-1 h-3 w-3 text-yellow-500' /> Just launched
        </Badge>

        <div className='flex max-w-3xl flex-col items-center gap-4 text-center'>
          <h1 className='text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl'>
            Stay Organized. <span className='text-primary'>Get More Done.</span>
          </h1>
          <p className='text-muted-foreground max-w-[42rem] text-lg sm:text-xl'>
            NextDay combines task management, focus techniques, and productivity tools in one seamless platform designed
            to help you accomplish more every day.
          </p>
        </div>

        <div className='flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4'>
          <AuthButton session={session} />
          <Button asChild size='lg' variant='outline' className='gap-1'>
            <Link href='#features'>Learn More</Link>
          </Button>
        </div>
      </section>

      {/* Screenshot/App Demo Section */}
      <section className='w-full pt-8'>
        <div className='mx-auto max-w-5xl overflow-hidden rounded-2xl border shadow-xl'>
          <div className='bg-card dark:bg-card relative pt-2 md:pt-3'>
            <div className='absolute top-0 left-0 flex space-x-2 p-3'>
              <div className='h-3 w-3 rounded-full bg-red-500'></div>
              <div className='h-3 w-3 rounded-full bg-yellow-500'></div>
              <div className='h-3 w-3 rounded-full bg-green-500'></div>
            </div>
            <div className='px-4 py-6'>
              <Image src={marketingImg} alt='NextDay app screenshot' className='rounded-md shadow-md' />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='w-full'>
        <div className='mx-auto max-w-6xl'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold tracking-tight sm:text-4xl'>Everything you need to be productive</h2>
            <p className='text-muted-foreground mx-auto max-w-[85%] text-lg'>
              A comprehensive toolkit designed to help you focus, organize, and achieve your goals.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            <Card className='bg-card/50 backdrop-blur-sm'>
              <CardContent className='flex flex-col items-center pt-6 text-center'>
                <div className='bg-primary/10 mb-4 rounded-full p-3'>
                  <CheckSquare2 className='text-primary h-8 w-8' />
                </div>
                <h3 className='text-xl font-bold'>Smart Todo Lists</h3>
                <p className='text-muted-foreground mt-2 px-2'>
                  Create, organize and prioritize tasks with intelligent list management
                </p>
                <ul className='mt-4 space-y-2 text-left'>
                  <li className='flex items-center'>
                    <CheckCircle2 className='text-primary mr-2 h-4 w-4' />
                    <span>Multiple list organization</span>
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle2 className='text-primary mr-2 h-4 w-4' />
                    <span>Progress tracking</span>
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle2 className='text-primary mr-2 h-4 w-4' />
                    <span>Priority management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className='bg-card/50 backdrop-blur-sm'>
              <CardContent className='flex flex-col items-center pt-6 text-center'>
                <div className='bg-primary/10 mb-4 rounded-full p-3'>
                  <Clock className='text-primary h-8 w-8' />
                </div>
                <h3 className='text-xl font-bold'>Pomodoro Timer</h3>
                <p className='text-muted-foreground mt-2 px-2'>
                  Boost focus and productivity with our customizable Pomodoro technique timer
                </p>
                <ul className='mt-4 space-y-2 text-left'>
                  <li className='flex items-center'>
                    <CheckCircle2 className='text-primary mr-2 h-4 w-4' />
                    <span>Customizable work intervals</span>
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle2 className='text-primary mr-2 h-4 w-4' />
                    <span>Earn coins for completed sessions</span>
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle2 className='text-primary mr-2 h-4 w-4' />
                    <span>Focus metrics and analytics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className='bg-card/50 backdrop-blur-sm'>
              <CardContent className='flex flex-col items-center pt-6 text-center'>
                <div className='bg-primary/10 mb-4 rounded-full p-3'>
                  <Music2 className='text-primary h-8 w-8' />
                </div>
                <h3 className='text-xl font-bold'>Ambient Music</h3>
                <p className='text-muted-foreground mt-2 px-2'>
                  Create the perfect work environment with integrated background music
                </p>
                <ul className='mt-4 space-y-2 text-left'>
                  <li className='flex items-center'>
                    <CheckCircle2 className='text-primary mr-2 h-4 w-4' />
                    <span>Lo-fi music selection</span>
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle2 className='text-primary mr-2 h-4 w-4' />
                    <span>Nature sounds library</span>
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle2 className='text-primary mr-2 h-4 w-4' />
                    <span>Custom mix creation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='from-primary/10 to-primary/5 w-full rounded-3xl bg-gradient-to-r py-12'>
        <div className='mx-auto max-w-5xl px-4'>
          <div className='grid grid-cols-2 gap-8 md:grid-cols-4'>
            <div className='text-center'>
              <div className='text-primary text-4xl font-bold'>10K+</div>
              <div className='text-muted-foreground mt-1'>Active Users</div>
            </div>
            <div className='text-center'>
              <div className='text-primary text-4xl font-bold'>5M+</div>
              <div className='text-muted-foreground mt-1'>Tasks Completed</div>
            </div>
            <div className='text-center'>
              <div className='text-primary text-4xl font-bold'>3M+</div>
              <div className='text-muted-foreground mt-1'>Pomodoro Sessions</div>
            </div>
            <div className='text-center'>
              <div className='text-primary text-4xl font-bold'>99%</div>
              <div className='text-muted-foreground mt-1'>Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='w-full'>
        <div className='mx-auto max-w-5xl'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold tracking-tight sm:text-4xl'>Loved by productivity enthusiasts</h2>
            <p className='text-muted-foreground mx-auto max-w-[85%] text-lg'>
              Don&apos;t take our word for it. Here&apos;s what our users have to say about NextDay.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {testimonials.map((testimonial, index) => (
              <Card key={index} className='bg-muted/40'>
                <CardContent className='pt-6'>
                  <div className='flex items-start gap-4'>
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-medium'>{testimonial.name}</p>
                      <p className='text-muted-foreground text-sm'>{testimonial.title}</p>
                    </div>
                  </div>
                  <div className='mt-4 flex'>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    ))}
                  </div>
                  <p className='mt-3 text-sm'>{testimonial.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-primary w-full rounded-3xl px-6 py-12 md:px-12'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='text-primary-foreground text-3xl font-bold sm:text-4xl'>Ready to boost your productivity?</h2>
          <p className='text-primary-foreground/90 mx-auto mt-4 max-w-lg text-lg'>
            Join thousands of users who have transformed their daily productivity with NextDay.
          </p>
          <Button asChild size='lg' variant='secondary' className='mt-8'>
            <Link href='/signin'>Start for free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
