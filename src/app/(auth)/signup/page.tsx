import { SignUpForm } from '@/components/auth/signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignUpPage() {
  return (
    <Card className='w-80 sm:w-96'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-center text-2xl'>Create an account</CardTitle>
        <CardDescription className='text-center'>Enter your information below to create your account</CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  );
}
