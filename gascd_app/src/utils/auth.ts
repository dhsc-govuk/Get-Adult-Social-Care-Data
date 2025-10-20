import { betterAuth } from 'better-auth';
import Database from 'better-sqlite3';
import { B2CPlugin } from './authPlugins';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
  database: new Database('./sqlite.db'),
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
    },
  },
  plugins: [
    B2CPlugin(),
    nextCookies(), // make sure this is the last plugin in the array
  ],
});
