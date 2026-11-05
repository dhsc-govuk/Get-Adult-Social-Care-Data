import {
  cancelInvite,
  removeUser,
  resendInvite,
  restoreUser,
  updateUser,
} from '../../../app/(protected)/manage-users/[userId]/actions';
import { getCurrentUser } from '@/lib/permissions';
import {
  getChangeableUser,
  removeManagedUser,
  restoreManagedUser,
  resendManagedInvite,
  cancelManagedInvite,
  updateManagedUser,
} from '@/lib/manageUsersServer';
import { redirect } from 'next/navigation';
import { sendInviteEmail } from '@/lib/notify';

vi.mock('server-only', () => ({ default: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/permissions', () => ({ getCurrentUser: vi.fn() }));
vi.mock('@/lib/manageUsersServer', () => ({
  getChangeableUser: vi.fn(),
  removeManagedUser: vi.fn(),
  restoreManagedUser: vi.fn(),
  resendManagedInvite: vi.fn(),
  cancelManagedInvite: vi.fn(),
  updateManagedUser: vi.fn(),
}));
vi.mock('@/lib/notify', () => ({ sendInviteEmail: vi.fn() }));
vi.mock('@/lib/signInUrl', () => ({
  SIGN_IN_URL: 'https://gascd.example/login',
}));
vi.mock('@/utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn() },
}));

const actor = {
  id: 'approver-1',
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
const changeable = (status: string, canRemove = true) => ({
  context,
  grants: [],
  user: {
    userId: 'u1',
    name: 'Tina Singh',
    email: 'tina@example.com',
    status,
    canRemove,
  },
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCurrentUser).mockResolvedValue(actor as any);
  vi.mocked(getChangeableUser).mockResolvedValue(changeable('Active') as any);
});

describe('updateUser', () => {
  it('refuses users the approver cannot change', async () => {
    vi.mocked(getChangeableUser).mockResolvedValue(null);

    const result = await updateUser('u1', { name: 'X', locations: ['L1'] });

    expect(result.error).toMatch(/permission/);
    expect(updateManagedUser).not.toHaveBeenCalled();
  });

  it('validates the name and locations', async () => {
    const result = await updateUser('u1', { name: '', locations: ['L2'] });

    expect(result.errors).toEqual({
      name: "Enter the user's full name",
      locations: 'Select from the locations listed',
    });
    expect(updateManagedUser).not.toHaveBeenCalled();
  });

  it('saves and returns to the list', async () => {
    await updateUser('u1', { name: 'Tina S', locations: ['L1'] });

    expect(updateManagedUser).toHaveBeenCalledWith(
      { actor, context, userId: 'u1' },
      { name: 'Tina S', locations: ['L1'] }
    );
    expect(redirect).toHaveBeenCalledWith('/manage-users?done=updated&user=u1');
  });
});

describe('removeUser and restoreUser', () => {
  it('removes an active user', async () => {
    await removeUser('u1');

    expect(removeManagedUser).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith('/manage-users?done=removed&user=u1');
  });

  it('will not restore a user who still has access', async () => {
    const result = await restoreUser('u1');

    expect(result.error).toMatch(/permission/);
    expect(restoreManagedUser).not.toHaveBeenCalled();
  });

  it('restores a removed user', async () => {
    vi.mocked(getChangeableUser).mockResolvedValue(
      changeable('Removed') as any
    );

    await restoreUser('u1');

    expect(restoreManagedUser).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith(
      '/manage-users?done=restored&user=u1'
    );
    expect(sendInviteEmail).not.toHaveBeenCalled();
  });

  it('sends a new invite when the restored user has never signed in', async () => {
    const expiresAt = new Date('2026-12-04T10:00:00Z');
    vi.mocked(getChangeableUser).mockResolvedValue(
      changeable('Removed') as any
    );
    vi.mocked(restoreManagedUser).mockResolvedValue({
      status: 'invited',
      expiresAt,
    });
    vi.mocked(sendInviteEmail).mockResolvedValue(true);

    await restoreUser('u1');

    expect(sendInviteEmail).toHaveBeenCalledWith({
      email: 'tina@example.com',
      name: 'Tina Singh',
      providerName: 'Test Provider',
      invitedByName: 'Nia Ito',
      signInUrl: 'https://gascd.example/login',
      expiresAt,
      reference: 'u1',
    });
    expect(redirect).toHaveBeenCalledWith(
      '/manage-users?done=restored&user=u1&email=sent'
    );
  });

  it('will not remove a CQC registered user', async () => {
    vi.mocked(getChangeableUser).mockResolvedValue(
      changeable('Active', false) as any
    );

    expect((await removeUser('u1')).error).toMatch(/permission/);
    expect(removeManagedUser).not.toHaveBeenCalled();
  });

  it('will not remove a user twice', async () => {
    vi.mocked(getChangeableUser).mockResolvedValue(
      changeable('Removed') as any
    );

    expect((await removeUser('u1')).error).toMatch(/permission/);
  });
});

describe('resendInvite and cancelInvite', () => {
  it('resends an expired invite with a new email', async () => {
    const expiresAt = new Date('2026-12-05T10:00:00Z');
    vi.mocked(getChangeableUser).mockResolvedValue(
      changeable('Invite expired') as any
    );
    vi.mocked(resendManagedInvite).mockResolvedValue({
      status: 'invited',
      expiresAt,
    });
    vi.mocked(sendInviteEmail).mockResolvedValue(true);

    await resendInvite('u1');

    expect(sendInviteEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'tina@example.com', expiresAt })
    );
    expect(redirect).toHaveBeenCalledWith(
      '/manage-users?done=resent&user=u1&email=sent'
    );
  });

  it('cancels a pending invite without emailing', async () => {
    vi.mocked(getChangeableUser).mockResolvedValue(
      changeable('Invited') as any
    );
    vi.mocked(cancelManagedInvite).mockResolvedValue({ status: 'suspended' });

    await cancelInvite('u1');

    expect(sendInviteEmail).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith(
      '/manage-users?done=cancelled&user=u1'
    );
  });

  it('only resends or cancels invites, not active users', async () => {
    vi.mocked(getChangeableUser).mockResolvedValue(changeable('Active') as any);

    expect((await resendInvite('u1')).error).toMatch(/permission/);
    expect((await cancelInvite('u1')).error).toMatch(/permission/);
    expect(resendManagedInvite).not.toHaveBeenCalled();
    expect(cancelManagedInvite).not.toHaveBeenCalled();
  });
});
