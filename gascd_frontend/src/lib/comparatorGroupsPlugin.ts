import type { BetterAuthPlugin } from 'better-auth';

// Schema-only plugin declaring the comparatorGroup table so that
// `@better-auth/cli migrate` (npm run db:migrate) creates it - the same
// mechanism the admin() and lastLoginMethod() plugins use for their fields.
// The table is read/written directly via the authDB Kysely instance in the
// /api/comparator_groups routes; Better Auth itself never touches it.
export const comparatorGroupsPlugin = () =>
  ({
    id: 'comparator-groups',
    schema: {
      comparatorGroup: {
        fields: {
          userId: {
            type: 'string',
            required: true,
            references: {
              model: 'user',
              field: 'id',
              onDelete: 'cascade',
            },
          },
          name: {
            type: 'string',
            required: true,
            // sortable makes the CLI emit an indexable varchar(255) on MSSQL
            // (instead of varchar(8000), which exceeds the index key limit).
            // The per-user unique index on (userId, name) itself is created by
            // scripts/user-db-post-migrate.ts, chained into db:migrate.
            sortable: true,
          },
          // JSON-serialised string array of LA codes. Groups are small,
          // never queried relationally and always read whole, so a member
          // table buys nothing here.
          laCodes: {
            type: 'string',
            required: true,
          },
          createdAt: {
            type: 'date',
            required: true,
          },
          updatedAt: {
            type: 'date',
            required: true,
          },
        },
      },
    },
  }) satisfies BetterAuthPlugin;
