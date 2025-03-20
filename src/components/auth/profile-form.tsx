'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
import { type Session } from '@/lib/auth-client';
import { uploadImageToSupabase } from '@/lib/supabase-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Github, Chrome } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';

type Provider = 'github' | 'google';

const nameFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const emailFormSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

const imageFormSchema = z.object({
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

interface ProfileFormProps {
  session: Session | null;
}

export function ProfileForm({ session }: ProfileFormProps) {
  const [isLinking, setIsLinking] = useState<Provider | null>(null);
  const [isUnlinking, setIsUnlinking] = useState<Provider | null>(null);
  const [accounts, setAccounts] = useState<{ id: string; providerId: Provider }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [openDialogs, setOpenDialogs] = useState({
    name: false,
    email: false,
    image: false,
  });
  const [userData, setUserData] = useState({
    name: session?.user.name || '',
    email: session?.user.email || '',
    image: session?.user.image || '',
    emailVerified: session?.user.emailVerified || false,
  });

  const nameForm = useForm<z.infer<typeof nameFormSchema>>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      name: session?.user.name || '',
    },
  });

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: session?.user.email || '',
    },
  });

  const imageForm = useForm<z.infer<typeof imageFormSchema>>({
    resolver: zodResolver(imageFormSchema),
    defaultValues: {
      profileImage: null,
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const { data } = await authClient.listAccounts();
      setAccounts(
        data?.map(({ accountId, provider }) => ({
          id: accountId,
          providerId: provider as Provider,
        })) || [],
      );
    } catch (error) {
      toast.error('Failed to load accounts', {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  async function handleLinkAccount(provider: Provider) {
    try {
      setIsLinking(provider);
      await authClient.linkSocial(
        {
          provider,
          callbackURL: '/profile',
        },
        {
          onSuccess: () => {
            toast.success(`Successfully linked ${provider} account`);
            loadAccounts(); // Refresh the accounts list
          },
          onError: (ctx) => {
            toast.error(`Failed to link ${provider} account`, {
              description: ctx.error.message,
            });
            setIsLinking(null);
          },
          onSettled: () => {
            setIsLinking(null);
          },
        },
      );
    } catch {
      toast.error(`Failed to link ${provider} account`);
      setIsLinking(null);
    }
  }

  async function handleUnlinkAccount(provider: Provider) {
    try {
      setIsUnlinking(provider);

      const unlinkAccountId = accounts.find((account) => account.providerId === provider)?.id;

      await authClient.unlinkAccount(
        { providerId: provider, accountId: unlinkAccountId! },
        {
          onSuccess: () => {
            toast.success(`Successfully unlinked ${provider} account`);
            loadAccounts(); // Refresh the accounts list
          },
          onError: (ctx) => {
            toast.error(`Failed to unlink ${provider} account`, {
              description: ctx.error.message,
            });
            setIsUnlinking(null);
          },
          onSettled: () => {
            setIsUnlinking(null);
          },
        },
      );
    } catch (error: unknown) {
      toast.error(`Failed to unlink ${provider} account`, {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      setIsUnlinking(null);
    }
  }

  async function onUpdateName(data: z.infer<typeof nameFormSchema>) {
    try {
      setIsUpdatingName(true);
      await authClient.updateUser({
        name: data.name,
      });
      setUserData((prev) => ({ ...prev, name: data.name }));
      setOpenDialogs((prev) => ({ ...prev, name: false }));
      toast.success('Name updated successfully');
    } catch {
      toast.error('Failed to update name');
    } finally {
      setIsUpdatingName(false);
    }
  }

  async function onUpdateEmail(data: z.infer<typeof emailFormSchema>) {
    try {
      setIsUpdatingEmail(true);
      if (data.email !== userData.email) {
        await authClient.changeEmail({
          newEmail: data.email,
          callbackURL: '/profile',
        });
        setUserData((prev) => ({ ...prev, email: data.email, emailVerified: false }));
        setOpenDialogs((prev) => ({ ...prev, email: false }));
        toast.success('Verification email sent. Please check your inbox.');
      }
    } catch {
      toast.error('Failed to update email');
    } finally {
      setIsUpdatingEmail(false);
    }
  }

  async function onUpdateImage(data: z.infer<typeof imageFormSchema>) {
    try {
      setIsUpdatingImage(true);
      if (!data.profileImage || !session?.user.id) return;

      // Pass the current image URL for cleanup
      const imageUrl = await uploadImageToSupabase(data.profileImage, session.user.id, userData.image);

      // Update user profile with the new image URL
      await authClient.updateUser({
        image: imageUrl,
        fetchOptions: {
          onSuccess: () => {
            toast.success('Profile picture updated successfully');
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        },
      });

      setUserData((prev) => ({ ...prev, image: imageUrl }));
      setOpenDialogs((prev) => ({ ...prev, image: false }));
      setImagePreview(null);
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setIsUpdatingImage(false);
    }
  }

  function getUserInitials(name: string | null, email: string | null): string {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  }

  if (!session) return null;

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-8'>
            <div className='flex flex-col space-y-6 sm:space-y-8'>
              <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                <div className='flex flex-col space-y-1.5'>
                  <p className='text-sm font-semibold'>Name</p>
                  <p className='text-muted-foreground text-sm'>{userData.name}</p>
                </div>
                <Dialog
                  open={openDialogs.name}
                  onOpenChange={(open) => {
                    setOpenDialogs((prev) => ({ ...prev, name: open }));
                    if (!open) {
                      nameForm.reset({ name: userData.name });
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant='outline' className='w-full sm:w-auto'>
                      Change name
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[400px]'>
                    <DialogHeader>
                      <DialogTitle>Change name</DialogTitle>
                      <DialogDescription>Make changes to your display name.</DialogDescription>
                    </DialogHeader>
                    <Form {...nameForm}>
                      <form onSubmit={nameForm.handleSubmit(onUpdateName)} className='space-y-6'>
                        <FormField
                          control={nameForm.control}
                          name='name'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className='w-full'
                                  placeholder='Enter your name'
                                  autoComplete='name'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className='flex gap-3 pt-3'>
                          <Button
                            type='button'
                            variant='outline'
                            className='flex-1'
                            onClick={() => setOpenDialogs((prev) => ({ ...prev, name: false }))}
                          >
                            Cancel
                          </Button>
                          <Button
                            type='submit'
                            className='flex-1'
                            disabled={isUpdatingName || nameForm.watch('name') === userData.name}
                          >
                            {isUpdatingName && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            Save changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                <div className='flex flex-col space-y-1.5'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-semibold'>Email</p>
                    {userData.emailVerified ? (
                      <span className='inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset'>
                        Verified
                      </span>
                    ) : (
                      <span className='inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-yellow-600/20 ring-inset'>
                        Unverified
                      </span>
                    )}
                  </div>
                  <p className='text-muted-foreground text-sm'>{userData.email}</p>
                </div>
                <Dialog
                  open={openDialogs.email}
                  onOpenChange={(open) => {
                    setOpenDialogs((prev) => ({ ...prev, email: open }));
                    if (!open) {
                      emailForm.reset({ email: userData.email });
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant='outline' className='w-full sm:w-auto'>
                      Change email
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[400px]'>
                    <DialogHeader>
                      <DialogTitle>Change email address</DialogTitle>
                      <DialogDescription>
                        Update your email address. You&rsquo;ll need to verify the new email.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...emailForm}>
                      <form onSubmit={emailForm.handleSubmit(onUpdateEmail)} className='space-y-6'>
                        <FormField
                          control={emailForm.control}
                          name='email'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email address</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className='w-full'
                                  type='email'
                                  placeholder='name@example.com'
                                  autoComplete='email'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className='flex gap-3 pt-3'>
                          <Button
                            type='button'
                            variant='outline'
                            className='flex-1'
                            onClick={() => setOpenDialogs((prev) => ({ ...prev, email: false }))}
                          >
                            Cancel
                          </Button>
                          <Button
                            type='submit'
                            className='flex-1'
                            disabled={isUpdatingEmail || emailForm.watch('email') === userData.email}
                          >
                            {isUpdatingEmail && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            Save changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                <div className='flex items-start gap-4 sm:items-center'>
                  <Avatar className='ring-muted h-16 w-16 ring-2 ring-offset-2'>
                    <AvatarImage src={userData.image} alt={userData.name} />
                    <AvatarFallback>{getUserInitials(userData.name, userData.email)}</AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col space-y-1.5'>
                    <p className='text-sm font-semibold'>Profile picture</p>
                    <p className='text-muted-foreground text-sm'>Update your profile picture</p>
                  </div>
                </div>
                <Dialog
                  open={openDialogs.image}
                  onOpenChange={(open) => {
                    setOpenDialogs((prev) => ({ ...prev, image: open }));
                    if (!open) {
                      imageForm.reset({ profileImage: null });
                      setImagePreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant='outline' className='w-full sm:w-auto'>
                      Change picture
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[400px]'>
                    <DialogHeader>
                      <DialogTitle>Change profile picture</DialogTitle>
                      <DialogDescription>Upload a new profile picture. Recommended size 400x400px.</DialogDescription>
                    </DialogHeader>
                    <Form {...imageForm}>
                      <form onSubmit={imageForm.handleSubmit(onUpdateImage)} className='space-y-6'>
                        <div className='flex flex-col items-center space-y-6'>
                          <Avatar className='ring-muted h-32 w-32 ring-2 ring-offset-4'>
                            <AvatarImage src={imagePreview || userData.image} alt={userData.name} />
                            <AvatarFallback className='text-4xl'>
                              {userData.name?.[0] || userData.email?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex w-full gap-3'>
                            <Button
                              type='button'
                              variant='outline'
                              onClick={() => fileInputRef.current?.click()}
                              className='flex-1'
                            >
                              Choose image
                            </Button>
                            {imagePreview && (
                              <Button
                                type='button'
                                variant='destructive'
                                onClick={() => {
                                  imageForm.setValue('profileImage', null);
                                  setImagePreview(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                                className='flex-1'
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <input
                            type='file'
                            ref={fileInputRef}
                            accept='image/*'
                            className='hidden'
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                imageForm.setValue('profileImage', file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setImagePreview(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <FormMessage>{imageForm.formState.errors.profileImage?.message}</FormMessage>
                        </div>
                        <div className='flex gap-3 pt-3'>
                          <Button
                            type='button'
                            variant='outline'
                            className='flex-1'
                            onClick={() => setOpenDialogs((prev) => ({ ...prev, image: false }))}
                          >
                            Cancel
                          </Button>
                          <Button type='submit' className='flex-1' disabled={!imagePreview || isUpdatingImage}>
                            {isUpdatingImage && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            Save changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-xl font-bold'>Connected Accounts</CardTitle>
          <CardDescription>Connect your account with third-party providers for easier sign in.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Github className='h-5 w-5' />
              <span>Github</span>
            </div>
            {accounts.some((account) => account.providerId === 'github') ? (
              <Button
                variant='outline'
                onClick={() => handleUnlinkAccount('github')}
                disabled={isUnlinking === 'github' || accounts.length === 1}
              >
                {isUnlinking === 'github' ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Unlinking...
                  </>
                ) : (
                  'Disconnect'
                )}
              </Button>
            ) : (
              <Button variant='outline' onClick={() => handleLinkAccount('github')} disabled={isLinking === 'github'}>
                {isLinking === 'github' ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            )}
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Chrome className='h-5 w-5' />
              <span>Google</span>
            </div>
            {accounts.some((account) => account.providerId === 'google') ? (
              <Button
                variant='outline'
                onClick={() => handleUnlinkAccount('google')}
                disabled={isUnlinking === 'google' || accounts.length === 1}
              >
                {isUnlinking === 'google' ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Unlinking...
                  </>
                ) : (
                  'Disconnect'
                )}
              </Button>
            ) : (
              <Button variant='outline' onClick={() => handleLinkAccount('google')} disabled={isLinking === 'google'}>
                {isLinking === 'google' ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
