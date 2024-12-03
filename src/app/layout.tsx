import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/navbar';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NextDay',
  description: 'Next.js Todo App with BetterAuth',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={cn(inter.className, 'flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20')}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          <Navbar />
          <main className='container mx-auto flex flex-1 flex-col items-center justify-center py-8'>{children}</main>
          <Toaster position='bottom-right' richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
