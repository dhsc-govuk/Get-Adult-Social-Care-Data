import { render, screen } from '@testing-library/react';
import LogoutButton from '../../../src/components/common/buttons/logOutButton';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.post('/api/auth/logout', async () => {
    return HttpResponse.json({
      logoutUrl: 'https://exampleAzureEndpoint.com/logout',
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Logout Button component', () => {
  test('is rendered', () => {
    render(<LogoutButton />);
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });
});
