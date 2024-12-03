import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ProfileForm } from '@/components/auth/profile-form';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth.api
    .getSession({
      headers: await headers(),
    })
    .catch(() => {
      redirect('/signin');
    });

  return <ProfileForm session={JSON.parse(JSON.stringify(session))} />;
}
