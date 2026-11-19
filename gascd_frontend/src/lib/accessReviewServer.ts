import 'server-only';

import { Kysely } from 'kysely';
import { authDB, User } from '@/lib/auth';
import {
  ApproverContext,
  AUDIT_ACTOR_USER,
  GRANT_BASIS_RM,
  GRANT_SCOPE_LOCATION,
  GRANT_SCOPE_PROVIDER,
} from '@/lib/manageUsers';
import {
  AUDIT_ACTION_REVIEW_COMPLETED,
  nextDueAt,
  REVIEW_TYPE_USERS,
  ReviewRow,
  ReviewType,
} from '@/lib/accessReview';

const toRow = (row: {
  due_at: Date;
  deadline_at: Date | null;
  last_reviewed_at: Date | null;
}): ReviewRow => ({
  dueAt: row.due_at,
  deadlineAt: row.deadline_at,
  lastReviewedAt: row.last_reviewed_at,
});

export const getReview = async (
  providerCode: string,
  type: ReviewType
): Promise<ReviewRow | null> => {
  const row = await authDB
    .selectFrom('access_review')
    .select(['due_at', 'deadline_at', 'last_reviewed_at'])
    .where('review_type', '=', type)
    .where('scope_type', '=', GRANT_SCOPE_PROVIDER)
    .where('provider_code', '=', providerCode)
    .executeTakeFirst();
  return row ? toRow(row) : null;
};

const getLocationUserReviews = async (
  locationCodes: string[]
): Promise<ReviewRow[]> => {
  if (locationCodes.length === 0) return [];
  const rows = await authDB
    .selectFrom('access_review')
    .select(['due_at', 'deadline_at', 'last_reviewed_at'])
    .where('review_type', '=', REVIEW_TYPE_USERS)
    .where('scope_type', '=', GRANT_SCOPE_LOCATION)
    .where('location_code', 'in', locationCodes)
    .execute();
  return rows.map(toRow);
};

/**
 * The yearly check of who has access: the organisation's for NIs and delegated
 * approvers, and for an RM their locations', the soonest due of them.
 */
export const getUserReview = async (
  context: ApproverContext
): Promise<ReviewRow | null> => {
  if (context.basis !== GRANT_BASIS_RM) {
    return getReview(context.providerCode, REVIEW_TYPE_USERS);
  }
  const rows = await getLocationUserReviews(
    context.locations.map((location) => location.code)
  );
  return rows.length === 0
    ? null
    : rows.reduce((soonest, row) =>
        row.dueAt < soonest.dueAt ? row : soonest
      );
};

type Completed = {
  due_at: Date;
  last_reviewed_at: Date;
  last_reviewed_by_user_id: string;
  last_reminder_days_left: null;
  deadline_at: null;
};

const upsertReview = async (
  trx: Kysely<any>,
  values: Completed,
  key: {
    review_type: ReviewType;
    provider_code: string;
    location_code: string | null;
  },
  createdAt: Date
) => {
  const scope = key.location_code ? GRANT_SCOPE_LOCATION : GRANT_SCOPE_PROVIDER;
  let update = trx
    .updateTable('access_review')
    .set(values)
    .where('review_type', '=', key.review_type)
    .where('scope_type', '=', scope);
  update = key.location_code
    ? update.where('location_code', '=', key.location_code)
    : update.where('provider_code', '=', key.provider_code);
  const updated = await update.executeTakeFirst();
  if (Number(updated.numUpdatedRows) === 0) {
    await trx
      .insertInto('access_review')
      .values({ ...values, ...key, scope_type: scope, created_at: createdAt })
      .execute();
  }
};

/**
 * Records a completed review and moves the next one 12 months on. An NI's or
 * delegated approver's check of who has access covers the whole organisation,
 * so it counts for its RMs' locations too; an RM's covers their locations.
 * Creates rows the daily job hasn't yet.
 */
export const completeReview = async (
  actor: User,
  context: ApproverContext,
  type: ReviewType,
  details: object = {}
) => {
  const now = new Date();
  const values: Completed = {
    due_at: nextDueAt(now),
    last_reviewed_at: now,
    last_reviewed_by_user_id: actor.id,
    last_reminder_days_left: null,
    deadline_at: null,
  };
  const rmLocations =
    type === REVIEW_TYPE_USERS && context.basis === GRANT_BASIS_RM
      ? context.locations.map((location) => location.code)
      : null;

  await authDB.transaction().execute(async (trx) => {
    if (rmLocations) {
      for (const locationCode of rmLocations) {
        await upsertReview(
          trx,
          values,
          {
            review_type: type,
            provider_code: context.providerCode,
            location_code: locationCode,
          },
          now
        );
      }
    } else {
      await upsertReview(
        trx,
        values,
        {
          review_type: type,
          provider_code: context.providerCode,
          location_code: null,
        },
        now
      );
      if (type === REVIEW_TYPE_USERS) {
        await trx
          .updateTable('access_review')
          .set(values)
          .where('review_type', '=', REVIEW_TYPE_USERS)
          .where('scope_type', '=', GRANT_SCOPE_LOCATION)
          .where('provider_code', '=', context.providerCode)
          .execute();
      }
    }

    await trx
      .insertInto('access_audit')
      .values({
        occurred_at: now,
        action: AUDIT_ACTION_REVIEW_COMPLETED[type],
        actor_type: AUDIT_ACTOR_USER,
        actor_id: actor.id,
        actor_name: actor.registeredName ?? actor.name,
        actor_email: actor.email,
        target_user_id: null,
        target_name: null,
        target_email: null,
        provider_code: context.providerCode,
        location_codes: rmLocations ? rmLocations.join(',') : null,
        details: JSON.stringify(details),
      })
      .execute();
  });

  return values.due_at;
};
