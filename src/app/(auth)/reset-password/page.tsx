import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { redirect } from 'next/navigation';

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  if (!searchParams.token) {
    redirect('/signin');
  }

  return (
    <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
      <div className='flex flex-col space-y-2 text-center'>
        <h1 className='text-2xl font-semibold tracking-tight'>Reset Password</h1>
        <p className='text-sm text-muted-foreground'>Enter your new password below</p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
