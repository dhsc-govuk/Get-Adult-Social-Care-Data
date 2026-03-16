import { render, screen } from '@testing-library/react';
import HomePage from '../../app/(protected)/home/page';
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

describe('HomePage', () => {
  beforeAll(() => {
    vi.clearAllMocks();
  });

  it('should render the heading, body text, and a link', async () => {
    // render(<HomePage />);
    // This is a server component page, so we need to render it slightly differently
    const ResolvedPage = await HomePage({});
    render(ResolvedPage);

    // 1. Check for the main heading
    // We use getByRole to find the heading element. The 'name' option is an
    // accessible way to find headings by their text content (case-insensitive).
    const headingElement = screen.getByRole('heading', {
      name: /Get adult social care data/i,
      level: 1,
    });
    expect(headingElement).toBeInTheDocument();

    // 2. Check for some body text
    // getByText is a straightforward way to find non-interactive text content.
    const bodyTextElement = screen.getByText(
      /This service shows local and regional statistics based on your selected location./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    // 3. Check for the presence of a link
    // We find the link by its role and accessible name (the text it displays).
    // This is generally more robust than checking the href directly at first.
    const linkElement = screen.getByRole('link', {
      name: /Care home beds and occupancy levels/i,
    });
    expect(linkElement).toBeInTheDocument();

    const linkElement2 = screen.getByRole('link', {
      name: /Population needs/i,
    });
    expect(linkElement2).toBeInTheDocument();
    expect(linkElement2).toHaveAttribute(
      'href',
      'topics/population-needs/subtopics'
    );
  });

  it('should not render LA links to CP users', async () => {
    mockGetSession.mockResolvedValue(mockSession);
    // render(<HomePage />);
    // This is a server component page, so we need to render it slightly differently
    const ResolvedPage = await HomePage({});
    render(ResolvedPage);

    const laLink = screen.queryByRole('link', {
      name: /Future planning/i,
    });
    expect(laLink).not.toBeInTheDocument();
  });

  it('should render LA links to LA users', async () => {
    mockGetSession.mockResolvedValue(mockSessionLAUser);

    // render(<HomePage />);
    // This is a server component page, so we need to render it slightly differently
    const ResolvedPage = await HomePage({});
    render(ResolvedPage);

    const laLink = screen.getByRole('link', {
      name: /Future planning/i,
    });
    expect(laLink).toBeInTheDocument();
    expect(laLink).toHaveAttribute('href', 'topics/future-planning/subtopics');
  });
});
