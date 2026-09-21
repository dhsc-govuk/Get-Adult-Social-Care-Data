import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OneLoginSignIn from '../../../app/(onboarding-la)/OneLoginSignIn';

const oauth2 = vi.fn();
vi.mock('@/lib/auth-client', () => ({
  authClient: { signIn: { oauth2: (...args: unknown[]) => oauth2(...args) } },
}));

describe('OneLoginSignIn', () => {
  beforeEach(() => oauth2.mockReset());

  it('starts One Login without requesting sign-up', async () => {
    oauth2.mockResolvedValue({ data: { url: 'https://one-login/authorize' } });
    render(<OneLoginSignIn />);

    await userEvent.click(
      screen.getByRole('button', { name: /Sign in with GOV.UK One Login/i })
    );

    expect(oauth2).toHaveBeenCalledTimes(1);
    const body = oauth2.mock.calls[0][0] as Record<string, unknown>;
    expect(body.providerId).toBe('govuk-one-login');
    expect(body.callbackURL).toMatch(/\/home$/);
    expect(body.errorCallbackURL).toMatch(/\/access-denied$/);
    expect(body).not.toHaveProperty('requestSignUp');
  });

  it('shows a service error if One Login cannot be started', async () => {
    oauth2.mockResolvedValue({ error: { message: 'boom' } });
    render(<OneLoginSignIn />);

    await userEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        /problem with the service/i
      )
    );
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeEnabled();
  });
});
