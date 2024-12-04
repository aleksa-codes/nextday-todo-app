'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Chrome, Github, Loader2 } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: form.getValues('email') || '',
    },
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    const { email, password } = values;

    await authClient.signIn.email(
      { email, password },
      {
        onRequest: () => setIsLoading(true),
        onSuccess: () => {
          toast.success('Signed in successfully', {
            description: 'Redirecting...',
          });
          router.push('/todo');
        },
        onError: (ctx) => {
          toast.error('Sign In Error', {
            description: ctx.error.message,
          });
          setIsLoading(false);
        },
        onSettled: () => setIsLoading(false),
      },
    );
  }

  async function onForgotPassword(values: z.infer<typeof forgotPasswordSchema>) {
    const { email } = values;

    try {
      setIsLoading(true);
      await authClient.forgetPassword({
        email,
        redirectTo: '/reset-password',
      });

      toast.success('Password Reset', {
        description: 'A password reset link has been sent to your email.',
      });

      setIsForgotPasswordModalOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to send password reset email';

      toast.error('Reset Password Error', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='john@example.com' type='email' autoComplete='email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center justify-between'>
                  <FormLabel>Password</FormLabel>
                  <Dialog open={isForgotPasswordModalOpen} onOpenChange={setIsForgotPasswordModalOpen}>
                    <DialogTrigger asChild>
                      <Button type='button' variant='link' className='h-auto p-0 text-sm'>
                        Forgot password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset Your Password</DialogTitle>
                        <DialogDescription>
                          Enter your email address and we&#39;ll send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...forgotPasswordForm}>
                        <form className='space-y-4'>
                          <FormField
                            control={forgotPasswordForm.control}
                            name='email'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input placeholder='Enter your email' type='email' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type='button'
                            className='w-full'
                            disabled={isLoading}
                            onClick={forgotPasswordForm.handleSubmit(onForgotPassword)}
                          >
                            {isLoading ? (
                              <div className='flex items-center justify-center gap-2'>
                                <Loader2 className='h-4 w-4 animate-spin' />
                                <span>Sending...</span>
                              </div>
                            ) : (
                              'Send Reset Link'
                            )}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormControl>
                  <Input placeholder='********' type='password' autoComplete='current-password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? (
              <div className='flex items-center justify-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Form>

      <div className='relative my-4'>
        <div className='absolute inset-0 flex items-center'>
          <Separator className='w-full' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>or</span>
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        <Button
          variant='outline'
          className='w-full gap-2'
          onClick={async () => {
            try {
              setIsLoading(true);
              await authClient.signIn.social({
                provider: 'google',
                callbackURL: '/todo',
              });
            } catch {
              toast.error('Error', {
                description: 'Failed to sign in with Google',
              });
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <Chrome />
          <span>Sign in with Google</span>
        </Button>
        <Button
          variant='outline'
          className='w-full gap-2'
          onClick={async () => {
            try {
              setIsLoading(true);
              await authClient.signIn.social({
                provider: 'github',
                callbackURL: '/todo',
              });
            } catch {
              toast.error('Error', {
                description: 'Failed to sign in with Github',
              });
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <Github />
          <span>Sign in with Github</span>
        </Button>
      </div>

      <div className='mt-4 text-center text-sm text-muted-foreground'>
        Don&apos;t have an account?{' '}
        <Link href='/signup' className='text-primary hover:underline'>
          Sign up
        </Link>
      </div>
    </>
  );
}
