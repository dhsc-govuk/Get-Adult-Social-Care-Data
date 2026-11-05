import 'server-only';
import { NotifyClient } from 'notifications-node-client';
import logger from '@/utils/logger';

export type InviteEmail = {
  email: string;
  name: string;
  providerName: string;
  invitedByName: string;
  signInUrl: string;
  expiresAt: Date;
  reference: string;
};

// Template ids aren't secret, and these templates are only used from here
const APPROVER_TEMPLATES = {
  invited: '2d1e687c-5ee1-4541-bec6-565c6f307c6f',
  appointed: 'ad23060c-964c-411c-8b5c-026fe48d4bc3',
  removed: '9b2057e3-4b6d-4804-aaf9-34569a0ded74',
};

const expiryDate = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  });

type NotifyError = {
  response?: { status?: number; data?: { errors?: { message?: string }[] } };
  message?: string;
};

// Never throws: a failed email shouldn't undo the change that's already saved
const sendEmail = async (
  kind: string,
  templateId: string | undefined,
  email: string,
  personalisation: Record<string, string>,
  reference: string
): Promise<boolean> => {
  const apiKey = process.env.NOTIFY_API_KEY;
  if (!apiKey || !templateId) {
    logger.warn(`${kind} email not sent: Notify is not configured`, {
      reference,
    });
    return false;
  }

  try {
    await new NotifyClient(apiKey).sendEmail(templateId, email, {
      personalisation,
      reference,
    });
    return true;
  } catch (error) {
    const notifyError = error as NotifyError;
    logger.error(`${kind} email could not be sent`, {
      reference,
      status: notifyError.response?.status,
      error:
        notifyError.response?.data?.errors?.map((e) => e.message).join('; ') ??
        notifyError.message,
    });
    return false;
  }
};

export const sendInviteEmail = (invite: InviteEmail) =>
  sendEmail(
    'Invite',
    process.env.NOTIFY_INVITE_TEMPLATE_ID,
    invite.email,
    {
      invitee_name: invite.name,
      inviter_name: invite.invitedByName,
      organisation_name: invite.providerName,
      service_url: invite.signInUrl,
      'email address': invite.email,
      expiry_date: expiryDate(invite.expiresAt),
    },
    invite.reference
  );

export const sendApproverInviteEmail = (invite: InviteEmail) =>
  sendEmail(
    'Delegated approver invite',
    APPROVER_TEMPLATES.invited,
    invite.email,
    {
      invitee_name: invite.name,
      inviter_name: invite.invitedByName,
      organisation_name: invite.providerName,
      service_url: invite.signInUrl,
      email_address: invite.email,
      expiry_date: expiryDate(invite.expiresAt),
    },
    invite.reference
  );

export type ApproverAppointedEmail = Omit<InviteEmail, 'expiresAt'>;

export const sendApproverAppointedEmail = (appointed: ApproverAppointedEmail) =>
  sendEmail(
    'Delegated approver appointed',
    APPROVER_TEMPLATES.appointed,
    appointed.email,
    {
      invitee_name: appointed.name,
      inviter_name: appointed.invitedByName,
      organisation_name: appointed.providerName,
      service_url: appointed.signInUrl,
      email_address: appointed.email,
    },
    appointed.reference
  );

export type ApproverRemovedEmail = {
  email: string;
  name: string;
  providerName: string;
  // The NI who removed them, for the "if you think this is a mistake" line
  contactName: string;
  contactEmail: string;
  reference: string;
};

export const sendApproverRemovedEmail = (removed: ApproverRemovedEmail) =>
  sendEmail(
    'Delegated approver removed',
    APPROVER_TEMPLATES.removed,
    removed.email,
    {
      invitee_name: removed.name,
      organisation_name: removed.providerName,
      contact_name: removed.contactName,
      contact_email: removed.contactEmail,
    },
    removed.reference
  );
