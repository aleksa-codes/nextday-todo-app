import { SignInForm } from '@/components/auth/signin-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignInPage() {
  return (
    <Card className='w-80 sm:w-96'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-center text-2xl'>Welcome back</CardTitle>
        <CardDescription className='text-center'>Enter your credentials to sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
    </Card>
  );
}
