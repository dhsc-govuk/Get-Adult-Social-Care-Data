import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import Pagination from '@/components/common/pagination/Pagination';

const pageHref = (page: number) => `/results?page=${page}`;

describe('Pagination', () => {
  it('links to each page and marks the current one', () => {
    render(<Pagination currentPage={2} totalPages={3} pageHref={pageHref} />);

    expect(screen.getByRole('link', { name: 'Page 1' })).toHaveAttribute(
      'href',
      '/results?page=1'
    );
    expect(screen.getByRole('link', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: /Previous/ })).toHaveAttribute(
      'href',
      '/results?page=1'
    );
    expect(screen.getByRole('link', { name: /Next/ })).toHaveAttribute(
      'href',
      '/results?page=3'
    );
  });

  it('has no previous link on the first page or next link on the last', () => {
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={3} pageHref={pageHref} />
    );
    expect(
      screen.queryByRole('link', { name: /Previous/ })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Next/ })).toBeInTheDocument();

    rerender(<Pagination currentPage={3} totalPages={3} pageHref={pageHref} />);
    expect(
      screen.queryByRole('link', { name: /Next/ })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Previous/ })).toBeInTheDocument();
  });

  it('calls onPageChange with the page selected', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        pageHref={() => '#'}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByRole('link', { name: /Next/ }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    fireEvent.click(screen.getByRole('link', { name: /Previous/ }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    fireEvent.click(screen.getByRole('link', { name: 'Page 5' }));
    expect(onPageChange).toHaveBeenLastCalledWith(5);
  });
});
