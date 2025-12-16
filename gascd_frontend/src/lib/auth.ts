import { betterAuth, boolean } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { B2CPlugin } from './authPlugins';
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
        input: true,
      },
      selectedLocationDisplayName: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },
  plugins: [
    admin(),
    B2CPlugin(),
    // https://www.better-auth.com/docs/integrations/next#server-action-cookies
    nextCookies(), // make sure this is the last plugin in the array
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.context.newSession) {
        logger.info('User logged in success', {
          userid: ctx.context.newSession.user.id,
          primaryLocationId: ctx.context.newSession.user.locationId,
          primaryLocationType: ctx.context.newSession.user.locationType,
          activeLocationId: ctx.context.newSession.user.selectedLocationId,
        });
      }
    }),
  },
});
