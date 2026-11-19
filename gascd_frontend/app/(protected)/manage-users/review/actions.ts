'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/permissions';
import {
  cancelApproverInvite,
  getApproverContext,
  listDelegatedApprovers,
  removeDelegatedApprover,
} from '@/lib/manageUsersServer';
import { completeReview } from '@/lib/accessReviewServer';
import { REVIEW_TYPE_APPROVERS, REVIEW_TYPE_USERS } from '@/lib/accessReview';
import { GRANT_BASIS_NI } from '@/lib/manageUsers';
import { sendApproverRemovedEmail } from '@/lib/notify';
import logger from '@/utils/logger';

const NO_PERMISSION = 'You do not have permission to complete this check';
const SERVICE_ERROR =
  'Sorry, there is a problem with the service. Please try again later.';

export async function confirmUserReview() {
  const actor = await getCurrentUser();
  const context = actor ? await getApproverContext(actor) : null;
  if (!actor || !context) {
    return { error: NO_PERMISSION };
  }
  try {
    await completeReview(actor, context, REVIEW_TYPE_USERS);
  } catch (error) {
    logger.error('Could not complete the user review', {
      userid: actor.id,
      error: (error as Error).message,
    });
    return { error: SERVICE_ERROR };
  }
  redirect('/manage-users/review/confirmed');
}

export async function submitApproverReview(removeUserIds: string[]) {
  const actor = await getCurrentUser();
  const context = actor ? await getApproverContext(actor) : null;
  if (!actor || !context || context.basis !== GRANT_BASIS_NI) {
    return { error: NO_PERMISSION };
  }
  const approvers = await listDelegatedApprovers(context, actor.id);
  const toRemove = approvers.filter((a) => removeUserIds.includes(a.userId));
  if (toRemove.length !== new Set(removeUserIds).size) {
    return { error: NO_PERMISSION };
  }

  try {
    for (const approver of toRemove) {
      const change = { actor, context, userId: approver.userId };
      // Someone who hasn't signed in yet has an invite to cancel, not a role to remove
      if (approver.status !== 'Active') {
        await cancelApproverInvite(change);
        continue;
      }
      await removeDelegatedApprover(change);
      await sendApproverRemovedEmail({
        email: approver.email,
        name: approver.name,
        providerName: context.providerName,
        contactName: actor.registeredName ?? actor.name,
        contactEmail: actor.email,
        reference: approver.userId,
      });
    }
    await completeReview(actor, context, REVIEW_TYPE_APPROVERS, {
      kept: approvers.filter((a) => !toRemove.includes(a)).map((a) => a.userId),
      removed: toRemove.map((a) => a.userId),
    });
  } catch (error) {
    logger.error('Could not complete the delegated approver review', {
      userid: actor.id,
      error: (error as Error).message,
    });
    return { error: SERVICE_ERROR };
  }
  redirect(
    `/manage-users/delegated-approvers/review/confirmed?removed=${toRemove.length}`
  );
}
