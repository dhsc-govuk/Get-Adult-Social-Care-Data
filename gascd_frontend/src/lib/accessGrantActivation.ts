import { Kysely } from 'kysely';
import {
  AUDIT_ACTION_FIRST_SIGN_IN,
  AUDIT_ACTOR_USER,
  GRANT_STATUS_ACTIVE,
  GRANT_STATUS_INVITED,
} from '@/lib/manageUsers';

type SignedInUser = {
  id: string;
  name?: string | null;
  email: string;
  registeredName?: string | null;
};

// Takes the db so auth.ts can call it without a circular import
export const activateInvitedGrants = async (
  db: Kysely<any>,
  user: SignedInUser,
  now: Date = new Date()
) => {
  await db.transaction().execute(async (trx) => {
    const invited: { provider_code: string; location_code: string | null }[] =
      await trx
        .selectFrom('access_grant')
        .select(['provider_code', 'location_code'])
        .where('user_id', '=', user.id)
        .where('status', '=', GRANT_STATUS_INVITED)
        .execute();
    if (invited.length === 0) return;

    await trx
      .updateTable('access_grant')
      .set({
        status: GRANT_STATUS_ACTIVE,
        status_changed_at: now,
        status_changed_by_user_id: user.id,
      })
      .where('user_id', '=', user.id)
      .where('status', '=', GRANT_STATUS_INVITED)
      .execute();

    const name = user.registeredName ?? user.name ?? null;
    const providers = Array.from(new Set(invited.map((g) => g.provider_code)));
    await trx
      .insertInto('access_audit')
      .values(
        providers.map((providerCode) => {
          const locationCodes = invited
            .filter((g) => g.provider_code === providerCode && g.location_code)
            .map((g) => g.location_code);
          return {
            occurred_at: now,
            action: AUDIT_ACTION_FIRST_SIGN_IN,
            actor_type: AUDIT_ACTOR_USER,
            actor_id: user.id,
            actor_name: name,
            actor_email: user.email,
            target_user_id: user.id,
            target_name: name,
            target_email: user.email,
            provider_code: providerCode,
            location_codes: locationCodes.length
              ? locationCodes.join(',')
              : null,
          };
        })
      )
      .execute();
  });
};
