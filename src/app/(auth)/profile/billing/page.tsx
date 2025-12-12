import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { CreditCard, Calendar, Globe, AlertTriangle, RefreshCw, Clock, Sparkles, CheckCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function BillingPage() {
  const state = await auth.api
    .state({
      headers: await headers(),
    })
    .catch(() => {
      redirect('/signin');
    });

  // Check if user has an active subscription
  const hasActiveSubscription = state.activeSubscriptions && state.activeSubscriptions.length > 0;
  const subscription = hasActiveSubscription ? state.activeSubscriptions[0] : null;

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='from-primary/10 to-primary/5 bg-gradient-to-r'>
        <CardTitle className='flex items-center'>
          <CreditCard className='mr-2 h-5 w-5' />
          Subscription Management
        </CardTitle>
        <CardDescription>Manage your subscription and payment information</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6 pt-6'>
        {!subscription ? (
          <div className='space-y-4'>
            <Alert>
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>No Active Subscription</AlertTitle>
              <AlertDescription>
                You don&apos;t currently have a premium subscription. Upgrade to access premium features.
              </AlertDescription>
            </Alert>

            <div className='flex justify-center'>
              <Button asChild size='lg' className='mt-2'>
                <Link href='/pricing'>
                  <Sparkles className='mr-2 h-4 w-4' />
                  Upgrade to Premium
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            {/* Subscription Status Badge */}
            <div className='flex flex-col items-center justify-center sm:flex-row sm:justify-between'>
              <div className='flex flex-col items-center gap-2 sm:flex-row sm:gap-4'>
                <Badge
                  variant={subscription.status === 'active' ? 'default' : 'outline'}
                  className='px-3 py-1 text-sm font-medium capitalize'
                >
                  {subscription.status === 'active' ? <CheckCircle /> : <Clock />}
                  {subscription.status}
                </Badge>

                {subscription.cancelAtPeriodEnd && (
                  <Badge variant='destructive' className='px-3 py-1 text-sm font-medium'>
                    <AlertTriangle />
                    Cancels Soon
                  </Badge>
                )}
              </div>

              <div className='text-muted-foreground mt-2 flex items-center text-sm sm:mt-0'>
                <Clock className='mr-1.5 h-4 w-4' />
                Member since {format(new Date(subscription.startedAt!), 'MMMM d, yyyy')}
              </div>
            </div>

            <Separator />

            {/* Plan and Billing Details */}
            <div className='grid gap-6 md:grid-cols-2'>
              <div>
                <h3 className='mb-3 flex items-center text-sm font-medium'>
                  <span className='bg-primary/10 mr-2 rounded-full p-1'>
                    <CreditCard className='text-primary h-4 w-4' />
                  </span>
                  Current Plan
                </h3>
                <div className='bg-card/50 rounded-lg border p-4 backdrop-blur-sm'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <span className='text-2xl font-medium'>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: subscription.currency || 'USD',
                        }).format((subscription.amount || 0) / 100)}
                      </span>
                      <span className='text-muted-foreground ml-1 text-sm'>/{subscription.recurringInterval}</span>
                    </div>

                    {subscription.cancelAtPeriodEnd ? (
                      <AlertTriangle className='text-destructive h-5 w-5' />
                    ) : (
                      <RefreshCw className='text-success h-5 w-5' />
                    )}
                  </div>

                  <div className='mt-4 space-y-2'>
                    <div className='text-muted-foreground flex items-center text-sm'>
                      <Calendar className='mr-2 h-4 w-4' />
                      Period: {format(new Date(subscription.currentPeriodStart!), 'MMM d')} —{' '}
                      {format(new Date(subscription.currentPeriodEnd!), 'MMM d, yyyy')}
                    </div>

                    {subscription.cancelAtPeriodEnd ? (
                      <p className='text-destructive text-sm font-medium'>
                        Your subscription will end on {format(new Date(subscription.currentPeriodEnd!), 'MMMM d, yyyy')}
                      </p>
                    ) : (
                      <p className='text-muted-foreground text-sm'>
                        Next billing: {format(new Date(subscription.currentPeriodEnd!), 'MMMM d, yyyy')}
                        <span className='ml-1 text-xs'>
                          (in {formatDistanceToNow(new Date(subscription.currentPeriodEnd!))})
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className='mb-3 flex items-center text-sm font-medium'>
                  <span className='bg-primary/10 mr-2 rounded-full p-1'>
                    <Globe className='text-primary h-4 w-4' />
                  </span>
                  Billing Information
                </h3>
                <div className='bg-card/50 space-y-3 rounded-lg border p-4 backdrop-blur-sm'>
                  <div>
                    <span className='text-muted-foreground text-xs'>Account</span>
                    <p className='font-medium'>{state.email}</p>
                  </div>

                  {state.billingAddress?.country && (
                    <div>
                      <span className='text-muted-foreground text-xs'>Billing Country</span>
                      <div className='flex items-center'>
                        <Globe className='mr-2 h-4 w-4' />
                        <span>{state.billingAddress.country}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className='text-muted-foreground text-xs'>Subscription ID</span>
                    <p className='truncate font-mono text-xs select-all'>{subscription.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {subscription.cancelAtPeriodEnd && (
              <Alert variant='destructive' className='mt-4'>
                <AlertTriangle className='h-4 w-4' />
                <AlertTitle>Subscription Cancelled</AlertTitle>
                <AlertDescription>
                  Your subscription will end on {format(new Date(subscription.currentPeriodEnd!), 'MMMM d, yyyy')}. You
                  can reactivate your subscription before this date to maintain premium access.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className='bg-muted/40 flex flex-col items-start space-y-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
        <p className='text-muted-foreground text-sm'>Need to update payment details or manage your subscription?</p>
        <Button asChild>
          <Link href='/api/auth/portal'>
            <CreditCard className='mr-2 h-4 w-4' />
            Open Customer Portal
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
