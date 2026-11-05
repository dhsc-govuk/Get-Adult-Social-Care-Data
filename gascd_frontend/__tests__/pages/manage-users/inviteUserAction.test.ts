import { inviteUser } from '../../../app/(protected)/manage-users/invite/actions';
import { getCurrentUser } from '@/lib/permissions';
import {
  emailHasAccount,
  findReinvitableUser,
  getApproverContext,
  inviteReader,
} from '@/lib/manageUsersServer';
import { redirect } from 'next/navigation';
import { sendInviteEmail } from '@/lib/notify';

vi.mock('server-only', () => ({ default: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/permissions', () => ({ getCurrentUser: vi.fn() }));
vi.mock('@/lib/manageUsersServer', () => ({
  emailHasAccount: vi.fn(),
  findReinvitableUser: vi.fn(),
  getApproverContext: vi.fn(),
  inviteReader: vi.fn(),
}));
vi.mock('@/lib/notify', () => ({ sendInviteEmail: vi.fn() }));
vi.mock('@/lib/signInUrl', () => ({
  SIGN_IN_URL: 'https://gascd.example/login',
}));
vi.mock('@/utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn() },
}));

const approver = {
  id: 'approver-1',
  email: 'ni@example.org',
  name: 'ni@example.org',
  registeredName: 'Nia Ito',
};
const context = {
  providerCode: 'P1',
  providerName: 'Test Provider',
  basis: 'registered_manager',
  providerWide: false,
  locations: [{ code: 'L1', name: 'Ivy House' }],
};
const EXPIRES_AT = new Date('2026-12-04T10:00:00Z');
const fields = {
  name: 'Tina Singh',
  email: 'Tina@Example.com',
  locations: ['L1'],
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCurrentUser).mockResolvedValue(approver as any);
  vi.mocked(getApproverContext).mockResolvedValue(context as any);
  vi.mocked(emailHasAccount).mockResolvedValue(false);
  vi.mocked(findReinvitableUser).mockResolvedValue(null);
  vi.mocked(inviteReader).mockResolvedValue({
    userId: 'new-user',
    expiresAt: EXPIRES_AT,
  });
});

describe('inviteUser', () => {
  it('refuses users who are not approvers', async () => {
    vi.mocked(getApproverContext).mockResolvedValue(null);

    const result = await inviteUser(fields);

    expect(result.error).toBe('You do not have permission to invite users');
    expect(inviteReader).not.toHaveBeenCalled();
  });

  it('refuses locations outside the approver’s own', async () => {
    const result = await inviteUser({ ...fields, locations: ['all'] });

    expect(result.errors.locations).toBe('Select from the locations listed');
    expect(inviteReader).not.toHaveBeenCalled();
  });

  it('refuses an email that already has an account', async () => {
    vi.mocked(emailHasAccount).mockResolvedValue(true);

    const result = await inviteUser(fields);

    expect(result.errors.email).toMatch(/already has access/);
    expect(inviteReader).not.toHaveBeenCalled();
  });

  it('adds the reader and returns to the list', async () => {
    vi.mocked(sendInviteEmail).mockResolvedValue(true);

    await inviteUser(fields);

    expect(inviteReader).toHaveBeenCalledWith(approver, context, fields, null);
    expect(redirect).toHaveBeenCalledWith(
      '/manage-users?done=added&user=new-user&email=sent'
    );
  });

  it('emails the new reader', async () => {
    await inviteUser(fields);

    expect(sendInviteEmail).toHaveBeenCalledWith({
      email: 'tina@example.com',
      name: 'Tina Singh',
      providerName: 'Test Provider',
      invitedByName: 'Nia Ito',
      signInUrl: 'https://gascd.example/login',
      expiresAt: EXPIRES_AT,
      reference: 'new-user',
    });
  });

  it('still returns to the list when the email is not sent', async () => {
    vi.mocked(sendInviteEmail).mockResolvedValue(false);

    await inviteUser(fields);

    expect(redirect).toHaveBeenCalledWith(
      '/manage-users?done=added&user=new-user&email=failed'
    );
  });

  it('invites someone again whose earlier invites were cancelled or ran out', async () => {
    vi.mocked(findReinvitableUser).mockResolvedValue('old-user');
    vi.mocked(emailHasAccount).mockResolvedValue(true);

    const result = await inviteUser(fields);

    expect(result?.errors.email).toBeUndefined();
    expect(inviteReader).toHaveBeenCalledWith(
      approver,
      context,
      fields,
      'old-user'
    );
  });

  it('reports a service error when the write fails', async () => {
    vi.mocked(inviteReader).mockRejectedValue(new Error('db down'));

    const result = await inviteUser(fields);

    expect(result.error).toMatch(/problem with the service/);
    expect(redirect).not.toHaveBeenCalled();
    expect(sendInviteEmail).not.toHaveBeenCalled();
  });
});
