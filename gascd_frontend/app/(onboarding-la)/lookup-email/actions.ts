'use server';
import { isAcceptableEmail } from '@/lib/domain-check';

/**
 * Pre-check used by the lookup page before starting One Login. It is advisory
 * only: eligibility is enforced when One Login returns the verified email
 * (see src/lib/la-signup.ts). No data is written here.
 */
export async function checkLaEmailDomain(email: unknown): Promise<boolean> {
  return isAcceptableEmail(email) !== null;
}
