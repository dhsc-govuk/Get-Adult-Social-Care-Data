import { betterAuth, boolean } from 'better-auth';
import { createAuthMiddleware } from "better-auth/api";
import Database from 'better-sqlite3';
import { B2CPlugin } from './authPlugins';
import { nextCookies } from 'better-auth/next-js';
import logger from '@/utils/logger';

export const auth = betterAuth({
  database: new Database('./gascd_users_sqlite.db'),
  //emailAndPassword: {
  //  enabled: true,
  //},
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
        default: false,
      },
    },
  },
  plugins: [
    B2CPlugin(),
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
