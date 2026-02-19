import { betterAuth, boolean } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { getOAuthConfig } from './authPlugins';
import { nextCookies } from 'better-auth/next-js';
import logger from '@/utils/logger';
import { msdialect } from './authDatabase';
import { admin, lastLoginMethod } from 'better-auth/plugins';
import { Kysely } from 'kysely';

// Export a connection to the user db for usage elsewhere
// (re-uses the same connection pool set up in the dialect)
export const authDB = new Kysely<any>({ dialect: msdialect });

export const auth = betterAuth({
  rateLimit: {
    enabled: process.env.E2E_TESTING_MODE !== 'true',
  },
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
      // Name they were registered with (the default better auth field is overriden on oauth login)
      registeredName: {
        type: 'string',
        required: false,
        input: false,
      },
      // Where this user was created/imported from
      source: {
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
        input: false,
      },
      selectedLocationDisplayName: {
        type: 'string',
        required: false,
        input: false,
      },
      selectedLocationCategory: {
        type: 'string',
        required: false,
        input: false,
      },
      // Unique id for analytics tracking
      // note - this is currently set during user import, not inside the app itself
      analyticsId: {
        type: 'string',
        required: false,
        input: false,
      },
      marketingConsent: {
        type: 'boolean',
        required: false,
        // This can be set by users
        input: true,
      },
      marketingConsentDate: {
        type: 'date',
        required: false,
        // This can be set by users
        input: true,
      },
    },
  },
  plugins: [
    admin(),
    lastLoginMethod({
      storeInDatabase: true,
    }),
    getOAuthConfig(),
    // https://www.better-auth.com/docs/integrations/next#server-action-cookies
    nextCookies(), // make sure this is the last plugin in the array
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path.startsWith('/sign-in/') ||
        ctx.path.startsWith('/oauth2/callback/')
      ) {
        if (ctx.context.newSession) {
          logger.info('User logged in success', {
            userid: ctx.context.newSession.user.id,
            primaryLocationId: ctx.context.newSession.user.locationId,
            primaryLocationType: ctx.context.newSession.user.locationType,
            activeLocationId: ctx.context.newSession.user.selectedLocationId,
          });
        }
      }
      if (ctx.path == '/error') {
        const error = ctx.query?.error;
        logger.error('Auth error', {
          error: ctx.query?.error,
          description: ctx.query?.error_description,
        });
        if (error === 'signup_disabled') {
          // This occurs for valid oauth flows which don't match existing users in the db
          throw ctx.redirect('/access-denied');
        }
      }
    }),
  },
});

export type User = typeof auth.$Infer.Session.user;
