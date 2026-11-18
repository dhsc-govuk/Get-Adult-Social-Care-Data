import 'server-only';

import { authDB, User } from '@/lib/auth';
import {
  ApproverContext,
  AUDIT_ACTOR_USER,
  GRANT_SCOPE_PROVIDER,
} from '@/lib/manageUsers';
import {
  AUDIT_ACTION_REVIEW_COMPLETED,
  nextDueAt,
  ReviewRow,
  ReviewType,
} from '@/lib/accessReview';

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
  return row
    ? {
        dueAt: row.due_at,
        deadlineAt: row.deadline_at,
        lastReviewedAt: row.last_reviewed_at,
      }
    : null;
};

/**
 * Records a completed review for the whole provider, so nobody else there is asked, and
 * moves the next one 12 months on. Creates the row if the daily job hasn't yet.
 */
export const completeReview = async (
  actor: User,
  context: ApproverContext,
  type: ReviewType,
  details: object = {}
) => {
  const now = new Date();
  const values = {
    due_at: nextDueAt(now),
    last_reviewed_at: now,
    last_reviewed_by_user_id: actor.id,
    last_reminder_days_left: null,
    deadline_at: null,
  };
  await authDB.transaction().execute(async (trx) => {
    const updated = await trx
      .updateTable('access_review')
      .set(values)
      .where('review_type', '=', type)
      .where('scope_type', '=', GRANT_SCOPE_PROVIDER)
      .where('provider_code', '=', context.providerCode)
      .executeTakeFirst();
    if (Number(updated.numUpdatedRows) === 0) {
      await trx
        .insertInto('access_review')
        .values({
          ...values,
          review_type: type,
          scope_type: GRANT_SCOPE_PROVIDER,
          provider_code: context.providerCode,
          location_code: null,
          created_at: now,
        })
        .execute();
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
        location_codes: null,
        details: JSON.stringify(details),
      })
      .execute();
  });
};
