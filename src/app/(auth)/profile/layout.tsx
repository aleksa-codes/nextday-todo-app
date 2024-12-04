import { ProfileNav } from '@/components/auth/profile-nav';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className='size-full flex-grow'>
      <div className='flex flex-col gap-6 md:flex-row'>
        <aside className='w-full border-b pb-6 md:w-64 md:border-b-0 md:border-r md:pb-0 md:pr-6'>
          <ProfileNav />
        </aside>
        <main className='flex-1'>{children}</main>
      </div>
    </div>
  );
}
