import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import React from 'react';
import CqcRatingsByLaSection from '@/components/data-components/CqcRatingsByLaSection';
import { ComparatorControls } from '@/components/charts/peer-group/useComparatorControls';
import { usePeerGroupData } from '@/components/charts/peer-group/usePeerGroupData';
import { PeerGroupData } from '@/components/charts/peer-group/types';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import { Indicator } from '@/data/interfaces/Indicator';

vi.mock('@/services/analytics/analyticsService');
vi.mock('@/services/indicator/IndicatorFetchService');
vi.mock('@/components/charts/peer-group/usePeerGroupData');
vi.mock('next/navigation', () => ({ useRouter: () => ({}) }));
vi.mock('react-plotly.js', () => ({
  default: ({ data, layout }: { data: any[]; layout: any }) => (
    <div data-testid="plotly-mock">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-layout">{JSON.stringify(layout)}</div>
    </div>
  ),
}));

const mockGetData = vi.mocked(IndicatorFetchService.getData);
const mockUsePeerGroupData = vi.mocked(usePeerGroupData);

const indicator = (
  metric_id: string,
  location_type: string,
  data_point: number
) =>
  ({
    metric_id,
    location_type,
    location_id: location_type,
    metric_date: '2024-04-01',
    data_point,
  }) as Indicator;

// Every count is the same whichever rating or service type is asked for, so
// each location's percentage is fixed: the count metric over the inspected one
const COUNTS: Record<string, [number, number]> = {
  LA: [30, 40],
  Regional: [300, 500],
  National: [6000, 10000],
};
const PEER_COUNTS: Record<string, [number, number]> = {
  Kent: [45, 50],
  Medway: [10, 40],
  // No inspected locations
  Slough: [0, 0],
};

const isInspectedMetric = (metricId: string) =>
  metricId.startsWith('cqci_num_inspected_');

const peerDataFor = (metricId: string): PeerGroupData => ({
  localAuthorityPeers: Object.entries(PEER_COUNTS).map(
    ([displayName, [count, inspected]], i) => ({
      code: `E0${i}`,
      displayName,
      peerRanking: i + 1,
      metricValue: isInspectedMetric(metricId) ? inspected : count,
    })
  ),
  averagePeerGroup: null,
  nationalAverage: null,
});

const comparator = {
  groups: [],
  selection: { kind: 'nhs_peer_group' },
  comparatorIsRegion: false,
  comparatorLabel: undefined,
  comparatorAverageLabel: 'NHS peer group (average)',
  comparatorTotalLabel: 'NHS peer group',
  renderComparatorControl: (idPrefix: string) => <p>comparator {idPrefix}</p>,
} as unknown as ComparatorControls;

const renderSection = (
  props: Partial<React.ComponentProps<typeof CqcRatingsByLaSection>> = {}
) =>
  render(
    <CqcRatingsByLaSection
      id="2"
      figureNumber={2}
      laCode="E99"
      laName="Mid Suffolk"
      regionLabel="East of England"
      comparator={comparator}
      {...props}
    />
  );

const table = () => screen.getByRole('table');
const bodyRows = () =>
  within(within(table()).getAllByRole('rowgroup')[1])
    .getAllByRole('row')
    .map((row) => [
      within(row).getByRole('rowheader').textContent,
      within(row).getByRole('cell').textContent,
    ]);
// The metrics most recently asked for, by both requests
const requestedBaseMetrics = () =>
  mockGetData.mock.calls[mockGetData.mock.calls.length - 1][0].metric_ids;
const requestedPeerMetrics = () =>
  mockUsePeerGroupData.mock.calls[
    mockUsePeerGroupData.mock.calls.length - 1
  ][1];
const loaded = () => waitFor(() => expect(bodyRows()[0][1]).toBe('60.0%'));

beforeEach(() => {
  mockGetData.mockReset();
  mockUsePeerGroupData.mockReset();
  mockGetData.mockImplementation(async ({ metric_ids }) =>
    metric_ids.flatMap((metricId) =>
      Object.entries(COUNTS).map(([locationType, [count, inspected]]) =>
        indicator(
          metricId,
          locationType,
          isInspectedMetric(metricId) ? inspected : count
        )
      )
    )
  );
  mockUsePeerGroupData.mockImplementation((_laCode, metricCodes) => ({
    dataByMetric: Object.fromEntries(
      metricCodes.map((metricCode) => [metricCode, peerDataFor(metricCode)])
    ),
    loading: false,
    error: false,
  }));
});

describe('CqcRatingsByLaSection', () => {
  it('shows the title, the methodology link and the tabs with the chart first', async () => {
    renderSection();
    await loaded();

    expect(
      screen.getByRole('heading', {
        name: 'CQC ratings of inspected adult social care locations by local authority',
        level: 3,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'how the number and percentage of inspected adult social care locations by CQC rating are calculated',
      })
    ).toHaveAttribute(
      'href',
      '/help/cqc-ratings-of-adult-social-care-locations'
    );
    expect(
      screen
        .getAllByRole('link', { name: /^(Table|Chart|Download)$/ })
        .map((tab) => tab.textContent)
    ).toEqual(['Chart', 'Table', 'Download']);
  });

  it('starts on Good, for all service types', async () => {
    renderSection();
    await loaded();

    expect(screen.getAllByLabelText('CQC rating')[0]).toHaveValue('good');
    expect(requestedBaseMetrics()).toEqual([
      'cqcr_num_good_adult_social_care',
      'cqci_num_inspected_adult_social_care',
    ]);
    expect(requestedPeerMetrics()).toEqual(requestedBaseMetrics());
  });

  it("leads the table with England, the region and the comparison group, then the user's LA, then the comparison LAs", async () => {
    renderSection();
    await loaded();

    expect(bodyRows()).toEqual([
      ['England (national)', '60.0%'],
      ['East of England (regional)', '60.0%'],
      // Kent's 45 and Medway's 10 of their 90 inspected: Slough has none
      ['NHS peer group', '61.1%'],
      ['Mid Suffolk', '75.0%'],
      ['Kent', '90.0%'],
      ['Medway', '25.0%'],
      ['Slough', 'N/A'],
    ]);
    expect(within(table()).queryByText(/average/i)).not.toBeInTheDocument();
  });

  it('explains an LA shown as not available', async () => {
    renderSection();
    await loaded();

    expect(
      screen.getByText(
        /N\/A means a local authority has no inspected locations/
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Not shown: Slough\./)).toBeInTheDocument();
  });

  it('names the rating, the areas, the service types and the date in the titles', async () => {
    renderSection();
    await loaded();

    expect(table()).toHaveAccessibleName(
      /^Table 2: percentage of inspected adult social care locations rated Good – Mid Suffolk LA, NHS peer group, East of England \(regional\) and England \(national\), all service types, 1 April 2024/
    );
    expect(
      screen.getByText(
        'Figure 2: percentage of inspected adult social care locations rated Good – Mid Suffolk LA, NHS peer group, East of England (regional) and England (national), all service types, 1 April 2024'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'This chart compares Mid Suffolk with its NHS Peer Group for the percentage of inspected adult social care locations rated Good.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Percentage rated good/ })
    ).toBeInTheDocument();
  });

  it('draws the bars from 0% to 100% with the count behind each on hover', async () => {
    renderSection();
    await loaded();

    const [trace] = JSON.parse(
      screen.getByTestId('chart-data').textContent ?? '[]'
    );
    expect(trace.y).toEqual(['Kent', '<b>Mid Suffolk</b>', 'Medway']);
    expect(trace.x).toEqual([90, 75, 25]);
    expect(trace.customdata).toEqual(['45', '30', '10']);
    expect(trace.hovertemplate).toBe(
      '<b>%{y}</b><br>%{x:.1f}%<br>(%{customdata})<extra></extra>'
    );

    const layout = JSON.parse(
      screen.getByTestId('chart-layout').textContent ?? '{}'
    );
    expect(layout.xaxis.range).toEqual([0, 100]);
  });

  it("draws the comparison group's, England's and the region's percentages as reference lines, as the other peer group charts do", async () => {
    renderSection();
    await loaded();

    const layout = JSON.parse(
      screen.getByTestId('chart-layout').textContent ?? '{}'
    );
    const lines = layout.shapes.filter((shape: any) => shape.type === 'line');
    expect(lines.map((line: any) => line.x0)).toEqual([61.1, 60, 60]);
    expect(screen.getByText('NHS peer group (61.1%)')).toBeInTheDocument();
    expect(screen.getByText('England (national) (60.0%)')).toBeInTheDocument();
    expect(
      screen.getByText('East of England (regional) (60.0%)')
    ).toBeInTheDocument();
  });

  it('shows the NHS peer group beside the region, in the table and on the chart, when the region is selected', async () => {
    renderSection({
      comparator: {
        ...comparator,
        comparatorIsRegion: true,
        comparatorAverageLabel: 'East of England (regional average)',
      } as unknown as ComparatorControls,
    });
    await loaded();

    expect(bodyRows().slice(0, 4)).toEqual([
      ['England (national)', '60.0%'],
      ['East of England (regional)', '60.0%'],
      ['NHS peer group', '61.1%'],
      ['Mid Suffolk', '75.0%'],
    ]);
    // The NHS peer group's counts are asked for alongside the region's
    expect(
      mockUsePeerGroupData.mock.calls.some(
        ([laCode, , selection]) =>
          laCode === 'E99' && selection.kind === 'nhs_peer_group'
      )
    ).toBe(true);
    const layout = JSON.parse(
      screen.getByTestId('chart-layout').textContent ?? '{}'
    );
    const lines = layout.shapes.filter((shape: any) => shape.type === 'line');
    expect(lines.map((line: any) => line.x0)).toEqual([61.1, 60, 60]);
    expect(screen.getByText('NHS peer group (61.1%)')).toBeInTheDocument();
  });

  it('asks for the chosen rating and names it in the titles', async () => {
    renderSection();
    await loaded();

    fireEvent.change(screen.getAllByLabelText('CQC rating')[0], {
      target: { value: 'requires_improvement' },
    });

    await waitFor(() =>
      expect(requestedBaseMetrics()).toEqual([
        'cqcr_num_requires_improvement_adult_social_care',
        'cqci_num_inspected_adult_social_care',
      ])
    );
    expect(requestedPeerMetrics()).toEqual(requestedBaseMetrics());
    await waitFor(() =>
      expect(table()).toHaveAccessibleName(/rated Requires improvement/)
    );
    expect(
      screen.getByRole('button', {
        name: /Percentage rated requires improvement/,
      })
    ).toBeInTheDocument();
    // The choice is the section's, so every tab's control follows it
    for (const select of screen.getAllByLabelText('CQC rating')) {
      expect(select).toHaveValue('requires_improvement');
    }
  });

  it('offers the four ratings a location can be benchmarked on', async () => {
    renderSection();
    await loaded();

    expect(
      within(screen.getAllByLabelText('CQC rating')[0])
        .getAllByRole('option')
        .map((option) => option.textContent)
    ).toEqual(['Outstanding', 'Good', 'Requires improvement', 'Inadequate']);
  });

  it('asks for the service types applied and names them in the titles', async () => {
    renderSection();
    await loaded();

    fireEvent.click(screen.getAllByRole('button', { name: /Show filters/ })[0]);
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Supported living service' })
    );
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Domiciliary care service' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() =>
      expect(requestedBaseMetrics()).toEqual([
        'cqcr_num_good_domiciliary_care',
        'cqcr_num_good_supported_living',
        'cqci_num_inspected_domiciliary_care',
        'cqci_num_inspected_supported_living',
      ])
    );
    expect(requestedPeerMetrics()).toEqual(requestedBaseMetrics());
    await waitFor(() =>
      expect(table()).toHaveAccessibleName(
        /England \(national\), domiciliary care service and supported living service, 1 April 2024/
      )
    );
    // Two service types of the same counts leave every percentage as it was
    expect(bodyRows()[3]).toEqual(['Mid Suffolk', '75.0%']);
  });

  it('repeats the controls in every tab', async () => {
    renderSection();
    await loaded();

    for (const tab of ['table', 'chart', 'download']) {
      expect(
        screen.getByText(`comparator comparator-${tab}-2`)
      ).toBeInTheDocument();
    }
    expect(screen.getAllByLabelText('CQC rating')).toHaveLength(3);
    expect(
      screen.getAllByRole('button', { name: /Show filters/ })
    ).toHaveLength(3);
  });

  it('offers the table as a CSV download', async () => {
    renderSection();
    await loaded();

    expect(
      screen.getByRole('link', {
        name: 'Export CQC ratings of inspected adult social care locations by local authority table data (CSV)',
      })
    ).toBeInTheDocument();
  });

  it("waits for the user's locations before asking for data", () => {
    renderSection({ laCode: undefined });
    expect(mockGetData).not.toHaveBeenCalled();
  });

  it('shows the chart as unavailable when the data cannot be fetched', async () => {
    mockGetData.mockRejectedValue(new Error('Failed'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderSection();

    await waitFor(() =>
      expect(screen.getByText('Data not available')).toBeInTheDocument()
    );
  });
});
