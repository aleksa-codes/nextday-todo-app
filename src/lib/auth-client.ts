import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import { toast } from 'sonner';
import { getURL } from '@/lib/utils';
import type { auth } from '@/lib/auth';

export const authClient = createAuthClient({
  baseURL: getURL(),
  fetchOptions: {
    // mode: 'no-cors',
    onError(e) {
      if (e.error.status === 429) {
        toast.error('Too many requests. Please try again later.');
      }
    },
  },
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signOut, signUp, useSession } = authClient;

export type Session = typeof authClient.$Infer.Session;
