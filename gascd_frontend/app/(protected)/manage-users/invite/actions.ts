'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/permissions';
import {
  emailHasAccount,
  getApproverContext,
  inviteReader,
} from '@/lib/manageUsersServer';
import { InviteErrors, InviteFields, validateInvite } from '@/lib/manageUsers';
import logger from '@/utils/logger';

export type InviteResult = { errors: InviteErrors; error?: string };

const EMAIL_IN_USE =
  'This email address already has access to Get adult social care data';

export async function inviteUser(fields: InviteFields): Promise<InviteResult> {
  const user = await getCurrentUser();
  const context = user ? await getApproverContext(user) : null;
  if (!user || !context) {
    return {
      errors: {},
      error: 'You do not have permission to invite users',
    };
  }

  const input: InviteFields = {
    name: String(fields?.name ?? ''),
    email: String(fields?.email ?? ''),
    locations: Array.isArray(fields?.locations)
      ? fields.locations.map(String)
      : [],
  };
  const errors = validateInvite(input, context);
  if (Object.keys(errors).length > 0) {
    return { errors };
  }
  if (await emailHasAccount(input.email)) {
    return { errors: { email: EMAIL_IN_USE } };
  }

  let userId: string;
  try {
    userId = await inviteReader(user, context, input);
  } catch (error) {
    // A concurrent invite for the same email may have got there first
    if (await emailHasAccount(input.email)) {
      return { errors: { email: EMAIL_IN_USE } };
    }
    logger.error('Could not invite user', {
      userid: user.id,
      error: (error as Error).message,
    });
    return {
      errors: {},
      error:
        'Sorry, there is a problem with the service. Please try again later.',
    };
  }

  logger.info('User invited', {
    userid: user.id,
    invitedUserId: userId,
    providerCode: context.providerCode,
  });
  redirect(`/manage-users?done=added&user=${userId}`);
}
