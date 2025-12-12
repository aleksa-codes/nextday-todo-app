'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Laptop, Smartphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { type Session } from '@/lib/auth-client';
import { UAParser } from 'ua-parser-js';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const deleteAccountFormSchema = z.object({
  confirmMessage: z.string().superRefine((val, ctx) => {
    if (val !== 'DELETE MY ACCOUNT') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please type "DELETE MY ACCOUNT" to confirm',
      });
    }
  }),
});

interface SecurityFormProps {
  session: Session | null;
  activeSessions: Session['session'][];
}

export function SecurityForm({ session, activeSessions }: SecurityFormProps) {
  const router = useRouter();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [isTerminating, setIsTerminating] = useState<string>();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);

  const resetPasswordSchema = z.object({
    email: z
      .string()
      .email('Please enter a valid email address')
      .refine((email) => email === session?.user.email, {
        message: "Email doesn't match your account email",
      }),
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const deleteAccountForm = useForm({
    resolver: zodResolver(deleteAccountFormSchema),
    defaultValues: {
      confirmMessage: '',
    },
  });

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.slice(0, 3) + '*'.repeat(localPart.length - 3);
    const maskedDomain = '*'.repeat(domain.length - 4) + domain.slice(-4);
    return `${maskedLocal}@${maskedDomain}`;
  };

  async function onPasswordSubmit(data: z.infer<typeof passwordFormSchema>) {
    try {
      setIsChangingPassword(true);
      await authClient.changePassword(
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          revokeOtherSessions,
        },
        {
          onRequest: () => setIsChangingPassword(true),
          onSuccess: () => {
            toast.success('Password changed successfully');
            setIsChangingPassword(false);
            setIsPasswordDialogOpen(false);
            passwordForm.reset();
          },
          onError: (ctx) => {
            toast.error('Error changing password', {
              description: ctx.error.message,
            });
            setIsChangingPassword(false);
          },
          onSettled: () => {
            setIsChangingPassword(false);
          },
        },
      );
    } catch {
      toast.error('Error changing password');
    }
  }

  async function onDeleteAccount() {
    try {
      await authClient.deleteUser(
        {
          callbackURL: '/goodbye',
        },
        {
          onRequest: () => setIsDeletingAccount(true),
          onSuccess: () => {
            toast.success('Account deletion email sent. Please check your inbox.');
            setIsDeleteDialogOpen(false);
            deleteAccountForm.reset();
            setIsDeletingAccount(false);
          },
          onError: (ctx) => {
            toast.error('Error deleting account', {
              description: ctx.error.message,
            });
            setIsDeletingAccount(false);
          },
          onSettled: () => {
            setIsDeletingAccount(false);
          },
        },
      );
    } catch {
      toast.error('Error deleting account');
      setIsDeletingAccount(false);
    }
  }

  async function handleForgotPassword(values: z.infer<typeof resetPasswordSchema>) {
    try {
      setIsLoading(true);
      await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: '/reset-password',
      });
      toast.success('Reset link sent', {
        description: 'Check your email for the password reset link',
      });
      setIsResetPasswordDialogOpen(false);
      resetPasswordForm.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset link';
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>Current Password</p>
              <p className='text-muted-foreground text-sm'>••••••••••••</p>
            </div>
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline'>Change Password</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Make sure your password is strong and unique to keep your account secure.
                  </DialogDescription>
                </DialogHeader>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className='space-y-4'>
                    <FormField
                      control={passwordForm.control}
                      name='currentPassword'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type='password' autoComplete='current-password' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name='newPassword'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type='password' autoComplete='new-password' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name='confirmPassword'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type='password' autoComplete='new-password' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='flex items-center space-x-2'>
                      <Switch
                        id='revoke-sessions'
                        checked={revokeOtherSessions}
                        onCheckedChange={setRevokeOtherSessions}
                      />
                      <label
                        htmlFor='revoke-sessions'
                        className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                      >
                        Sign out from other devices
                      </label>
                    </div>
                    <Button type='submit' className='w-full' disabled={isChangingPassword}>
                      {isChangingPassword ? (
                        <div className='flex items-center justify-center gap-2'>
                          <Loader2 className='h-4 w-4 animate-spin' />
                          <span>Changing password...</span>
                        </div>
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Reset</CardTitle>
          <CardDescription>Need to recover access? We&apos;ll send you a password reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>Account Email</p>
              <p className='text-muted-foreground text-sm'>
                {session?.user.email ? maskEmail(session.user.email) : ''}
              </p>
            </div>
            <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline'>Send Reset Link</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Your Password</DialogTitle>
                  <DialogDescription>
                    For security, please confirm your email address. We&apos;ll send you a link to reset your password.
                  </DialogDescription>
                </DialogHeader>
                <Form {...resetPasswordForm}>
                  <form onSubmit={resetPasswordForm.handleSubmit(handleForgotPassword)} className='space-y-4'>
                    <FormField
                      control={resetPasswordForm.control}
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
                    <Button type='submit' className='w-full' disabled={isLoading}>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active sessions across different devices.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex w-full flex-col gap-1 border-l-2 px-2'>
            {activeSessions
              .filter((session) => session.userAgent)
              .map((activeSession) => {
                const parser = new UAParser(activeSession.userAgent || '');
                const device = parser.getDevice();
                const os = parser.getOS();
                const browser = parser.getBrowser();

                return (
                  <div key={activeSession.id} className='py-2'>
                    <div className='text-foreground flex items-center gap-2 text-sm'>
                      <div className='flex items-center gap-2'>
                        {device.type === 'mobile' ? <Smartphone className='h-4 w-4' /> : <Laptop className='h-4 w-4' />}
                        <span>
                          {os.name}, {browser.name}
                        </span>
                      </div>
                      <Button
                        variant='link'
                        size='sm'
                        className='text-destructive hover:text-destructive'
                        onClick={async () => {
                          setIsTerminating(activeSession.id);
                          try {
                            await authClient.revokeSession(
                              { token: activeSession.token },
                              {
                                onSuccess: async () => {
                                  toast.success('Session terminated successfully');
                                  if (activeSession.id === session?.session.id) {
                                    await authClient.signOut();
                                  }
                                  router.refresh();
                                },
                                onError: (ctx) => {
                                  toast.error('Failed to terminate session', {
                                    description: ctx.error.message,
                                  });
                                },
                              },
                            );
                          } finally {
                            setIsTerminating(undefined);
                          }
                        }}
                        disabled={isTerminating === activeSession.id}
                      >
                        {isTerminating === activeSession.id ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : activeSession.id === session?.session.id ? (
                          'Sign Out'
                        ) : (
                          'Terminate'
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by enabling two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant='outline' disabled>
            Coming Soon
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-destructive'>Delete Account</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant='destructive'>Delete Account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Please type &quot;DELETE MY ACCOUNT&quot; to confirm.
                </DialogDescription>
              </DialogHeader>
              <Form {...deleteAccountForm}>
                <form onSubmit={deleteAccountForm.handleSubmit(onDeleteAccount)} className='space-y-6'>
                  <FormField
                    control={deleteAccountForm.control}
                    name='confirmMessage'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmation</FormLabel>
                        <FormControl>
                          <Input placeholder='Type "DELETE MY ACCOUNT" to confirm' autoComplete='off' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='flex gap-3'>
                    <Button
                      type='button'
                      variant='outline'
                      className='flex-1'
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type='submit' variant='destructive' className='flex-1' disabled={isDeletingAccount}>
                      {isDeletingAccount ? (
                        <div className='flex items-center justify-center gap-2'>
                          <Loader2 className='h-4 w-4 animate-spin' />
                          <span>Deleting...</span>
                        </div>
                      ) : (
                        'Delete Account'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
