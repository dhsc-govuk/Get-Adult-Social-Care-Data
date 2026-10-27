import {
  removeUser,
  restoreUser,
  updateUser,
} from '../../../app/(protected)/manage-users/[userId]/actions';
import { getCurrentUser } from '@/lib/permissions';
import {
  getChangeableUser,
  removeManagedUser,
  restoreManagedUser,
  updateManagedUser,
} from '@/lib/manageUsersServer';
import { redirect } from 'next/navigation';

vi.mock('server-only', () => ({ default: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/permissions', () => ({ getCurrentUser: vi.fn() }));
vi.mock('@/lib/manageUsersServer', () => ({
  getChangeableUser: vi.fn(),
  removeManagedUser: vi.fn(),
  restoreManagedUser: vi.fn(),
  updateManagedUser: vi.fn(),
}));
vi.mock('@/utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn() },
}));

const actor = { id: 'approver-1' };
const context = {
  providerCode: 'P1',
  providerName: 'Test Provider',
  basis: 'registered_manager',
  providerWide: false,
  locations: [{ code: 'L1', name: 'Ivy House' }],
};
const changeable = (status: string) => ({
  context,
  grants: [],
  user: { userId: 'u1', name: 'Tina Singh', status },
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
  });

  it('will not remove a user twice', async () => {
    vi.mocked(getChangeableUser).mockResolvedValue(
      changeable('Removed') as any
    );

    expect((await removeUser('u1')).error).toMatch(/permission/);
  });
});
