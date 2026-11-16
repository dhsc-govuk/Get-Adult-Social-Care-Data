import {
  confirmUserReview,
  submitApproverReview,
} from '../../../app/(protected)/manage-users/review/actions';
import { getCurrentUser } from '@/lib/permissions';
import {
  cancelApproverInvite,
  getApproverContext,
  listDelegatedApprovers,
  removeDelegatedApprover,
} from '@/lib/manageUsersServer';
import { completeReview } from '@/lib/accessReviewServer';
import { sendApproverRemovedEmail } from '@/lib/notify';
import { redirect } from 'next/navigation';

vi.mock('server-only', () => ({ default: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/permissions', () => ({ getCurrentUser: vi.fn() }));
vi.mock('@/lib/manageUsersServer', () => ({
  cancelApproverInvite: vi.fn(),
  getApproverContext: vi.fn(),
  listDelegatedApprovers: vi.fn(),
  removeDelegatedApprover: vi.fn(),
}));
vi.mock('@/lib/accessReviewServer', () => ({ completeReview: vi.fn() }));
vi.mock('@/lib/notify', () => ({ sendApproverRemovedEmail: vi.fn() }));
vi.mock('@/utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn() },
}));

const ni = {
  id: 'ni-1',
  email: 'ni@example.org',
  name: 'ni@example.org',
  registeredName: 'Nia Ito',
};
const context = (basis: string) => ({
  providerCode: 'P1',
  providerName: 'Test Provider',
  basis,
});
const approver = (userId: string, status = 'Active') => ({
  userId,
  name: `Name ${userId}`,
  email: `${userId}@example.org`,
  status,
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCurrentUser).mockResolvedValue(ni as any);
  vi.mocked(getApproverContext).mockResolvedValue(
    context('nominated_individual') as any
  );
  vi.mocked(sendApproverRemovedEmail).mockResolvedValue(true);
});

describe('confirmUserReview', () => {
  it('records the review for the organisation and shows the success banner', async () => {
    await confirmUserReview();

    expect(completeReview).toHaveBeenCalledWith(
      ni,
      context('nominated_individual'),
      'users'
    );
    expect(redirect).toHaveBeenCalledWith('/manage-users?done=users-reviewed');
  });

  it('lets delegated approvers confirm too', async () => {
    vi.mocked(getApproverContext).mockResolvedValue(
      context('delegated_approver') as any
    );

    await confirmUserReview();

    expect(completeReview).toHaveBeenCalled();
  });

  it('refuses RMs, whose access is only to their locations', async () => {
    vi.mocked(getApproverContext).mockResolvedValue(
      context('registered_manager') as any
    );

    const result = await confirmUserReview();

    expect(result).toEqual({ error: expect.stringMatching(/permission/) });
    expect(completeReview).not.toHaveBeenCalled();
  });

  it('shows a service error when saving fails', async () => {
    vi.mocked(completeReview).mockRejectedValue(new Error('db down'));

    const result = await confirmUserReview();

    expect(result).toEqual({ error: expect.stringMatching(/problem/) });
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe('submitApproverReview', () => {
  beforeEach(() => {
    vi.mocked(listDelegatedApprovers).mockResolvedValue([
      approver('da-1'),
      approver('da-2'),
      approver('da-3', 'Invited'),
    ] as any);
  });

  it('removes and emails active approvers, cancels invites, and records the review', async () => {
    await submitApproverReview(['da-1', 'da-3']);

    expect(removeDelegatedApprover).toHaveBeenCalledWith({
      actor: ni,
      context: context('nominated_individual'),
      userId: 'da-1',
    });
    expect(sendApproverRemovedEmail).toHaveBeenCalledTimes(1);
    expect(sendApproverRemovedEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'da-1@example.org',
        contactName: 'Nia Ito',
      })
    );
    expect(cancelApproverInvite).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'da-3' })
    );
    expect(completeReview).toHaveBeenCalledWith(
      ni,
      context('nominated_individual'),
      'approvers',
      { kept: ['da-2'], removed: ['da-1', 'da-3'] }
    );
    expect(redirect).toHaveBeenCalledWith(
      '/manage-users?done=approvers-reviewed&removed=2'
    );
  });

  it('records a review that keeps everyone', async () => {
    await submitApproverReview([]);

    expect(removeDelegatedApprover).not.toHaveBeenCalled();
    expect(completeReview).toHaveBeenCalledWith(
      ni,
      context('nominated_individual'),
      'approvers',
      { kept: ['da-1', 'da-2', 'da-3'], removed: [] }
    );
  });

  it('refuses anyone who is not an NI', async () => {
    vi.mocked(getApproverContext).mockResolvedValue(
      context('delegated_approver') as any
    );

    const result = await submitApproverReview([]);

    expect(result).toEqual({ error: expect.stringMatching(/permission/) });
    expect(completeReview).not.toHaveBeenCalled();
  });

  it('refuses people who are not this organisation’s delegated approvers', async () => {
    const result = await submitApproverReview(['someone-else']);

    expect(result).toEqual({ error: expect.stringMatching(/permission/) });
    expect(removeDelegatedApprover).not.toHaveBeenCalled();
    expect(completeReview).not.toHaveBeenCalled();
  });
});
