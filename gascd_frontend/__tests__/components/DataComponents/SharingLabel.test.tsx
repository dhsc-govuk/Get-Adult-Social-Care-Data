import { render, screen } from '@testing-library/react';
import SharingLabel from '@/components/data-components/SharingLabel';
import SharingSourceNote from '@/components/data-components/SharingSourceNote';
import { SHARING_CATEGORIES } from '@/data/sharingCategories';

describe('SharingLabel', () => {
  it('renders nothing when there is no category', () => {
    render(<SharingLabel />);
    expect(screen.queryByTestId('sharing-label')).not.toBeInTheDocument();
  });

  it('renders the published data label with no warning icon', () => {
    render(<SharingLabel category={SHARING_CATEGORIES.published} />);

    expect(
      screen.getByText('This data can be shared outside your organisation.')
    ).toBeInTheDocument();

    const tag = screen.getByText('Published data');
    expect(tag).toHaveClass('govuk-tag', 'govuk-tag--green');
    expect(screen.queryByText('Warning')).not.toBeInTheDocument();
  });

  it('renders the not for sharing externally label with a warning icon', () => {
    render(
      <SharingLabel category={SHARING_CATEGORIES['not-for-external-sharing']} />
    );

    expect(
      screen.getByText(
        'The data in the chart is not to be shared outside your organisation.'
      )
    ).toBeInTheDocument();

    const tag = screen.getByText('Not for sharing externally');
    expect(tag).toHaveClass('govuk-tag', 'govuk-tag--orange');
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('renders the share at your own discretion label with a warning icon', () => {
    render(<SharingLabel category={SHARING_CATEGORIES.discretion} />);

    expect(
      screen.getByText(
        'You can only share data externally where it was provided by your organisation.'
      )
    ).toBeInTheDocument();

    const tag = screen.getByText('Share at your own discretion');
    expect(tag).toHaveClass('govuk-tag', 'govuk-tag--blue');
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('announces the tag as the sharing label to assistive technology', () => {
    render(<SharingLabel category={SHARING_CATEGORIES.published} />);

    const prefix = screen.getByText('Sharing label:');
    expect(prefix).toHaveClass('govuk-visually-hidden');
  });
});

describe('SharingSourceNote', () => {
  it('renders the additional source note for restricted metrics', () => {
    render(
      <SharingSourceNote
        category={SHARING_CATEGORIES['not-for-external-sharing']}
      />
    );

    expect(screen.getByTestId('sharing-source-note').textContent).toContain(
      'AI tools that are outwards facing'
    );
  });

  it('renders nothing for the other categories', () => {
    const { container } = render(
      <SharingSourceNote category={SHARING_CATEGORIES.published} />
    );
    expect(container).toBeEmptyDOMElement();

    const discretion = render(
      <SharingSourceNote category={SHARING_CATEGORIES.discretion} />
    );
    expect(discretion.container).toBeEmptyDOMElement();
  });
});
