'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/permissions';
import {
  appointBlocker,
  appointDelegatedApprover,
  getApproverContext,
} from '@/lib/manageUsersServer';
import {
  AppointErrors,
  AppointFields,
  GRANT_BASIS_NI,
  validateAppoint,
} from '@/lib/manageUsers';
import {
  sendApproverAppointedEmail,
  sendApproverInviteEmail,
} from '@/lib/notify';
import { SIGN_IN_URL } from '@/lib/signInUrl';
import logger from '@/utils/logger';

export type AppointResult = { errors: AppointErrors; error?: string };

const EMAIL_ERRORS = {
  already_approver: 'This person is already a delegated approver',
  nominated_individual:
    'This person is a Nominated Individual for your organisation, so they can already manage users',
  other_organisation:
    'This person uses Get adult social care data for another organisation',
};

const NO_PERMISSION: AppointResult = {
  errors: {},
  error: 'You do not have permission to appoint delegated approvers',
};

const SERVICE_ERROR: AppointResult = {
  errors: {},
  error: 'Sorry, there is a problem with the service. Please try again later.',
};

// Only an NI can appoint; the fields are checked before anything is saved
const prepare = async (fields: AppointFields) => {
  const user = await getCurrentUser();
  const context = user ? await getApproverContext(user) : null;
  if (!user || !context || context.basis !== GRANT_BASIS_NI) return null;
  const input: AppointFields = {
    name: String(fields?.name ?? ''),
    email: String(fields?.email ?? ''),
  };
  const errors = validateAppoint(
    input,
    [user.email, user.registeredEmail].filter((e): e is string => !!e)
  );
  return { user, context, input, errors };
};

// Before check your answers, so an email that can't be used is caught on the form
export async function checkApprover(
  fields: AppointFields
): Promise<AppointResult> {
  const prepared = await prepare(fields);
  if (!prepared) return NO_PERMISSION;
  const { context, input, errors } = prepared;
  if (Object.keys(errors).length > 0) return { errors };
  try {
    const blocker = await appointBlocker(context, input.email);
    return blocker
      ? { errors: { email: EMAIL_ERRORS[blocker] } }
      : { errors: {} };
  } catch (error) {
    logger.error('Could not check delegated approver', {
      error: (error as Error).message,
    });
    return SERVICE_ERROR;
  }
}

export async function appointApprover(
  fields: AppointFields
): Promise<AppointResult> {
  const prepared = await prepare(fields);
  if (!prepared) return NO_PERMISSION;
  const { user, context, input, errors } = prepared;
  if (Object.keys(errors).length > 0) return { errors };

  let result: Awaited<ReturnType<typeof appointDelegatedApprover>>;
  try {
    result = await appointDelegatedApprover(user, context, input);
  } catch (error) {
    logger.error('Could not appoint delegated approver', {
      userid: user.id,
      error: (error as Error).message,
    });
    return SERVICE_ERROR;
  }
  if ('error' in result) {
    return { errors: { email: EMAIL_ERRORS[result.error] } };
  }

  logger.info('Delegated approver appointed', {
    userid: user.id,
    approverUserId: result.userId,
    providerCode: context.providerCode,
    invited: result.invited,
  });
  const email = {
    email: input.email.trim().toLowerCase(),
    name: result.name,
    providerName: context.providerName,
    invitedByName: user.registeredName ?? user.name,
    signInUrl: SIGN_IN_URL,
    reference: result.userId,
  };
  const sent =
    result.invited && result.expiresAt
      ? await sendApproverInviteEmail({ ...email, expiresAt: result.expiresAt })
      : await sendApproverAppointedEmail(email);
  redirect(
    `/manage-users/delegated-approvers/appointed?user=${result.userId}&email=${sent ? 'sent' : 'failed'}`
  );
}
