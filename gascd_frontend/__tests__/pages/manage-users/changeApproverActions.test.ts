import {
  cancelApproverInviteAction,
  removeApprover,
  resendApproverInviteAction,
} from '../../../app/(protected)/manage-users/delegated-approvers/[userId]/actions';
import { getCurrentUser } from '@/lib/permissions';
import {
  cancelApproverInvite,
  getChangeableApprover,
  removeDelegatedApprover,
  resendApproverInvite,
} from '@/lib/manageUsersServer';
import { redirect } from 'next/navigation';
import {
  sendApproverInviteEmail,
  sendApproverRemovedEmail,
} from '@/lib/notify';

vi.mock('server-only', () => ({ default: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/permissions', () => ({ getCurrentUser: vi.fn() }));
vi.mock('@/lib/manageUsersServer', () => ({
  cancelApproverInvite: vi.fn(),
  getChangeableApprover: vi.fn(),
  removeDelegatedApprover: vi.fn(),
  resendApproverInvite: vi.fn(),
}));
vi.mock('@/lib/notify', () => ({
  sendApproverInviteEmail: vi.fn(),
  sendApproverRemovedEmail: vi.fn(),
}));
vi.mock('@/lib/signInUrl', () => ({
  SIGN_IN_URL: 'https://gascd.example/login',
}));
vi.mock('@/utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn() },
}));

const ni = {
  id: 'ni-1',
  email: 'ni@example.org',
  name: 'ni@example.org',
  registeredName: 'Nia Ito',
};
const context = { providerCode: 'P1', providerName: 'Test Provider' };
const approver = (status: string) => ({
  userId: 'da-1',
  name: 'Dee Approver',
  email: 'dee@example.org',
  status,
});
const EXPIRES_AT = new Date('2026-12-05T10:00:00Z');

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCurrentUser).mockResolvedValue(ni as any);
  vi.mocked(sendApproverRemovedEmail).mockResolvedValue(true);
  vi.mocked(sendApproverInviteEmail).mockResolvedValue(true);
});

const loadApprover = (status: string) =>
  vi.mocked(getChangeableApprover).mockResolvedValue({
    context,
    approver: approver(status),
  } as any);

describe('removeApprover', () => {
  it('removes the role and emails them with the NI as the contact', async () => {
    loadApprover('Active');
    vi.mocked(removeDelegatedApprover).mockResolvedValue({} as any);

    await removeApprover('da-1');

    expect(removeDelegatedApprover).toHaveBeenCalledWith({
      actor: ni,
      context,
      userId: 'da-1',
    });
    expect(sendApproverRemovedEmail).toHaveBeenCalledWith({
      email: 'dee@example.org',
      name: 'Dee Approver',
      providerName: 'Test Provider',
      contactName: 'Nia Ito',
      contactEmail: 'ni@example.org',
      reference: 'da-1',
    });
    expect(redirect).toHaveBeenCalledWith(
      '/manage-users?done=approver-removed&user=da-1&email=sent'
    );
  });

  it('refuses anyone but an NI', async () => {
    vi.mocked(getChangeableApprover).mockResolvedValue(null);

    expect(await removeApprover('da-1')).toEqual({
      error: 'You do not have permission to change this delegated approver',
    });
    expect(removeDelegatedApprover).not.toHaveBeenCalled();
  });

  it('only removes an active approver; invites are cancelled instead', async () => {
    loadApprover('Invited');

    expect((await removeApprover('da-1'))?.error).toBeDefined();
    expect(removeDelegatedApprover).not.toHaveBeenCalled();
  });
});

describe('resendApproverInviteAction', () => {
  it('restarts an expired invite and emails it again', async () => {
    loadApprover('Invite expired');
    vi.mocked(resendApproverInvite).mockResolvedValue(EXPIRES_AT);

    await resendApproverInviteAction('da-1');

    expect(sendApproverInviteEmail).toHaveBeenCalledWith(
      expect.objectContaining({ expiresAt: EXPIRES_AT, reference: 'da-1' })
    );
    expect(redirect).toHaveBeenCalledWith(
      '/manage-users?done=resent&user=da-1&email=sent'
    );
  });
});

describe('cancelApproverInviteAction', () => {
  it('cancels a pending invite without emailing', async () => {
    loadApprover('Invited');
    vi.mocked(cancelApproverInvite).mockResolvedValue({} as any);

    await cancelApproverInviteAction('da-1');

    expect(sendApproverInviteEmail).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith(
      '/manage-users?done=cancelled&user=da-1'
    );
  });

  it('will not cancel an active approver', async () => {
    loadApprover('Active');

    expect((await cancelApproverInviteAction('da-1'))?.error).toBeDefined();
    expect(cancelApproverInvite).not.toHaveBeenCalled();
  });
});
