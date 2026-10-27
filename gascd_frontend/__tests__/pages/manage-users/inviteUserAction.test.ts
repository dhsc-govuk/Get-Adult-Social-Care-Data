import { inviteUser } from '../../../app/(protected)/manage-users/invite/actions';
import { getCurrentUser } from '@/lib/permissions';
import {
  emailHasAccount,
  getApproverContext,
  inviteReader,
} from '@/lib/manageUsersServer';
import { redirect } from 'next/navigation';

vi.mock('server-only', () => ({ default: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/permissions', () => ({ getCurrentUser: vi.fn() }));
vi.mock('@/lib/manageUsersServer', () => ({
  emailHasAccount: vi.fn(),
  getApproverContext: vi.fn(),
  inviteReader: vi.fn(),
}));
vi.mock('@/utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn() },
}));

const approver = { id: 'approver-1', email: 'ni@example.org' };
const context = {
  providerCode: 'P1',
  providerName: 'Test Provider',
  basis: 'registered_manager',
  providerWide: false,
  locations: [{ code: 'L1', name: 'Ivy House' }],
};
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
  vi.mocked(inviteReader).mockResolvedValue('new-user');
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
    await inviteUser(fields);

    expect(inviteReader).toHaveBeenCalledWith(approver, context, fields);
    expect(redirect).toHaveBeenCalledWith('/manage-users?added=new-user');
  });

  it('reports a service error when the write fails', async () => {
    vi.mocked(inviteReader).mockRejectedValue(new Error('db down'));

    const result = await inviteUser(fields);

    expect(result.error).toMatch(/problem with the service/);
    expect(redirect).not.toHaveBeenCalled();
  });
});
