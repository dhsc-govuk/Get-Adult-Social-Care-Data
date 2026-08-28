import 'dotenv/config';
import { Kysely, MssqlDialect, sql } from 'kysely';
import * as Tedious from 'tedious';
import * as Tarn from 'tarn';

// Applies User DB DDL that the Better Auth CLI cannot express - currently the
// per-user unique index on comparator group names. Every statement here must
// be idempotent: this runs on every deploy, chained after `better-auth
// migrate` in the db:migrate / db:migrate:ci npm scripts, so the pipeline's
// existing Migrate stage picks it up with no pipeline changes.
//
// Connection setup mirrors src/lib/authDatabase.ts (which cannot be imported
// here because it uses the @/ path alias and the app logger).

const getAuthOptions = (): Tedious.ConnectionAuthentication => {
  if (process.env.USER_DB_ACCESS_TOKEN) {
    // Used by deployment pipeline
    return {
      type: 'azure-active-directory-access-token',
      options: { token: process.env.USER_DB_ACCESS_TOKEN },
    };
  }
  if (process.env.USER_DB_USERNAME) {
    // Used in development
    if (!process.env.USER_DB_PASSWORD) {
      throw new Error(
        'USER_DB_USERNAME supplied with no corresponding USER_DB_PASSWORD'
      );
    }
    return {
      type: 'default',
      options: {
        userName: process.env.USER_DB_USERNAME,
        password: process.env.USER_DB_PASSWORD,
      },
    };
  }
  return {
    type: 'azure-active-directory-default',
    options: { clientId: process.env.SQL_MANAGED_IDENTITY_CLIENT_ID },
  };
};

const db = new Kysely<any>({
  dialect: new MssqlDialect({
    tarn: {
      ...Tarn,
      options: { min: 0, max: 1, propagateCreateError: true },
    },
    tedious: {
      ...Tedious,
      connectionFactory: () =>
        new Tedious.Connection({
          authentication: getAuthOptions(),
          options: {
            encrypt: true,
            enableArithAbort: true,
            database: process.env.USER_DATABASE,
            port: Number(process.env.USER_DB_PORT),
            trustServerCertificate: process.env.LOCAL_AUTH === 'true',
          },
          server: process.env.USER_DB_SERVER as string,
        }),
    },
  }),
});

const run = async () => {
  // Per-user uniqueness of comparator group names. The server default
  // case-insensitive collation makes this match the app's normalised
  // (lowercased) comparison.
  await sql`
    IF NOT EXISTS (
      SELECT 1 FROM sys.indexes
      WHERE name = 'UQ_comparatorGroup_userId_name'
        AND object_id = OBJECT_ID('comparatorGroup')
    )
    CREATE UNIQUE INDEX UQ_comparatorGroup_userId_name
      ON [comparatorGroup] ([userId], [name]);
  `.execute(db);
  console.log(
    'User DB post-migrate: comparator group unique index is in place'
  );
};

run()
  .then(() => db.destroy())
  .catch(async (error) => {
    console.error('User DB post-migrate failed:', error);
    await db.destroy();
    process.exit(1);
  });
