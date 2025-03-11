import { Checkout } from '@polar-sh/nextjs';
import { getURL } from '@/lib/utils';

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  successUrl: `${getURL()}/confirmation`,
  server: 'sandbox', // Use this option if you're using the sandbox environment - else use 'production' or omit the parameter
});
