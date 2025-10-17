import { betterAuth } from 'better-auth';
import Database from 'better-sqlite3';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
  database: new Database('./sqlite.db'),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()], // make sure this is the last plugin in the array
});
