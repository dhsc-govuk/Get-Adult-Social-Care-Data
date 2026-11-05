import { NotifyClient } from 'notifications-node-client';
import {
  sendApproverAppointedEmail,
  sendApproverInviteEmail,
  sendApproverRemovedEmail,
  sendInviteEmail,
} from '@/lib/notify';
import logger from '@/utils/logger';

vi.mock('server-only', () => ({ default: vi.fn() }));
vi.mock('notifications-node-client', () => ({ NotifyClient: vi.fn() }));
vi.mock('@/utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn() },
}));

const sendEmail = vi.fn();
const invite = {
  email: 'tina@example.com',
  name: 'Tina Singh',
  providerName: 'Test Provider',
  invitedByName: 'Nia Ito',
  signInUrl: 'https://gascd.example/login',
  expiresAt: new Date('2026-12-04T10:00:00Z'),
  reference: 'new-user',
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('NOTIFY_API_KEY', 'key-123');
  vi.stubEnv('NOTIFY_INVITE_TEMPLATE_ID', 'template-1');
  vi.mocked(NotifyClient).mockImplementation(function () {
    return { sendEmail };
  } as any);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('sendInviteEmail', () => {
  it('sends the invite template with its personalisation', async () => {
    sendEmail.mockResolvedValue({});

    expect(await sendInviteEmail(invite)).toBe(true);
    expect(NotifyClient).toHaveBeenCalledWith('key-123');
    expect(sendEmail).toHaveBeenCalledWith('template-1', 'tina@example.com', {
      personalisation: {
        invitee_name: 'Tina Singh',
        inviter_name: 'Nia Ito',
        organisation_name: 'Test Provider',
        service_url: 'https://gascd.example/login',
        'email address': 'tina@example.com',
        expiry_date: '4 December 2026',
      },
      reference: 'new-user',
    });
  });

  it('skips sending when Notify is not configured', async () => {
    vi.stubEnv('NOTIFY_API_KEY', '');

    expect(await sendInviteEmail(invite)).toBe(false);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
  });

  it('logs Notify’s error without throwing', async () => {
    sendEmail.mockRejectedValue({
      response: {
        status: 400,
        data: {
          errors: [
            {
              message: "Can't send to this recipient using a team-only API key",
            },
          ],
        },
      },
    });

    expect(await sendInviteEmail(invite)).toBe(false);
    expect(logger.error).toHaveBeenCalledWith(
      'Invite email could not be sent',
      expect.objectContaining({
        status: 400,
        error: "Can't send to this recipient using a team-only API key",
      })
    );
  });
});

describe('delegated approver emails', () => {
  beforeEach(() => sendEmail.mockResolvedValue({}));

  it('invites a new delegated approver with the approver invite template', async () => {
    expect(await sendApproverInviteEmail(invite)).toBe(true);
    expect(sendEmail).toHaveBeenCalledWith(
      '2d1e687c-5ee1-4541-bec6-565c6f307c6f',
      'tina@example.com',
      {
        personalisation: {
          invitee_name: 'Tina Singh',
          inviter_name: 'Nia Ito',
          organisation_name: 'Test Provider',
          service_url: 'https://gascd.example/login',
          email_address: 'tina@example.com',
          expiry_date: '4 December 2026',
        },
        reference: 'new-user',
      }
    );
  });

  it('tells an existing user they have been appointed', async () => {
    const { expiresAt: _, ...appointed } = invite;
    expect(await sendApproverAppointedEmail(appointed)).toBe(true);
    expect(sendEmail).toHaveBeenCalledWith(
      'ad23060c-964c-411c-8b5c-026fe48d4bc3',
      'tina@example.com',
      {
        personalisation: {
          invitee_name: 'Tina Singh',
          inviter_name: 'Nia Ito',
          organisation_name: 'Test Provider',
          service_url: 'https://gascd.example/login',
          email_address: 'tina@example.com',
        },
        reference: 'new-user',
      }
    );
  });

  it('tells them their role was removed, and who to contact', async () => {
    expect(
      await sendApproverRemovedEmail({
        email: 'tina@example.com',
        name: 'Tina Singh',
        providerName: 'Test Provider',
        contactName: 'Nia Ito',
        contactEmail: 'ni@example.org',
        reference: 'da-1',
      })
    ).toBe(true);
    expect(sendEmail).toHaveBeenCalledWith(
      '9b2057e3-4b6d-4804-aaf9-34569a0ded74',
      'tina@example.com',
      {
        personalisation: {
          invitee_name: 'Tina Singh',
          organisation_name: 'Test Provider',
          contact_name: 'Nia Ito',
          contact_email: 'ni@example.org',
        },
        reference: 'da-1',
      }
    );
  });
});
