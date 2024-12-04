'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, X, Loader2, Chrome, Github } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  profileImage: z
    .custom<File | null>()
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file.type.startsWith('image/');
    }, 'Please upload an image file')
    .refine((file) => {
      if (!file) return true;
      return file.size <= 5 * 1024 * 1024;
    }, 'Image must be less than 5MB'),
});

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      profileImage: null,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('profileImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetFileInput = () => {
    form.setValue('profileImage', null);
    form.clearErrors('profileImage');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  async function onSubmit(values: z.infer<typeof signUpSchema>) {
    const { name, email, password, profileImage } = values;

    await authClient.signUp.email(
      {
        email,
        password,
        name,
        image: profileImage ? await convertImageToBase64(profileImage) : '',
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          toast.success('Account created successfully');
          setUserEmail(email);
          setIsVerificationSent(true);
        },
        onError: (ctx) => {
          toast.error('Error', {
            description: ctx.error.message,
          });
          setIsLoading(false);
        },
        onSettled: () => {
          setIsLoading(false);
        },
      },
    );
  }

  if (isVerificationSent) {
    return (
      <Card className='w-full'>
        <CardHeader className='text-center'>
          <div className='mb-4 flex justify-center'>
            <Mail className='h-12 w-12 text-primary' />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a verification link to {userEmail}. Please check your inbox and click the link to verify
            your account.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <p className='text-center text-sm text-muted-foreground'>
            Didn&apos;t receive the email? Check your spam folder or try signing in to resend the verification email.
          </p>
          <div className='flex flex-col gap-2'>
            <Button variant='outline' asChild>
              <Link href='/auth/signin'>Go to sign in</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder='John Doe' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
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
              <FormLabel>Password *</FormLabel>
              <FormControl>
                <Input placeholder='********' type='password' autoComplete='new-password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='profileImage'
          render={() => (
            <FormItem>
              <FormLabel className='flex items-center gap-2'>
                Profile Image
                <span className='text-sm text-muted-foreground'>(Max size: 5MB)</span>
              </FormLabel>
              <div className='flex items-end gap-4'>
                {imagePreview && (
                  <Avatar className='h-16 w-16 border-2 border-primary'>
                    <AvatarImage src={imagePreview} alt='Profile preview' />
                    <AvatarFallback>{form.getValues('name')?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                )}
                <div className='flex w-full items-center gap-2'>
                  <FormControl>
                    <Input
                      id='image'
                      type='file'
                      accept='image/*'
                      onChange={handleImageChange}
                      className='w-full'
                      ref={fileInputRef}
                    />
                  </FormControl>
                  {imagePreview && <X className='cursor-pointer' onClick={resetFileInput} />}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? (
            <div className='flex items-center justify-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin' />
              <span>Creating account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

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
                description: 'Failed to sign up with Google',
              });
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <Chrome />
          <span>Continue with Google</span>
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
                description: 'Failed to sign up with Github',
              });
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <Github />
          <span>Continue with Github</span>
        </Button>
      </div>

      <div className='mt-4 text-center text-sm text-muted-foreground'>
        Already have an account?{' '}
        <Link href='/signin' className='text-primary hover:underline'>
          Sign in
        </Link>
      </div>
    </Form>
  );
}
