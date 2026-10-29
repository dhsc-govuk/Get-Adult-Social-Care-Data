import { createAuthClient } from 'better-auth/react';
import {
  genericOAuthClient,
  inferAdditionalFields,
  lastLoginMethodClient,
} from 'better-auth/client/plugins';
import type { auth } from './auth';

export const authClient = createAuthClient({
  basePath: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/api/auth`,
  plugins: [
    lastLoginMethodClient(),
    genericOAuthClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});

export const { signIn, signOut, useSession } = authClient;

// Support for customisations to the session type
// https://www.better-auth.com/docs/concepts/typescript#inferring-types
export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
