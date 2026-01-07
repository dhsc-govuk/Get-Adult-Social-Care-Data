import { betterAuth, boolean } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { getOAuthConfig } from './authPlugins';
import { nextCookies } from 'better-auth/next-js';
import logger from '@/utils/logger';
import { msdialect } from './authDatabase';
import { admin } from 'better-auth/plugins';

export const auth = betterAuth({
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
    expiresIn: 60 * 60, // 1 hour
    updateAge: 60 * 15, // 15 mins (every 15 mins the session expiration is updated)
  },
  database: {
    dialect: msdialect,
    type: 'mssql',
  },
  logger: {
    log: (level, message, ...args) => {
      // Send logs to our winston logger
      logger.log(level, '(Better Auth): ' + message, ...args);
    },
  },
  emailAndPassword: {
    enabled: process.env.LOCAL_AUTH == 'true',
  },
  user: {
    additionalFields: {
      // The email address we think they should be using
      // (to be checked against the one provided by an external IdP)
      registeredEmail: {
        type: 'string',
        required: false,
        input: false,
      },
      locationType: {
        type: 'string',
        required: false,
        input: false,
      },
      locationId: {
        type: 'string',
        required: false,
        input: false,
      },
      smartInsights: {
        type: 'boolean',
        required: false,
        input: false,
      },
      selectedLocationId: {
        type: 'string',
        required: false,
        // Can be set by the user
        input: true,
      },
      selectedLocationDisplayName: {
        type: 'string',
        required: false,
        // Can be set by the user
        input: true,
      },
    },
  },
  plugins: [
    admin(),
    getOAuthConfig(),
    // https://www.better-auth.com/docs/integrations/next#server-action-cookies
    nextCookies(), // make sure this is the last plugin in the array
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.context.newSession) {
        logger.info('User logged in success', {
          userid: ctx.context.newSession.user.id,
        });
      }
      if (ctx.path == '/error') {
        logger.error('Auth error', {
          error: ctx.query?.error,
          description: ctx.query?.error_description,
        });
      }
    }),
  },
});

export type User = typeof auth.$Infer.Session.user;
