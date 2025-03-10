import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { Navbar } from '@/components/navbar';
import TopLoader from '@/components/top-loader';
import Providers from '@/app/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NextDay',
  description: 'Next.js Todo App with BetterAuth',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <TopLoader />
      </head>
      <body className={cn(inter.className, 'from-background to-muted/20 flex min-h-screen flex-col bg-gradient-to-b')}>
        <Providers>
          <Navbar />
          <main className='container flex flex-1 flex-col items-center justify-center py-8'>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
