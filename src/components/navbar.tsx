'use client';

import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';
import {
  LogOut,
  CheckSquare2,
  User,
  Sun,
  Moon,
  Laptop,
  Check,
  Coins,
  CreditCard,
  GithubIcon,
  ListTodo,
  Menu,
  Crown,
  ImageIcon,
} from 'lucide-react';
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
import { useEffect, useState, useLayoutEffect } from 'react';
import { useBalance, useSubscription } from '@/lib/mutations';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const themeOptions = [
  { value: 'light', label: 'Light', icon: <Sun className='h-4 w-4' /> },
  { value: 'dark', label: 'Dark', icon: <Moon className='h-4 w-4' /> },
  { value: 'system', label: 'System', icon: <Laptop className='h-4 w-4' /> },
];

interface ThemeDropdownContentProps {
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

function ThemeDropdownContent({ theme, setTheme }: ThemeDropdownContentProps) {
  return (
    <>
      <DropdownMenuLabel className='px-2 py-1.5 text-sm font-semibold'>Theme</DropdownMenuLabel>
      {themeOptions.map((option) => (
        <DropdownMenuItem key={option.value} className='cursor-pointer' onClick={() => setTheme(option.value)}>
          {option.icon}
          <span className='ml-2'>{option.label}</span>
          {theme === option.value && <Check className='ml-auto h-4 w-4' />}
        </DropdownMenuItem>
      ))}
    </>
  );
}

interface MobileThemeOptionsProps {
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

function MobileThemeOptions({ theme, setTheme }: MobileThemeOptionsProps) {
  return (
    <div className='px-6 py-2'>
      <p className='text-muted-foreground mb-2 text-xs font-medium'>Theme</p>
      <div className='space-y-1'>
        {themeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              'text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-sm',
              theme === option.value && 'text-primary font-medium',
            )}
          >
            {option.icon}
            <span>{option.label}</span>
            {theme === option.value && <Check className='ml-auto h-3.5 w-3.5' />}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: balance, isLoading: isBalanceLoading } = useBalance();
  const { data: subscriptionData } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);

  // Provide a fallback value if data is undefined
  const hasActiveSubscription = !!subscriptionData?.hasActiveSubscription;

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Navigation links used in both desktop and mobile menu
  const navLinks = [
    {
      href: '/todos',
      label: 'ToDos',
      icon: <ListTodo className='h-4 w-4' />,
    },
    {
      href: '/image-generator',
      label: 'AI Image',
      icon: <ImageIcon className='h-4 w-4' />,
    },
    {
      href: '/pricing',
      label: 'Pricing',
      icon: <CreditCard className='h-4 w-4' />,
    },
    // Premium features link - only shown to subscribed users
    ...(hasActiveSubscription
      ? [
          {
            href: '/premium-features',
            label: 'Premium',
            icon: <Crown className='h-4 w-4' />,
            premium: true,
          },
        ]
      : []),
    {
      href: 'https://github.com/aleksa-codes/nextday-todo-app',
      label: 'GitHub',
      icon: <GithubIcon className='h-4 w-4' />,
      external: true,
    },
  ];

  return (
    <nav className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-sm'>
      <div className='container flex h-16 items-center justify-between'>
        <div className='flex items-center space-x-4 md:space-x-8'>
          <Link href='/' className='flex items-center space-x-2'>
            <CheckSquare2 className='text-primary h-6 w-6' />
            <span className='text-lg font-bold'>NextDay</span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden space-x-6 md:flex'>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className={cn(
                  'hover:text-primary flex items-center space-x-1.5 text-sm transition-colors',
                  pathname === link.href ? 'text-primary font-medium' : 'text-muted-foreground',
                  link.premium && 'text-amber-500 hover:text-amber-600',
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-2 md:gap-4'>
          {/* Desktop-only user elements */}
          {isPending || !mounted ? (
            <div className='hidden items-center gap-2 md:flex'>
              <Skeleton className='h-7 w-20 rounded-full' />
              <Skeleton className='h-10 w-10 rounded-full' />
            </div>
          ) : session ? (
            <div className='hidden items-center gap-2 md:flex'>
              {isBalanceLoading ? (
                <Skeleton className='h-8 w-20 rounded-full' />
              ) : (
                <div className='bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-between gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors'>
                  <Coins className='text-warning h-4 w-4 shrink-0' />
                  {balance}
                </div>
              )}
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
                    {themeOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        className='cursor-pointer'
                        onClick={() => setTheme(option.value)}
                      >
                        {option.icon}
                        <span className='ml-2'>{option.label}</span>
                        {theme === option.value && <Check className='ml-auto h-4 w-4' />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className='cursor-pointer text-red-600' onClick={handleSignOut}>
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className='hidden items-center gap-2 md:flex'>
              {/* Sign in Button */}
              <Link
                href='/signin'
                className='bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50'
              >
                Sign in
              </Link>
              {/* Theme Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon'>
                    <Sun className='h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
                    <Moon className='absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
                    <span className='sr-only'>Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <ThemeDropdownContent theme={theme} setTheme={setTheme} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Mobile Menu Button - moved to right side */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className='md:hidden'>
              <Button variant='ghost' size='icon'>
                <Menu className='h-5 w-5' />
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='flex w-[280px] flex-col p-0 sm:w-[320px]'>
              <SheetHeader className='p-6 pb-2'>
                <SheetTitle className='flex items-center gap-2'>
                  <CheckSquare2 className='text-primary h-5 w-5' />
                  <span>NextDay</span>
                </SheetTitle>
              </SheetHeader>

              {/* User Profile Section in Mobile Menu - Now clickable to go to profile */}
              {!isPending && mounted && session && (
                <div className='border-b px-6 py-4'>
                  <SheetClose asChild>
                    <Link href='/profile' className='flex items-center space-x-3 hover:opacity-80'>
                      <Avatar className='border-primary h-10 w-10 border-2'>
                        <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                        <AvatarFallback>{getUserInitials(session.user.name, session.user.email)}</AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col'>
                        <span className='font-medium'>{session.user.name}</span>
                        <span className='text-muted-foreground text-xs'>{session.user.email}</span>
                      </div>
                    </Link>
                  </SheetClose>

                  {isBalanceLoading ? (
                    <Skeleton className='mt-3 h-8 w-24 rounded-full' />
                  ) : (
                    <div className='bg-secondary text-secondary-foreground mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium'>
                      <Coins className='text-warning h-4 w-4 shrink-0' />
                      {balance}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Links Section */}
              <div className='flex-1 overflow-auto py-2'>
                <div className='px-3'>
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className={cn(
                          'my-1 flex items-center gap-3 rounded-md px-3 py-2',
                          pathname === link.href
                            ? 'bg-muted text-primary font-medium'
                            : 'text-foreground hover:bg-muted hover:text-primary',
                          link.premium && 'text-amber-500 hover:text-amber-600',
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.icon}
                        <span>{link.label}</span>
                      </Link>
                    </SheetClose>
                  ))}
                </div>

                {/* Settings Section - Removed Profile from here */}
                <div className='mt-4 border-t pt-2'>
                  {/* Theme Options */}
                  <MobileThemeOptions theme={theme} setTheme={setTheme} />
                </div>
              </div>

              {/* Auth Actions */}
              <div className='mt-auto border-t px-6 py-4'>
                {!isPending && mounted ? (
                  session ? (
                    <SheetClose asChild>
                      <Button variant='ghost' className='text-destructive w-full justify-start' onClick={handleSignOut}>
                        <LogOut className='mr-2 h-4 w-4' />
                        Sign out
                      </Button>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Link
                        href='/signin'
                        className='bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium'
                      >
                        Sign in
                      </Link>
                    </SheetClose>
                  )
                ) : (
                  <Skeleton className='h-10 w-full rounded-md' />
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
