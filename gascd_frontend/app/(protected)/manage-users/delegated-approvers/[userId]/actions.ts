'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/permissions';
import {
  cancelApproverInvite,
  getChangeableApprover,
  removeDelegatedApprover,
  resendApproverInvite,
} from '@/lib/manageUsersServer';
import {
  sendApproverInviteEmail,
  sendApproverRemovedEmail,
} from '@/lib/notify';
import { SIGN_IN_URL } from '@/lib/signInUrl';
import logger from '@/utils/logger';

const NO_PERMISSION =
  'You do not have permission to change this delegated approver';
const SERVICE_ERROR =
  'Sorry, there is a problem with the service. Please try again later.';

const load = async (userId: string) => {
  const actor = await getCurrentUser();
  const changeable = actor
    ? await getChangeableApprover(actor, String(userId))
    : null;
  return actor && changeable ? { actor, ...changeable } : null;
};

const attempt = async <T>(
  what: string,
  actorId: string,
  userId: string,
  run: () => Promise<T>
): Promise<{ result: T } | { error: string }> => {
  try {
    return { result: await run() };
  } catch (error) {
    logger.error(`Could not ${what}`, {
      userid: actorId,
      targetUserId: userId,
      error: (error as Error).message,
    });
    return { error: SERVICE_ERROR };
  }
};

export async function removeApprover(userId: string) {
  const loaded = await load(userId);
  if (!loaded || loaded.approver.status !== 'Active') {
    return { error: NO_PERMISSION };
  }
  const { actor, context, approver } = loaded;
  const outcome = await attempt(
    'remove delegated approver',
    actor.id,
    userId,
    () => removeDelegatedApprover({ actor, context, userId })
  );
  if ('error' in outcome) return outcome;
  if (!outcome.result) return { error: NO_PERMISSION };

  const sent = await sendApproverRemovedEmail({
    email: approver.email,
    name: approver.name,
    providerName: context.providerName,
    contactName: actor.registeredName ?? actor.name,
    contactEmail: actor.email,
    reference: userId,
  });
  redirect(
    `/manage-users?done=approver-removed&user=${userId}&email=${sent ? 'sent' : 'failed'}`
  );
}

export async function resendApproverInviteAction(userId: string) {
  const loaded = await load(userId);
  if (!loaded || loaded.approver.status === 'Active') {
    return { error: NO_PERMISSION };
  }
  const { actor, context, approver } = loaded;
  const outcome = await attempt(
    'resend delegated approver invite',
    actor.id,
    userId,
    () => resendApproverInvite({ actor, context, userId })
  );
  if ('error' in outcome) return outcome;
  if (!outcome.result) return { error: NO_PERMISSION };

  const sent = await sendApproverInviteEmail({
    email: approver.email,
    name: approver.name,
    providerName: context.providerName,
    invitedByName: actor.registeredName ?? actor.name,
    signInUrl: SIGN_IN_URL,
    expiresAt: outcome.result,
    reference: userId,
  });
  redirect(
    `/manage-users?done=resent&user=${userId}&email=${sent ? 'sent' : 'failed'}`
  );
}

export async function cancelApproverInviteAction(userId: string) {
  const loaded = await load(userId);
  if (!loaded || loaded.approver.status === 'Active') {
    return { error: NO_PERMISSION };
  }
  const { actor, context } = loaded;
  const outcome = await attempt(
    'cancel delegated approver invite',
    actor.id,
    userId,
    () => cancelApproverInvite({ actor, context, userId })
  );
  if ('error' in outcome) return outcome;
  if (!outcome.result) return { error: NO_PERMISSION };
  redirect(`/manage-users?done=cancelled&user=${userId}`);
}
