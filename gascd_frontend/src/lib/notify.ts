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

// Never throws: a failed email shouldn't undo the invite that's already saved
export const sendInviteEmail = async (
  invite: InviteEmail
): Promise<boolean> => {
  const apiKey = process.env.NOTIFY_API_KEY;
  const templateId = process.env.NOTIFY_INVITE_TEMPLATE_ID;
  if (!apiKey || !templateId) {
    logger.warn('Invite email not sent: Notify is not configured', {
      reference: invite.reference,
    });
    return false;
  }

  try {
    await new NotifyClient(apiKey).sendEmail(templateId, invite.email, {
      personalisation: {
        invitee_name: invite.name,
        inviter_name: invite.invitedByName,
        organisation_name: invite.providerName,
        service_url: invite.signInUrl,
        'email address': invite.email,
        expiry_date: expiryDate(invite.expiresAt),
      },
      reference: invite.reference,
    });
    return true;
  } catch (error) {
    const notifyError = error as NotifyError;
    logger.error('Invite email could not be sent', {
      reference: invite.reference,
      status: notifyError.response?.status,
      error:
        notifyError.response?.data?.errors?.map((e) => e.message).join('; ') ??
        notifyError.message,
    });
    return false;
  }
};
