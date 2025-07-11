/**
 * @jest-environment node
 */
// This test is run under node environment, otherwise the winston logger has issues
import { getServerSession } from 'next-auth';
import AuthLayout from '../../app/(protected)/layout';
import { redirect } from 'next/navigation';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { verifyAuthToken } from '../../src/helpers/auth/verifyAuthToken';

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/helpers/auth/verifyAuthToken', () => ({
  verifyAuthToken: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockedGetServerSession = getServerSession as jest.Mock;
const mockedAuthToken = verifyAuthToken as jest.Mock;
const mockedRedirect = redirect;

describe('Root Layout', () => {
  const mockChildren = React.createElement('div', null, 'Mock Component');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('redirects to login page if no access token is in session', async () => {
    (getServerSession as jest.Mock).mockReturnValue(null);
    await AuthLayout({ children: mockChildren });

    expect(mockedRedirect).toHaveBeenCalledWith('/login');
  });

  test('layout is rendered if access token is in session', async () => {
    mockedGetServerSession.mockResolvedValue({
      accessToken: 'mock-access-token',
    });
    const response = await AuthLayout({ children: mockChildren });
    expect(mockedRedirect).not.toHaveBeenCalled;

    const renderedMarkup = renderToStaticMarkup(response);
    expect(renderedMarkup).toContain('Mock Component');
  });

  test('redirects when token verification fails', async () => {
    mockedGetServerSession.mockResolvedValue({
      accessToken: 'mock-invalid-token',
    });
    mockedAuthToken.mockRejectedValue(new Error('Invalid token'));

    await AuthLayout({ children: mockChildren });
    expect(mockedRedirect).toHaveBeenCalledWith('/login');
  });
});
