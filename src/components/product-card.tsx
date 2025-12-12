'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@polar-sh/sdk/models/components/product';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Check, Coins, Star, ZapIcon, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  calculateAnnualSavings,
  getFormattedPrice,
  getInterval,
  getPriceValue,
  getMonthlyPriceFromYearly,
} from '@/lib/product-utils';
import { checkout, useSession } from '@/lib/auth-client';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
  monthlyProduct?: Product;
}

export const ProductCard = ({ product, featured = false, monthlyProduct }: ProductCardProps) => {
  const price = getFormattedPrice(product);
  const interval = getInterval(product);
  const isCredits = !product.recurringInterval;

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data } = useSession();
  const user = data?.user || null;

  useEffect(() => {
    setMounted(true);
  }, []);

  const savings = (() => {
    if (product.recurringInterval === 'year' && monthlyProduct) {
      return calculateAnnualSavings(getPriceValue(product), getPriceValue(monthlyProduct));
    }
    return 0;
  })();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      await checkout({
        products: [product.id],
        fetchOptions: {
          onError(e: { error: { message: string } }) {
            throw new Error(e.error.message);
          },
        },
      });
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='h-full'>
      <Card
        className={cn(
          'group ring-offset-background focus-within:ring-ring relative flex h-full max-w-sm flex-col transition-all focus-within:ring-2 focus-within:ring-offset-2',
          isCredits &&
            'border-border hover:border-warning/50 hover:shadow-warning/5 transition-all duration-300 hover:shadow-lg',
          isCredits &&
            featured &&
            'border-warning/50 from-warning/5 to-warning/10 shadow-warning/10 bg-linear-to-br shadow-lg',
          !isCredits &&
            'border-border hover:border-primary/50 hover:shadow-primary/5 transition-all duration-300 hover:shadow-lg',
          !isCredits &&
            featured &&
            'border-primary/50 from-primary/5 to-primary/10 shadow-primary/10 bg-linear-to-br shadow-lg',
        )}
      >
        {featured && (
          <div className='absolute -top-4 left-1/2 z-10 -translate-x-1/2'>
            <Badge
              variant='default'
              className={cn(
                'text-primary-foreground flex items-center gap-1.5 px-3 py-1 text-sm shadow-md',
                isCredits ? 'bg-warning' : 'bg-primary',
              )}
            >
              <Star className='h-3.5 w-3.5 fill-current' />
              Most Popular
            </Badge>
          </div>
        )}

        {/* Limited offer banner for yearly plans */}
        {/* {product.recurringInterval === 'year' && (
          <div className='absolute top-3 -right-3 z-10'>
            <Badge
              variant='outline'
              className='bg-success/20 border-success/30 text-success rotate-12 transform px-3 py-1 text-xs font-semibold shadow-sm'
            >
              Limited Offer
            </Badge>
          </div>
        )} */}

        <CardHeader className='gap-4 pb-4'>
          <div className='flex items-center gap-2'>
            <div
              className={cn(
                'mr-1 rounded-full p-2',
                isCredits ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary',
              )}
            >
              {isCredits ? <Coins className='h-5 w-5' /> : <Calendar className='h-5 w-5' />}
            </div>
            <div className='flex flex-col'>
              <CardTitle className='text-xl font-bold tracking-tight'>{product.name}</CardTitle>
              {featured && (
                <span className='text-muted-foreground text-xs font-medium'>
                  {isCredits ? 'Best value for credits' : 'Most popular choice'}
                </span>
              )}
            </div>
          </div>
          <CardDescription className='min-h-10 text-sm leading-relaxed'>{product.description}</CardDescription>

          <div
            className={cn(
              'rounded-xl border p-5',
              isCredits ? 'bg-warning/5 border-warning/20' : 'bg-primary/5 border-primary/20',
            )}
          >
            {product.recurringInterval === 'year' && monthlyProduct ? (
              <>
                <div className='flex items-center justify-center gap-x-3'>
                  <div className='flex flex-col items-center'>
                    <div className='flex items-baseline justify-center'>
                      <span className={cn('text-3xl font-extrabold', isCredits ? 'text-warning' : 'text-primary')}>
                        {getMonthlyPriceFromYearly(product)}
                      </span>
                      <span className='text-muted-foreground ml-1 text-sm'>/month</span>
                    </div>
                    <div className='text-center'>
                      <div className='text-muted-foreground mt-1 text-xs'>Billed annually ({price}/year)</div>
                    </div>
                  </div>

                  {savings > 0 && (
                    <div className='bg-success/10 text-success flex flex-col items-center rounded-lg px-2 py-1 text-xs font-medium'>
                      <span className='text-sm font-bold'>${savings}</span>
                      <span>savings/year</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className='flex flex-col items-center justify-center'>
                <div className='flex items-baseline justify-center gap-x-1'>
                  <span className={cn('text-3xl font-extrabold', isCredits ? 'text-warning' : 'text-primary')}>
                    {price}
                  </span>
                  <span className='text-muted-foreground text-sm'>
                    {interval ? '/month' : isCredits ? ' one-time' : ''}
                  </span>
                </div>
                {isCredits ? (
                  <span className='text-muted-foreground mt-1 text-xs'>No subscription required</span>
                ) : product.recurringInterval === 'month' ? (
                  <span className='text-muted-foreground mt-1 text-xs'>Cancel anytime</span>
                ) : null}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className='flex flex-1 flex-col px-6'>
          <div className='bg-border mb-4 h-px w-full' />
          <h4 className='text-muted-foreground mb-3 text-sm font-medium tracking-wider uppercase'>
            {isCredits ? 'What You Get' : 'Features Included'}
          </h4>
          <ul className='mb-2 space-y-3.5'>
            {product.benefits.map((benefit) => (
              <li key={benefit.id} className='group/item flex items-start gap-x-3'>
                <div
                  className={cn(
                    'mt-0.5 shrink-0 rounded-full p-0.5',
                    isCredits
                      ? 'text-warning bg-warning/10 group-hover/item:bg-warning/20'
                      : 'text-primary bg-primary/10 group-hover/item:bg-primary/20',
                    'transition-colors duration-200',
                  )}
                >
                  <Check className='h-3.5 w-3.5' />
                </div>
                <span className='text-sm leading-relaxed'>{benefit.description}</span>
              </li>
            ))}
          </ul>

          {/* Money-back guarantee badge */}
          {/* <div className='text-muted-foreground mt-auto mb-2 flex items-center justify-center text-xs'>
            <Shield className='mr-1.5 h-3.5 w-3.5' />
            <span>30-day money-back guarantee</span>
          </div> */}
        </CardContent>

        <CardFooter className='px-6 pt-4 pb-6'>
          {user ? (
            <Button
              className={cn(
                'size-full p-0 text-sm font-medium transition-all duration-300',
                featured && (isCredits ? 'bg-warning hover:bg-warning/90' : 'bg-primary hover:bg-primary/90'),
              )}
              variant={featured ? 'default' : 'outline'}
              size='lg'
              disabled={!mounted || isLoading}
              onClick={handleCheckout}
            >
              {!mounted || isLoading ? (
                <div className='flex items-center justify-center py-3'>
                  <Loader2 className='animate-spin' />
                  <span className='ml-2'>{isLoading ? 'Processing...' : 'Loading...'}</span>
                </div>
              ) : (
                <span className='flex size-full items-center justify-center gap-2 py-3'>
                  {isCredits ? (
                    <>
                      <Coins />
                      Buy Now
                    </>
                  ) : (
                    <>
                      <ZapIcon />
                      Subscribe Now
                    </>
                  )}
                  <ArrowRight className='-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100' />
                </span>
              )}
            </Button>
          ) : (
            <Button
              className={cn(
                'size-full p-0 text-sm font-medium transition-all duration-300',
                featured && (isCredits ? 'bg-warning hover:bg-warning/90' : 'bg-primary hover:bg-primary/90'),
              )}
              variant={featured ? 'default' : 'outline'}
              size='lg'
              asChild
            >
              <Link href='/login'>
                <span className='flex size-full items-center justify-center gap-2 py-3'>
                  {isCredits ? (
                    <>
                      <Coins />
                      Buy Now
                    </>
                  ) : (
                    <>
                      <ZapIcon />
                      Subscribe Now
                    </>
                  )}
                  <ArrowRight className='-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100' />
                </span>
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
