'use client';

import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { LogOut, CheckSquare2, User, Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success('Signed out successfully');
      router.push('/');
    } catch {
      toast.error('Failed to sign out');
    }
  };

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

  return (
    <nav className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-sm'>
      <div className='container flex h-16 items-center justify-between'>
        <Link href='/' className='flex items-center space-x-2'>
          <CheckSquare2 className='text-primary h-6 w-6' />
          <span className='text-lg font-bold'>NextDay</span>
        </Link>

        <div className='flex items-center gap-4'>
          {isPending || !mounted ? (
            <div className='bg-muted h-10 w-10 animate-pulse rounded-full' />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
                  <Avatar className='border-primary h-10 w-10 border-2'>
                    <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                    <AvatarFallback>{getUserInitials(session.user.name, session.user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56' align='end' forceMount>
                <DropdownMenuLabel className='font-normal'>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm leading-none font-medium'>{session.user.name}</p>
                    <p className='text-muted-foreground text-xs leading-none'>{session.user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link href='/profile'>
                    <DropdownMenuItem className='cursor-pointer'>
                      <User className='mr-2 h-4 w-4' />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className='px-2 py-1.5 text-sm font-semibold'>Theme</DropdownMenuLabel>
                  <DropdownMenuItem className='cursor-pointer' onClick={() => setTheme('light')}>
                    <Sun className='mr-2 h-4 w-4' />
                    <span>Light</span>
                    {theme === 'light' ? <Check className='ml-auto h-4 w-4' /> : null}
                  </DropdownMenuItem>
                  <DropdownMenuItem className='cursor-pointer' onClick={() => setTheme('dark')}>
                    <Moon className='mr-2 h-4 w-4' />
                    <span>Dark</span>
                    {theme === 'dark' ? <Check className='ml-auto h-4 w-4' /> : null}
                  </DropdownMenuItem>
                  <DropdownMenuItem className='cursor-pointer' onClick={() => setTheme('system')}>
                    <Laptop className='mr-2 h-4 w-4' />
                    <span>System</span>
                    {theme === 'system' ? <Check className='ml-auto h-4 w-4' /> : null}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='cursor-pointer text-red-600' onClick={handleSignOut}>
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href='/signin'
              className='bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50'
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
