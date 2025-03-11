import { PricingSection } from '@/components/pricing-section';
import { CreditsSection } from '@/components/credits-section';
import { polar } from '@/lib/polar';
import { Check, Zap, RefreshCw, CreditCard, HeartHandshake, HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Pricing - NextDay',
  description: 'Explore our pricing plans and credit packages for NextDay productivity tools.',
};

export default async function PricingPage() {
  const { result } = await polar.products.list({
    isArchived: false, // Only fetch products which are published
  });

  return (
    <div className='flex w-full flex-col items-center justify-center gap-16'>
      {/* Hero Section */}
      <section className='flex w-full flex-col items-center justify-center gap-8 pt-6 md:pt-16'>
        <div className='absolute inset-0 -z-10 h-[42rem] w-full bg-white dark:bg-neutral-950'>
          <div className='absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]'></div>
        </div>

        <div className='flex max-w-3xl flex-col items-center gap-4 text-center'>
          <div className='bg-primary/10 text-primary mx-auto mb-2 flex w-fit items-center gap-2 rounded-full px-4 py-1 text-sm font-medium'>
            <Zap className='h-4 w-4' />
            Simple, Transparent Pricing
          </div>
          <h1 className='text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl'>
            Plans for <span className='text-primary'>Every Workflow</span>
          </h1>
          <p className='text-muted-foreground max-w-[42rem] text-lg sm:text-xl'>
            Choose the perfect plan to boost your productivity with NextDay&apos;s powerful features. No hidden fees.
            Cancel anytime.
          </p>
        </div>
      </section>

      {/* Key benefits */}
      <section className='w-full max-w-5xl'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          {benefits.map((benefit, index) => (
            <Card key={index} className='bg-background border-border/60 border'>
              <CardContent className='flex flex-col items-center gap-3 pt-6 text-center'>
                <div className='bg-primary/10 rounded-full p-3'>{benefit.icon}</div>
                <h3 className='text-lg font-semibold'>{benefit.title}</h3>
                <p className='text-muted-foreground text-sm'>{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing plans */}
      <PricingSection products={result.items} />
      <CreditsSection products={result.items} />

      {/* Comparison Table */}
      <section className='mt-10 w-full max-w-5xl'>
        <div className='mb-10 text-center'>
          <h2 className='mb-4 text-3xl font-bold'>Compare All Features</h2>
          <p className='text-muted-foreground'>
            See what&apos;s included in each plan to make the right choice for your needs.
          </p>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='border-b'>
                <th className='px-4 py-4 text-left font-medium'>Feature</th>
                <th className='px-4 py-4 text-center font-medium'>Free</th>
                <th className='px-4 py-4 text-center font-medium'>Pro</th>
                <th className='px-4 py-4 text-center font-medium'>Team</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature, index) => (
                <tr key={index} className='border-b'>
                  <td className='px-4 py-4 text-sm'>{feature.name}</td>
                  {feature.tiers.map((available, i) => (
                    <td key={i} className='px-4 py-4 text-center'>
                      {available === true ? (
                        <Check className='text-primary mx-auto h-5 w-5' />
                      ) : available === false ? (
                        <div className='flex h-5 items-center justify-center'>
                          <div className='bg-muted-foreground/50 h-[2px] w-[10px] rounded-full' />
                        </div>
                      ) : (
                        <span className='text-muted-foreground text-sm'>{available}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className='w-full max-w-3xl'>
        <div className='mb-10 text-center'>
          <h2 className='mb-4 text-3xl font-bold'>Frequently Asked Questions</h2>
          <p className='text-muted-foreground'>
            Have questions about our pricing or features? Find answers to common questions below.
          </p>
        </div>

        <Accordion type='single' collapsible className='w-full'>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className='text-left'>{faq.question}</AccordionTrigger>
              <AccordionContent className='text-muted-foreground'>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA Section */}
      <section className='bg-primary w-full rounded-3xl px-6 py-12 md:px-12'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='text-primary-foreground text-3xl font-bold sm:text-4xl'>Ready to get started?</h2>
          <p className='text-primary-foreground/90 mx-auto mt-4 max-w-lg text-lg'>
            Choose the plan that&apos;s right for you and start boosting your productivity today.
          </p>
          <div className='mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <Button asChild size='lg' variant='secondary'>
              <Link href='/signin'>Start for free</Link>
            </Button>
            <Button asChild size='lg' variant='outline' className='text-background bg-foreground border-background'>
              <Link href='#pricing'>View all plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Support section */}
      <section className='mb-8 w-full max-w-2xl text-center'>
        <div className='text-muted-foreground flex items-center justify-center gap-2'>
          <HelpCircle className='h-4 w-4' />
          <p>
            Need help choosing the right plan?{' '}
            <Link href='/contact' className='text-primary hover:underline'>
              Contact our sales team
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

const benefits = [
  {
    title: 'Flexible Plans',
    description: 'Choose between monthly or annual billing with plans that grow with your needs',
    icon: <RefreshCw className='text-primary h-6 w-6' />,
  },
  {
    title: 'Simple Payment',
    description: 'Secure payments with all major credit cards accepted and transparent billing',
    icon: <CreditCard className='text-primary h-6 w-6' />,
  },
  {
    title: 'Premium Support',
    description: 'Get fast, reliable support from our dedicated team whenever you need help',
    icon: <HeartHandshake className='text-primary h-6 w-6' />,
  },
];

const comparisonFeatures = [
  {
    name: 'Todo Lists',
    tiers: ['3 lists', 'Unlimited', 'Unlimited'],
  },
  {
    name: 'Tasks per list',
    tiers: ['20 tasks', 'Unlimited', 'Unlimited'],
  },
  {
    name: 'Pomodoro Timer',
    tiers: [true, true, true],
  },
  {
    name: 'Focus Analytics',
    tiers: [false, true, true],
  },
  {
    name: 'Ambient Sound Library',
    tiers: ['5 tracks', 'All tracks', 'All tracks'],
  },
  {
    name: 'Custom Focus Zones',
    tiers: [false, true, true],
  },
  {
    name: 'Team Collaboration',
    tiers: [false, false, true],
  },
  {
    name: 'Priority Support',
    tiers: [false, true, true],
  },
  {
    name: 'Custom Integrations',
    tiers: [false, false, true],
  },
  {
    name: 'White Labeling',
    tiers: [false, false, true],
  },
];

const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards, including Visa, Mastercard, American Express, and Discover. We also support payment through PayPal for your convenience.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      "Yes, you can cancel your subscription at any time. When you cancel, you'll retain access to premium features until the end of your current billing period, with no additional charges afterward.",
  },
  {
    question: 'Is there a free trial available?',
    answer:
      'Yes, we offer a 14-day free trial on all our premium plans so you can try all features before committing to a subscription. No credit card required to start your trial.',
  },
  {
    question: 'What happens to my data if I downgrade my plan?',
    answer:
      "If you downgrade from a premium plan to a lower tier or free plan, you'll retain all your data. However, you may lose access to certain premium features, and if you exceed the limits of your new plan, some content might become read-only until you reduce usage.",
  },
  {
    question: 'Do you offer discounts for nonprofits or educational institutions?',
    answer:
      'Yes, we offer special pricing for nonprofits, educational institutions, and student users. Please contact our sales team for more information on our discount programs.',
  },
  {
    question: 'How secure is my payment information?',
    answer:
      'Your payment information is completely secure. We use industry-standard encryption and never store your full credit card details on our servers. All transactions are processed through secure payment gateways that comply with PCI DSS standards.',
  },
];
