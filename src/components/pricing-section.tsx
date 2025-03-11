'use client';

import { Product } from '@polar-sh/sdk/models/components/product';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductCard } from '@/components/product-card';
import { getPriceValue, calculateSavingsPercentage } from '@/lib/product-utils';
import { Calendar, Check, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PricingSectionProps {
  products: Product[];
}

export function PricingSection({ products }: PricingSectionProps) {
  // Filter subscription products and sort by price
  const subscriptionProducts = products
    .filter((p) => p.recurringInterval)
    .sort((a, b) => getPriceValue(a) - getPriceValue(b));

  if (subscriptionProducts.length === 0) return null;

  // Filter plans by interval
  const monthlyPlans = subscriptionProducts
    .filter((p) => p.recurringInterval === 'month')
    .sort((a, b) => getPriceValue(a) - getPriceValue(b));

  const yearlyPlans = subscriptionProducts
    .filter((p) => p.recurringInterval === 'year')
    .sort((a, b) => getPriceValue(a) - getPriceValue(b));

  // Calculate savings percentage using first monthly and yearly plans
  const savingsPercentage =
    yearlyPlans.length > 0 && monthlyPlans.length > 0
      ? calculateSavingsPercentage(getPriceValue(yearlyPlans[0]), getPriceValue(monthlyPlans[0]))
      : 0;

  return (
    <section id='pricing' className='w-full space-y-8'>
      <div className='space-y-3 text-center'>
        <div className='bg-primary/10 text-primary mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium'>
          <Calendar className='h-4 w-4' />
          Subscription Plans
        </div>
        <h2 className='text-3xl font-bold tracking-tight sm:text-4xl'>Find the perfect plan for your workflow</h2>
        <p className='text-muted-foreground mx-auto max-w-xl text-base'>
          Choose a plan that works best for you with flexible options and premium features to enhance your productivity.
        </p>
      </div>

      <Tabs defaultValue='monthly' className='w-full pt-4'>
        <div className='flex flex-col items-center'>
          <TabsList className='mx-auto mb-8 grid w-full max-w-[400px] grid-cols-2 p-1'>
            <TabsTrigger value='monthly'>Monthly</TabsTrigger>
            <TabsTrigger value='yearly' className='flex items-center justify-center gap-x-2'>
              Yearly
              {savingsPercentage > 0 && (
                <Badge
                  variant='outline'
                  className='bg-success/20 text-success border-success/30 ml-1 px-2 py-0 text-xs font-medium'
                >
                  Save {savingsPercentage}%
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='monthly' className='mt-2 space-y-6'>
          <div className='mb-6 text-center'>
            <h3 className='text-xl font-semibold tracking-tight'>Monthly Billing</h3>
            <p className='text-muted-foreground mt-1 text-sm'>Perfect for short-term commitments</p>
          </div>
          <div className='grid grid-cols-1 items-start gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {monthlyPlans.map((product, index) => (
              <ProductCard key={product.id} product={product} featured={index === 1} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value='yearly' className='mt-2 space-y-6'>
          <div className='mb-6 text-center'>
            <h3 className='text-xl font-semibold tracking-tight'>Yearly Billing</h3>
            <p className='text-muted-foreground mt-1 flex flex-row items-center justify-center gap-2 text-sm'>
              Save more with yearly subscriptions
              <Sparkles className='h-3.5 w-3.5 text-yellow-500' />
              Best value
            </p>
          </div>
          <div className='grid grid-cols-1 items-start gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {yearlyPlans.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                featured={index === 1}
                monthlyProduct={monthlyPlans[index]}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className='mt-8 flex items-center justify-center gap-2 text-center text-sm'>
        <Check className='text-success h-4 w-4' />
        <span className='text-muted-foreground'>All plans include a 14-day free trial. No credit card required.</span>
      </div>
    </section>
  );
}
