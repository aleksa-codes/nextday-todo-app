'use client';

import { Product } from '@polar-sh/sdk/models/components/product';
import { ProductCard } from '@/components/product-card';
import { getPriceValue } from '@/lib/product-utils';
import { Coins, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CreditsSectionProps {
  products: Product[];
}

export function CreditsSection({ products }: CreditsSectionProps) {
  const creditProducts = products
    .filter((p) => !p.recurringInterval)
    .sort((a, b) => getPriceValue(a) - getPriceValue(b));

  if (creditProducts.length === 0) return null;

  return (
    <section className='w-full space-y-8'>
      <div className='space-y-3 text-center'>
        <div className='bg-warning/10 text-warning mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium'>
          <Coins className='h-4 w-4' />
          Credit Packages
        </div>
        <h2 className='text-3xl font-bold tracking-tight sm:text-4xl'>Pay only for what you use</h2>
        <p className='text-muted-foreground mx-auto max-w-xl text-base'>
          Purchase credits to use our premium features on-demand without a recurring commitment. Perfect for occasional
          users or those who need flexibility.
        </p>
      </div>

      <div className='grid grid-cols-1 items-start gap-8 pt-4 sm:grid-cols-2 lg:grid-cols-3'>
        {creditProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} featured={index === 1} />
        ))}
      </div>

      <div className='bg-muted/50 mx-auto mt-12 max-w-3xl rounded-xl p-6'>
        <div className='flex flex-col items-center gap-6 md:flex-row'>
          <div className='flex-1'>
            <h3 className='mb-2 flex items-center gap-2 text-lg font-semibold'>
              <CreditCard className='text-primary h-5 w-5' />
              Need a custom credit package?
            </h3>
            <p className='text-muted-foreground text-sm'>
              For teams or enterprises requiring custom credit packages, we offer tailored solutions.
            </p>
          </div>
          <Button asChild variant='outline' className='shrink-0'>
            <Link href='/contact' className='flex items-center gap-1'>
              Contact Sales
              <ArrowRight className='ml-1 h-3.5 w-3.5' />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
