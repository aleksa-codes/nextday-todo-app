import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, CreditCard, Calendar, Check, Globe } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const metadata = {
  title: 'Premium Features | NextDay',
  description: 'Exclusive premium features available to subscribers only',
};

export default async function PremiumFeaturesPage() {
  const state = await auth.api
    .polarCustomerState({
      headers: await headers(),
    })
    .catch(() => {
      redirect('/signin');
    });

  // Check if user has an active subscription
  const hasActiveSubscription = state.activeSubscriptions && state.activeSubscriptions.length > 0;
  const subscription = hasActiveSubscription ? state.activeSubscriptions[0] : null;

  if (!subscription) {
    redirect('/pricing');
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: subscription.currency!,
  }).format(subscription.amount! / 100);

  const currentPeriodStart = new Date(subscription.currentPeriodStart!);
  const currentPeriodEnd = new Date(subscription.currentPeriodEnd!);
  const subscriptionStarted = new Date(subscription.startedAt!);

  const formattedStartDate = format(currentPeriodStart, 'MMMM d, yyyy');
  const formattedEndDate = format(currentPeriodEnd, 'MMMM d, yyyy');
  const memberSince = format(subscriptionStarted, 'MMMM d, yyyy');
  const timeRemaining = formatDistanceToNow(currentPeriodEnd);

  return (
    <div className='container max-w-4xl py-8'>
      <div className='mb-8 flex flex-col items-center justify-center text-center'>
        <div className='bg-primary/10 mb-4 rounded-full p-3'>
          <Crown className='text-primary h-8 w-8' />
        </div>
        <h1 className='text-3xl font-bold tracking-tight md:text-4xl'>Premium Account</h1>
        <p className='text-muted-foreground mt-2 max-w-[85%]'>
          Thank you for your support! Here&apos;s your subscription information.
        </p>
      </div>

      <div className='mb-8 flex flex-col items-center'>
        <h2 className='text-xl font-semibold'>{state.name}</h2>
        <p className='text-muted-foreground'>{state.email}</p>
        <Badge variant='outline' className='mt-2'>
          Premium Member
        </Badge>
      </div>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <CreditCard className='mr-2 h-5 w-5' />
            Subscription Details
          </CardTitle>
          <CardDescription>Your current plan information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-medium'>Subscription Status</h3>
                <div className='mt-1 flex items-center'>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'outline'} className='capitalize'>
                    {subscription.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className='font-medium'>Plan</h3>
                <p className='text-muted-foreground'>
                  {formattedAmount}/{subscription.recurringInterval}
                </p>
              </div>

              <div>
                <h3 className='font-medium'>Member Since</h3>
                <p className='text-muted-foreground'>{memberSince}</p>
              </div>

              {state.billingAddress?.country && (
                <div>
                  <h3 className='font-medium'>Billing Country</h3>
                  <div className='mt-1 flex items-center'>
                    <Globe className='text-muted-foreground mr-2 h-4 w-4' />
                    <span className='text-muted-foreground'>{state.billingAddress.country}</span>
                  </div>
                </div>
              )}
            </div>

            <div className='space-y-4'>
              <div>
                <h3 className='font-medium'>Current Period</h3>
                <p className='text-muted-foreground'>
                  {formattedStartDate} - {formattedEndDate}
                </p>
              </div>

              <div>
                <h3 className='font-medium'>Next Billing Date</h3>
                <div className='mt-1 flex items-center'>
                  <Calendar className='text-muted-foreground mr-2 h-4 w-4' />
                  <span className='text-muted-foreground'>
                    {formattedEndDate} ({timeRemaining} remaining)
                  </span>
                </div>
              </div>

              <div>
                <h3 className='font-medium'>Auto-Renewal</h3>
                <div className='mt-1 flex items-center'>
                  <Badge variant={subscription.cancelAtPeriodEnd ? 'destructive' : 'outline'}>
                    {subscription.cancelAtPeriodEnd ? 'Off' : 'On'}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className='font-medium'>Subscription ID</h3>
                <p className='text-muted-foreground font-mono text-xs'>{subscription.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Check className='mr-2 h-5 w-5' />
            Premium Benefits
          </CardTitle>
          <CardDescription>Features included in your subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='space-y-2'>
            <li className='flex items-center'>
              <Check className='mr-2 h-4 w-4 text-green-500' />
              <span>Advanced task management with unlimited todo lists</span>
            </li>
            <li className='flex items-center'>
              <Check className='mr-2 h-4 w-4 text-green-500' />
              <span>Premium music library with ambient sounds and lo-fi beats</span>
            </li>
            <li className='flex items-center'>
              <Check className='mr-2 h-4 w-4 text-green-500' />
              <span>Advanced analytics and productivity reports</span>
            </li>
            <li className='flex items-center'>
              <Check className='mr-2 h-4 w-4 text-green-500' />
              <span>Calendar integration with your favorite services</span>
            </li>
            <li className='flex items-center'>
              <Check className='mr-2 h-4 w-4 text-green-500' />
              <span>Priority customer support</span>
            </li>
            <li className='flex items-center'>
              <Check className='mr-2 h-4 w-4 text-green-500' />
              <span>Early access to new features</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
