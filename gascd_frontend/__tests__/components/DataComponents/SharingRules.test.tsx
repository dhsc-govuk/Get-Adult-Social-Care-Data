import { render, screen } from '@testing-library/react';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import SharingRulesTableRow from '@/components/data-components/SharingRulesTableRow';

const mockPathname = vi.fn(() => '/help/percentage-beds-occupied');
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

const details = () => (
  <DataIndicatorDetails
    title="Percentage of adult social care beds occupied"
    whatThisMeasures={<p>What this measures</p>}
    source={<p>Capacity Tracker</p>}
    updateFrequency="Daily"
    methodology={<p>Methodology</p>}
    limitations={<p>Limitations</p>}
  />
);

describe('DataIndicatorDetails sharing rules row', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/help/percentage-beds-occupied');
  });

  it('resolves the label, statement and reasoning from the page route', () => {
    render(details());

    const row = screen.getByTestId('sharing-rules-row');
    expect(row.textContent).toContain('Sharing rules');
    expect(row.textContent).toContain('Not for sharing externally');
    expect(row.textContent).toContain(
      'The data in the chart is not to be shared outside your organisation.'
    );
    expect(row.textContent).toContain('protected by a data sharing agreement');
    expect(row.textContent).toContain('AI tools that are outwards facing');
  });

  it('resolves a different category for a different page', () => {
    mockPathname.mockReturnValue('/help/population-size');
    render(details());

    const row = screen.getByTestId('sharing-rules-row');
    expect(row.textContent).toContain('Published data');
    expect(row.textContent).toContain('In the public domain.');
    expect(row.textContent).not.toContain('AI tools that are outwards facing');
  });

  it('still resolves when the service is served under a base path', () => {
    mockPathname.mockReturnValue(
      '/get-adult-social-care-data/help/population-size'
    );
    render(details());

    expect(screen.getByTestId('sharing-rules-row').textContent).toContain(
      'Published data'
    );
  });

  it('omits the row for a page that is not in the agreed list', () => {
    mockPathname.mockReturnValue('/help/not-a-real-indicator');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(details());

    expect(screen.queryByTestId('sharing-rules-row')).not.toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('not-a-real-indicator')
    );
    warn.mockRestore();
  });
});

describe('SharingRulesTableRow', () => {
  it('renders the row for a table based details page', () => {
    mockPathname.mockReturnValue('/help/beds-care-provider-location');

    render(
      <table>
        <tbody>
          <SharingRulesTableRow />
        </tbody>
      </table>
    );

    const row = screen.getByTestId('sharing-rules-row');
    expect(row.textContent).toContain('Sharing rules');
    expect(row.textContent).toContain('Share at your own discretion');
    expect(row.textContent).toContain(
      'You can only share data externally where it was provided by your organisation.'
    );
    expect(row.textContent).toContain('only share data at care provider level');
  });
});
