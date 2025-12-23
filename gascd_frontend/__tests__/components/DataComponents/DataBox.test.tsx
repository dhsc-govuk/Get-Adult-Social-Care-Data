import DataBox from '@/components/data-components/DataBox';
import { render, screen } from '@testing-library/react';

describe('DataBox', () => {
  it('renders the component correctly', () => {
    render(<DataBox dataTitle="Test Title" dataInfo={<p>Test info</p>} />);

    const titleText = screen.getByRole('heading', {
      name: /Test Title/i,
      level: 3,
    });
    expect(titleText).toBeInTheDocument();

    const bodyText = screen.getByText('Test info');
    expect(bodyText).toBeInTheDocument();
  });
});
