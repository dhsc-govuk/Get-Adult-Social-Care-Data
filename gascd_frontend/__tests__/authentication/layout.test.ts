import AuthLayout from '../../app/(protected)/layout';
import { redirect } from 'next/navigation';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { mockSession } from '@/test-utils/test-utils';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));
const mockHeaders = vi.mocked(headers);
mockHeaders.mockResolvedValue(new Headers());

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));
const mockGetSession = vi.mocked(auth.api.getSession);

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));
const mockedRedirect = vi.mocked(redirect);

describe('Root Layout', () => {
  const mockChildren = React.createElement('div', null, 'Mock Component');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('redirects to login page if no session', async () => {
    mockGetSession.mockResolvedValue(null);
    await AuthLayout({ children: mockChildren });
    expect(mockedRedirect).toHaveBeenCalledWith('/login');
  });

  test('layout is rendered if valid session', async () => {
    mockGetSession.mockResolvedValue(mockSession);
    const response = await AuthLayout({ children: mockChildren });
    expect(mockedRedirect).not.toHaveBeenCalled();

    const renderedMarkup = renderToStaticMarkup(response);
    expect(renderedMarkup).toContain('Mock Component');
  });
});
