import { createAuthClient } from 'better-auth/react';
import {
  genericOAuthClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import type { auth } from './auth';

export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL!, // Optional if the API base URL matches the frontend
  plugins: [genericOAuthClient(), inferAdditionalFields<typeof auth>()],
});

export const { signIn, signOut, useSession } = authClient;

// Support for customisations to the session type
// https://www.better-auth.com/docs/concepts/typescript#inferring-types
export type Session = typeof authClient.$Infer.Session;
