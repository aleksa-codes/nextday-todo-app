'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User2, Shield } from 'lucide-react';

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/profile',
    icon: User2,
  },
  {
    title: 'Security',
    href: '/profile/security',
    icon: Shield,
  },
];

export function ProfileNav() {
  const pathname = usePathname();

  return (
    <nav className='flex flex-col gap-2'>
      {sidebarNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            pathname === item.href ? 'bg-secondary text-secondary-foreground' : 'hover:bg-secondary/50',
          )}
        >
          <item.icon className='h-4 w-4' />
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
