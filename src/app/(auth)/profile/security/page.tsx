import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { SecurityForm } from '@/components/auth/security-form';
import { redirect } from 'next/navigation';

export default async function SecurityPage() {
  const [session, activeSessions] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listSessions({
      headers: await headers(),
    }),
  ]).catch(() => {
    redirect('/signin');
  });

  return (
    <SecurityForm
      session={JSON.parse(JSON.stringify(session))}
      activeSessions={JSON.parse(JSON.stringify(activeSessions))}
    />
  );
}
