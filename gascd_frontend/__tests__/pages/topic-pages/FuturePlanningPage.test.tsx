import { render, screen } from '@testing-library/react';
import FuturePlanningPage from '../../../app/(protected)/topics/future-planning/subtopics/page';
import { auth } from '@/lib/auth';
import { mockSession, mockSessionLAUser } from '@/test-utils/test-utils';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));
const mockGetSession = vi.mocked(auth.api.getSession);

// A server component, so it is awaited before rendering
const renderPage = async () => render(await FuturePlanningPage());

describe('FuturePlanningPage', () => {
  it('should render the heading, body text, and topic links', async () => {
    mockGetSession.mockResolvedValue(mockSession);
    await renderPage();

    expect(
      screen.getByRole('heading', { name: /Future planning/i, level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Find estimated and experimental data on future population needs./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Children in need/i })
    ).toHaveAttribute('href', '/topics/future-planning/children-in-need/data');
  });

  it('only shows population projections to LA users', async () => {
    mockGetSession.mockResolvedValue(mockSession);
    const { unmount } = await renderPage();
    expect(
      screen.queryByRole('link', {
        name: /Population projections within local authorities/i,
      })
    ).not.toBeInTheDocument();
    unmount();

    mockGetSession.mockResolvedValue(mockSessionLAUser);
    await renderPage();
    expect(
      screen.getByRole('link', {
        name: /Population projections within local authorities/i,
      })
    ).toHaveAttribute(
      'href',
      '/topics/future-planning/la-funding-planning/data'
    );
  });
});
