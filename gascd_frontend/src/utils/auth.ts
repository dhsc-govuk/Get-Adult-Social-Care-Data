import { betterAuth, boolean } from 'better-auth';
import { createAuthMiddleware } from "better-auth/api";
import Database from 'better-sqlite3';
import { B2CPlugin } from './authPlugins';
import { nextCookies } from 'better-auth/next-js';
import logger from '@/utils/logger';
import { msdialect } from './authDatabase';

export const auth = betterAuth({
  //database: new Database('./gascd_users_sqlite.db'),
  database: {
    dialect: msdialect,
    type: "mssql",
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
    },
  },
  plugins: [
    B2CPlugin(),
    // https://www.better-auth.com/docs/integrations/next#server-action-cookies
    nextCookies(), // make sure this is the last plugin in the array
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if(ctx.context.newSession) {
        logger.info('User logged in success', {
          userid: ctx.context.newSession.user.id
        });
      }
    }),
  },
});
