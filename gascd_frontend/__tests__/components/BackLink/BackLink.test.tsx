import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import BackLink from '@/components/common/back-link/BackLink';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const back = vi.fn();

const setHistoryLength = (length: number) => {
  Object.defineProperty(window.history, 'length', {
    value: length,
    configurable: true,
  });
};

describe('BackLink', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({ back } as any);
    back.mockClear();
  });

  it('returns the user to the page they came from', async () => {
    setHistoryLength(3);
    render(<BackLink />);

    await userEvent.click(screen.getByRole('link', { name: 'Back' }));

    expect(back).toHaveBeenCalledTimes(1);
  });

  it('falls back to the given URL when there is no history to go back to', async () => {
    setHistoryLength(1);
    render(<BackLink fallbackURL="/somewhere" />);

    const backlink = screen.getByRole('link', { name: 'Back' });
    expect(backlink).toHaveAttribute('href', '/somewhere');

    await userEvent.click(backlink);

    expect(back).not.toHaveBeenCalled();
  });

  it('falls back to the home page by default', () => {
    setHistoryLength(1);
    render(<BackLink />);

    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/home'
    );
  });
});
