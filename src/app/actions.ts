'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateCache(route: string, mode: 'page' | 'layout' = 'page') {
  revalidatePath(route, mode);
}
