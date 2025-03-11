import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Session } from '@/lib/auth-client';

interface AuthButtonProps {
  session: Session | null;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function AuthButton({ session, size = 'lg', className }: AuthButtonProps) {
  const combinedClassName = `gap-2 ${className || ''}`;

  if (session) {
    return (
      <Button asChild size={size} className={combinedClassName}>
        <Link href='/todos'>
          Go to ToDos <ArrowRight className='h-4 w-4' />
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild size={size} className={combinedClassName}>
      <Link href='/signin'>
        Get Started <ArrowRight className='h-4 w-4' />
      </Link>
    </Button>
  );
}
