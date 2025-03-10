'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserCircle, Shield, CreditCard } from 'lucide-react';

export function ProfileNav() {
  const pathname = usePathname();

  const routes = [
    {
      href: '/profile',
      label: 'Profile',
      icon: <UserCircle className='mr-2 h-4 w-4' />,
      active: pathname === '/profile',
    },
    {
      href: '/profile/billing',
      label: 'Billing',
      icon: <CreditCard className='mr-2 h-4 w-4' />,
      active: pathname === '/profile/billing',
    },
    {
      href: '/profile/security',
      label: 'Security',
      icon: <Shield className='mr-2 h-4 w-4' />,
      active: pathname === '/profile/security',
    },
  ];

  return (
    <div className='flex w-full flex-col space-y-2'>
      {routes.map((route) => (
        <Button
          key={route.href}
          variant={route.active ? 'secondary' : 'ghost'}
          className={cn('justify-start', route.active ? 'bg-muted' : 'hover:bg-transparent')}
          asChild
        >
          <Link href={route.href}>
            {route.icon}
            {route.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
