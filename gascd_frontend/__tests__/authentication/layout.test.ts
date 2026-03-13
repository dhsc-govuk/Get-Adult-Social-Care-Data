import AuthLayout from '../../app/(protected)/layout';
import NoAuthLayout from '../../app/(authentication)/layout';
import OnboardingLayout from '../../app/(onboarding)/layout';
import ProtectedLALayout from '../../app/(protected)/topics/(protected-la-metrics)/future-planning/layout';
import { redirect } from 'next/navigation';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import {
  mockSession,
  mockSessionWithLocation,
  mockSessionUnregistered,
  mockSessionEmailMismatch,
  mockSessionEmailMatchCase,
  mockSessionNoConsent,
  mockSessionNoTerms,
  mockSessionLAUser,
} from '@/test-utils/test-utils';

vi.mock('server-only', () => ({
  default: vi.fn(),
}));

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
const mockChildren = React.createElement('div', null, 'Mock Component');

describe('Auth Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('redirects to login page if no session', async () => {
    mockGetSession.mockResolvedValue(null);
    await AuthLayout({ children: mockChildren });
    expect(mockedRedirect).toHaveBeenCalledWith('/login');
  });

  test('redirects to unregistered page if not registered', async () => {
    mockGetSession.mockResolvedValue(mockSessionUnregistered);
    await AuthLayout({ children: mockChildren });
    expect(mockedRedirect).toHaveBeenCalledWith('/access-denied');
  });

  test('redirects to consent page if no consent', async () => {
    mockGetSession.mockResolvedValue(mockSessionNoConsent);
    await AuthLayout({ children: mockChildren });
    expect(mockedRedirect).toHaveBeenCalledWith('/consent');
  });

  test('redirects to terms page if no consent', async () => {
    mockGetSession.mockResolvedValue(mockSessionNoTerms);
    await AuthLayout({ children: mockChildren });
    expect(mockedRedirect).toHaveBeenCalledWith('/accept-terms');
  });

  test('redirects to unregistered page if emails do not match', async () => {
    mockGetSession.mockResolvedValue(mockSessionEmailMismatch);
    await AuthLayout({ children: mockChildren });
    expect(mockedRedirect).toHaveBeenCalledWith('/access-denied');
  });

  test('location picker is rendered if valid session', async () => {
    mockGetSession.mockResolvedValue(mockSession);
    const response = await AuthLayout({ children: mockChildren });
    expect(mockedRedirect).toHaveBeenCalledWith('/location-select');
  });

  test('location picker is rendered valid session and emails are mixed case', async () => {
    mockGetSession.mockResolvedValue(mockSessionEmailMatchCase);
    const response = await AuthLayout({ children: mockChildren });
    expect(mockedRedirect).toHaveBeenCalledWith('/location-select');
  });

  test('content is rendered if valid session and picked location', async () => {
    mockGetSession.mockResolvedValue(mockSessionWithLocation);
    const response = await AuthLayout({ children: mockChildren });

    expect(mockedRedirect).not.toHaveBeenCalled();
    const renderedMarkup = renderToStaticMarkup(response);
    expect(renderedMarkup).toContain('Mock Component');
  });

  test('content is rendered for LA users by default', async () => {
    mockGetSession.mockResolvedValue(mockSessionLAUser);
    const response = await AuthLayout({ children: mockChildren });

    expect(mockedRedirect).not.toHaveBeenCalled();
    const renderedMarkup = renderToStaticMarkup(response);
    expect(renderedMarkup).toContain('Mock Component');
  });
});

describe('Onboarding Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('redirects to login page if no session', async () => {
    mockGetSession.mockResolvedValue(null);
    await OnboardingLayout({ children: mockChildren });
    expect(mockedRedirect).toHaveBeenCalledWith('/login');
  });
});

describe('Login Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders pages normally with no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const response = await NoAuthLayout({ children: mockChildren });
    expect(mockedRedirect).not.toHaveBeenCalled();
    const renderedMarkup = renderToStaticMarkup(response);
    expect(renderedMarkup).toContain('Mock Component');
  });
});

describe('LA Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('redirects to login page if no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const response = await ProtectedLALayout({ children: mockChildren });
    expect(mockedRedirect).toHaveBeenCalledWith('/login');
  });

  test('redirects to home page if not an LA', async () => {
    mockGetSession.mockResolvedValue(mockSession);
    const response = await ProtectedLALayout({ children: mockChildren });
    expect(mockedRedirect).toHaveBeenCalledWith('/');
  });

  test('renders normally if not LA', async () => {
    mockGetSession.mockResolvedValue(mockSessionLAUser);
    const response = await ProtectedLALayout({ children: mockChildren });
    expect(mockedRedirect).not.toHaveBeenCalled();
  });
});
