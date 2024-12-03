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

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className='size-full flex-grow'>
      <div className='flex flex-col gap-6 md:flex-row'>
        <aside className='w-full border-b pb-6 md:w-64 md:border-b-0 md:border-r md:pb-0 md:pr-6'>
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
        </aside>
        <main className='flex-1'>{children}</main>
      </div>
    </div>
  );
}
