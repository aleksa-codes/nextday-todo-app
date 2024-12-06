import { createAuthClient } from 'better-auth/react';
import { toast } from 'sonner';
import { getURL } from '@/lib/utils';

export const authClient = createAuthClient({
  baseURL: getURL(),
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error('Too many requests. Please try again later.');
      }
    },
  },
});

export const { signIn, signOut, signUp, useSession } = authClient;

export type Session = typeof authClient.$Infer.Session;
