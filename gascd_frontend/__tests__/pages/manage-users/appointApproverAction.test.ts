import {
  appointApprover,
  checkApprover,
} from '../../../app/(protected)/manage-users/delegated-approvers/appoint/actions';
import { getCurrentUser } from '@/lib/permissions';
import {
  appointBlocker,
  appointDelegatedApprover,
  getApproverContext,
} from '@/lib/manageUsersServer';
import { redirect } from 'next/navigation';
import {
  sendApproverAppointedEmail,
  sendApproverInviteEmail,
} from '@/lib/notify';

vi.mock('server-only', () => ({ default: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/permissions', () => ({ getCurrentUser: vi.fn() }));
vi.mock('@/lib/manageUsersServer', () => ({
  appointBlocker: vi.fn(),
  appointDelegatedApprover: vi.fn(),
  getApproverContext: vi.fn(),
}));
vi.mock('@/lib/notify', () => ({
  sendApproverAppointedEmail: vi.fn(),
  sendApproverInviteEmail: vi.fn(),
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
  registeredEmail: 'ni@example.org',
  name: 'ni@example.org',
  registeredName: 'Nia Ito',
};
const niContext = {
  providerCode: 'P1',
  providerName: 'Test Provider',
  basis: 'nominated_individual',
  providerWide: true,
  locations: [],
};
const EXPIRES_AT = new Date('2026-12-05T10:00:00Z');
const fields = { name: 'Dee Approver', email: 'Dee@Example.com' };

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCurrentUser).mockResolvedValue(ni as any);
  vi.mocked(getApproverContext).mockResolvedValue(niContext as any);
  vi.mocked(appointBlocker).mockResolvedValue(null);
  vi.mocked(appointDelegatedApprover).mockResolvedValue({
    userId: 'da-1',
    name: 'Dee Approver',
    invited: true,
    expiresAt: EXPIRES_AT,
  });
  vi.mocked(sendApproverInviteEmail).mockResolvedValue(true);
  vi.mocked(sendApproverAppointedEmail).mockResolvedValue(true);
});

describe('appointApprover', () => {
  it.each(['registered_manager', 'delegated_approver'])(
    'refuses a %s',
    async (basis) => {
      vi.mocked(getApproverContext).mockResolvedValue({
        ...niContext,
        basis,
      } as any);

      const result = await appointApprover(fields);

      expect(result.error).toBe(
        'You do not have permission to appoint delegated approvers'
      );
      expect(appointDelegatedApprover).not.toHaveBeenCalled();
    }
  );

  it('invites someone new and sends the invitation email', async () => {
    await appointApprover(fields);

    expect(appointDelegatedApprover).toHaveBeenCalledWith(
      ni,
      niContext,
      fields
    );
    expect(sendApproverInviteEmail).toHaveBeenCalledWith({
      email: 'dee@example.com',
      name: 'Dee Approver',
      providerName: 'Test Provider',
      invitedByName: 'Nia Ito',
      signInUrl: 'https://gascd.example/login',
      expiresAt: EXPIRES_AT,
      reference: 'da-1',
    });
    expect(sendApproverAppointedEmail).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith(
      '/manage-users/delegated-approvers/appointed?user=da-1&email=sent'
    );
  });

  it('tells an existing user they are now a delegated approver', async () => {
    vi.mocked(appointDelegatedApprover).mockResolvedValue({
      userId: 'existing',
      name: 'Existing Person',
      invited: false,
      expiresAt: null,
    });
    vi.mocked(sendApproverAppointedEmail).mockResolvedValue(false);

    await appointApprover(fields);

    expect(sendApproverAppointedEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Existing Person',
        reference: 'existing',
      })
    );
    expect(sendApproverInviteEmail).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith(
      '/manage-users/delegated-approvers/appointed?user=existing&email=failed'
    );
  });

  it('shows why an email cannot be appointed', async () => {
    vi.mocked(appointDelegatedApprover).mockResolvedValue({
      error: 'already_approver',
    });

    const result = await appointApprover(fields);

    expect(result.errors.email).toBe(
      'This person is already a delegated approver'
    );
    expect(redirect).not.toHaveBeenCalled();
  });

  it('stops an NI appointing themselves', async () => {
    const result = await appointApprover({
      name: 'Me',
      email: 'NI@example.org',
    });

    expect(result.errors.email).toBe(
      'You cannot appoint yourself as a delegated approver'
    );
    expect(appointDelegatedApprover).not.toHaveBeenCalled();
  });
});

describe('checkApprover', () => {
  it('checks the email before check your answers without saving anything', async () => {
    vi.mocked(appointBlocker).mockResolvedValue('already_approver');

    const result = await checkApprover(fields);

    expect(result.errors.email).toBe(
      'This person is already a delegated approver'
    );
    expect(appointDelegatedApprover).not.toHaveBeenCalled();
  });

  it('passes valid details', async () => {
    expect(await checkApprover(fields)).toEqual({ errors: {} });
  });

  it('reports blank fields', async () => {
    const result = await checkApprover({ name: '', email: '' });

    expect(result.errors).toEqual({
      name: 'Enter their full name',
      email:
        'Enter an email address in the correct format, like name@example.com',
    });
    expect(appointBlocker).not.toHaveBeenCalled();
  });
});
