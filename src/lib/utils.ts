import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_APP_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000';
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  // url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  // Make sure to exclude trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
  return url;
};
