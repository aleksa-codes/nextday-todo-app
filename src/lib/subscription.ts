import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getURL } from '@/lib/utils';
import { type CustomerState } from '@polar-sh/sdk/models/components/customerstate';

export async function getSubscriptionState(): Promise<CustomerState | null> {
  try {
    const response = await fetch(`${getURL()}/api/auth/state`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: (await headers()).get('cookie') || '',
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch subscription state:', error);
    return null;
  }
}

export async function requireSubscription(): Promise<CustomerState> {
  const state = await getSubscriptionState();

  if (!state || !state.activeSubscriptions?.length) {
    redirect('/pricing');
  }

  return state;
}
