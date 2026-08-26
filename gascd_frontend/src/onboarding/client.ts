'use client';

import { withBasePath } from '@/lib/basePath';
import type { OnboardingResult } from './types';

const GENERIC_ERROR =
  'Sorry, there is a problem with the service. Please try again later.';

// Posts as JSON so the App Gateway WAF does not parse the body into ARGS.
// Raw fetch is not base-path aware, unlike next/link and router.push.
export async function submitOnboarding<T>(
  path: string,
  body: unknown
): Promise<OnboardingResult<T>> {
  try {
    const response = await fetch(withBasePath(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { type: 'error', description: GENERIC_ERROR };
    }

    return (await response.json()) as OnboardingResult<T>;
  } catch {
    return { type: 'error', description: GENERIC_ERROR };
  }
}
