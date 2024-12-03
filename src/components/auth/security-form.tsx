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

  const passwordForm = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

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
              <p className='text-sm font-medium leading-none'>Password</p>
              <p className='text-sm text-muted-foreground'>••••••••••</p>
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
                            <Input {...field} type='password' />
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
                            <Input {...field} type='password' />
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
                            <Input {...field} type='password' />
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
                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
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
                    <div className='flex items-center gap-2 text-sm text-foreground'>
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
    </div>
  );
}
