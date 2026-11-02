import { render, screen } from '@testing-library/react';
import RemoveUserPage from '../../../app/(protected)/manage-users/[userId]/remove/page';
import { getCurrentUser } from '@/lib/permissions';
import { getChangeableUser } from '@/lib/manageUsersServer';
import { mockSession } from '@/test-utils/test-utils';

vi.mock('@/lib/permissions', () => ({ getCurrentUser: vi.fn() }));
vi.mock('@/lib/manageUsersServer', () => ({ getChangeableUser: vi.fn() }));
vi.mock('../../../app/(protected)/manage-users/[userId]/ConfirmChange', () => ({
  default: () => null,
}));
vi.mock('@/components/common/layout/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const ni = {
  providerCode: 'P1',
  providerName: 'Test Care Provider 1',
  basis: 'nominated_individual',
  providerWide: true,
  locations: [],
};
const rm = { ...ni, basis: 'registered_manager', providerWide: false };

const renderFor = async (context: object, user: object) => {
  vi.mocked(getChangeableUser).mockResolvedValue({
    context,
    grants: [],
    user: {
      userId: 'u1',
      name: 'Priya Shah',
      email: 'priya@example.org',
      allLocations: false,
      locationNames: [],
      canRemove: true,
      status: 'Active',
      ...user,
    },
  } as any);
  render(await RemoveUserPage({ params: Promise.resolve({ userId: 'u1' }) }));
};

const editLink = () =>
  screen.queryByRole('link', { name: 'change their locations' });

beforeEach(() => {
  vi.mocked(getCurrentUser).mockResolvedValue(mockSession.user);
});

describe('RemoveUserPage', () => {
  it('names the provider for an NI removing a user with several locations, and points to Edit', async () => {
    await renderFor(ni, { allLocations: true });
    expect(
      screen.getByText(
        'They will no longer be able to see data for Test Care Provider 1.'
      )
    ).toBeInTheDocument();
    expect(editLink()).toHaveAttribute('href', '/manage-users/u1/edit');
    expect(screen.queryByText(/which you do not manage/)).toBeNull();
  });

  it('names the location when the user only has one', async () => {
    await renderFor(ni, { locationNames: ['Ivy House'] });
    expect(
      screen.getByText('They will no longer be able to see data for Ivy House.')
    ).toBeInTheDocument();
    expect(editLink()).toBeNull();
  });

  it('lists an RM’s locations and says the user may have others', async () => {
    await renderFor(rm, { locationNames: ['Ivy House', 'Oak Lodge'] });
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(
      ['Ivy House', 'Oak Lodge']
    );
    expect(
      screen.getByText(
        'They may have access to other locations, which you do not manage.'
      )
    ).toBeInTheDocument();
    expect(editLink()).toBeInTheDocument();
  });
});
