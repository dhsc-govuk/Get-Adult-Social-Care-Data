import { render, screen } from '@testing-library/react';
import UsersTable from '../../../app/(protected)/manage-users/UsersTable';
import { ManagedUser } from '@/lib/manageUsers';

const user = (overrides: Partial<ManagedUser>): ManagedUser => ({
  userId: 'u1',
  name: 'Priya Shah',
  email: 'priya@example.org',
  role: null,
  allLocations: true,
  locationNames: [],
  grantedBy: 'Nia One',
  grantedAt: new Date('2026-01-05T00:00:00Z'),
  status: 'Active',
  inviteExpiresAt: null,
  canChange: true,
  canRemove: true,
  lockedReason: null,
  ...overrides,
});

describe('UsersTable on the yearly review', () => {
  it('offers only removing, which comes back to the review', () => {
    render(
      <UsersTable
        users={[
          user({}),
          user({ userId: 'u2', name: 'Sam Lee', status: 'Invited' }),
        ]}
        reviewing
      />
    );

    expect(
      screen.getByRole('link', { name: /^Remove access\s*Priya Shah$/ })
    ).toHaveAttribute('href', '/manage-users/u1/remove?from=review');
    expect(
      screen.getByRole('link', { name: /^Cancel invite\s*to Sam Lee$/ })
    ).toHaveAttribute('href', '/manage-users/u2/cancel?from=review');
    expect(screen.queryByRole('link', { name: /^Edit/ })).toBeNull();
  });

  it('shows the date access was given', () => {
    render(<UsersTable users={[user({})]} reviewing />);

    expect(screen.getByText('5 January 2026')).toBeInTheDocument();
  });
});
