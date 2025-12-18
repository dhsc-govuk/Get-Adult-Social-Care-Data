import DataLinkCard from '@/components/data-components/DataLinkCard';
import { render, screen } from '@testing-library/react';

describe('DataLinkCard', () => {
  it('renders the component correctly with all data', () => {
    render(
      <DataLinkCard
        label="Test Label"
        description="Test description"
        sources="Test sources"
        updateFrequency="Test update"
        limitations={true}
        url="Test url"
      />
    );

    const urlElement = screen.getByRole('link', {
      name: /Test Label/i,
    });
    expect(urlElement).toBeInTheDocument();
    expect(urlElement).toHaveAttribute('href', 'Test url');

    const descriptionElement = screen.getByText('Test description');
    expect(descriptionElement).toBeInTheDocument();

    const sourceElement = screen.getByText(/Sources: Test sources/i);
    expect(sourceElement).toBeInTheDocument();

    const updateElement = screen.getByText(/Test update/i);
    expect(updateElement).toBeInTheDocument();

    const limitationsElement = screen.getByText(/limitations apply/i);
    expect(limitationsElement).toBeInTheDocument();
  });

  it('does not render missing data', () => {
    render(<DataLinkCard label="Test Label" url="Test url" />);

    const urlElement = screen.getByRole('link', {
      name: /Test Label/i,
    });
    expect(urlElement).toBeInTheDocument();
    expect(urlElement).toHaveAttribute('href', 'Test url');

    const descriptionElement = screen.queryByText('Test description');
    expect(descriptionElement).not.toBeInTheDocument();

    const sourceElement = screen.queryByText(/Sources: Test sources/i);
    expect(sourceElement).not.toBeInTheDocument();

    const updateElement = screen.queryByText(/Test update/i);
    expect(updateElement).not.toBeInTheDocument();

    const limitationsElement = screen.queryByText(/limitations apply/i);
    expect(limitationsElement).not.toBeInTheDocument();
  });

  it('renders correct limitations text', () => {
    render(
      <DataLinkCard
        label="Test Label"
        description="Test description"
        sources="Test sources"
        updateFrequency="Test update"
        limitations={false}
        url="Test url"
      />
    );
    const limitationsElement = screen.queryByText(/limitations might apply/i);
    expect(limitationsElement).toBeInTheDocument();
  });
});
