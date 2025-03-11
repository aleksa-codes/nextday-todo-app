import { Webhooks } from '@polar-sh/nextjs';
import { polar } from '@/lib/polar';
import { db } from '@/db';
import { users } from '@/db/schema/auth';
import { eq, sql } from 'drizzle-orm';

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  // Triggered when a new checkout is initiated by a customer
  onCheckoutCreated: async (payload) => {
    console.log('New checkout session created:', payload);
  },

  // Triggered when checkout status changes (e.g., from pending to confirmed)
  onCheckoutUpdated: async (payload) => {
    console.log('Checkout status updated:', payload);
  },

  // Triggered when a new order is successfully created
  onOrderCreated: async (payload) => {
    console.log('New order created:', payload);
    try {
      const product = await polar.products.get({
        id: payload.data.productId,
      });

      const userId = payload.data.customer.externalId;

      if (!userId) {
        console.error('No userId found in metadata');
        return;
      }

      const creditsToAdd = product.metadata.credits as number | 0;

      if (!creditsToAdd || isNaN(creditsToAdd)) {
        console.error('Invalid credits value in product metadata:', product.metadata);
        return;
      }

      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${creditsToAdd}`,
        })
        .where(eq(users.id, userId));

      console.log(`Added ${creditsToAdd} credits to user ${userId}`);
    } catch (error) {
      console.error('Error processing order:', error);
    }
  },

  // Triggered when a new subscription is initially created
  onSubscriptionCreated: async (payload) => {
    console.log('New subscription created:', payload);
  },

  // Triggered when subscription details are modified
  onSubscriptionUpdated: async (payload) => {
    console.log('Subscription details updated:', payload);
  },

  // Triggered when subscription becomes active after successful payment
  onSubscriptionActive: async (payload) => {
    console.log('Subscription is now active:', payload);
  },

  // Triggered when user manually cancels their subscription
  onSubscriptionCanceled: async (payload) => {
    console.log('Subscription canceled by user:', payload);
  },

  // Triggered when subscription expires or is automatically revoked
  onSubscriptionRevoked: async (payload) => {
    console.log('Subscription access revoked:', payload);
  },
});
