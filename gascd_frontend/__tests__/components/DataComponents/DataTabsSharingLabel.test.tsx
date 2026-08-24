import DataTabs from '@/components/data-components/DataTabs';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import * as csvHelpers from '@/helpers/downloadToCsvHelpers';
import { render, screen, fireEvent } from '@testing-library/react';

describe('DataTabs sharing label', () => {
  it('shows the same label on the chart, table and download tabs', () => {
    render(
      <DataTabs
        id="1"
        sharingMetricIds={['bedcount_per_hundred_thousand_adults_total']}
        chart={<p>Test chart</p>}
        table={<p>Test table</p>}
        download={<p>Test download</p>}
      />
    );

    // One label per tab panel, all the same
    const labels = screen.getAllByTestId('sharing-label');
    expect(labels).toHaveLength(3);
    labels.forEach((label) => {
      expect(label.textContent).toContain(
        'The data in the chart is not to be shared outside your organisation.'
      );
      expect(label.textContent).toContain('Not for sharing externally');
    });

    // And the additional source note goes with it
    expect(screen.getAllByTestId('sharing-source-note')).toHaveLength(3);
  });

  it('labels a mixed set of metrics with the most restrictive category', () => {
    render(
      <DataTabs
        id="2"
        sharingMetricIds={['total_population', 'nccc_num_clients_comm_care']}
        table={<p>Test table</p>}
      />
    );

    expect(screen.getByTestId('sharing-label').textContent).toContain(
      'Share at your own discretion'
    );
    expect(screen.queryByTestId('sharing-source-note')).not.toBeInTheDocument();
  });

  it('does not show a label when no metrics are given', () => {
    render(<DataTabs id="3" table={<p>Test table</p>} />);

    expect(screen.queryByTestId('sharing-label')).not.toBeInTheDocument();
    expect(screen.getByText('Test table')).toBeInTheDocument();
  });

  it('gives the download link the same category as the label above it', () => {
    const downloadCSV = vi
      .spyOn(csvHelpers, 'downloadCSV')
      .mockImplementation(() => {});

    render(
      <DataTabs
        id="4"
        sharingMetricIds={['bedcount_per_hundred_thousand_adults_total']}
        chart={<p>Test chart</p>}
        download={
          <DownloadTableDataCSVLink
            rawdata={[{ area: 'Test LA 1', value: '1138' }]}
            filename="test.csv"
            xLabel=""
            downloadType="test"
          />
        }
      />
    );

    fireEvent.click(screen.getByText(/Export test table data/));

    const notice = downloadCSV.mock.calls[0][3];
    expect(notice).toEqual([
      'Sharing label: Not for sharing externally',
      'The data in the chart is not to be shared outside your organisation.',
      expect.stringContaining('AI tools that are outwards facing'),
    ]);

    downloadCSV.mockRestore();
  });

  it('gives the download link no guidance when the tabs have no category', () => {
    const downloadCSV = vi
      .spyOn(csvHelpers, 'downloadCSV')
      .mockImplementation(() => {});

    render(
      <DataTabs
        id="5"
        download={
          <DownloadTableDataCSVLink
            rawdata={[{ area: 'Test LA 1', value: '1138' }]}
            filename="test.csv"
            xLabel=""
            downloadType="test"
          />
        }
      />
    );

    fireEvent.click(screen.getByText(/Export test table data/));

    expect(downloadCSV.mock.calls[0][3]).toEqual([]);
    downloadCSV.mockRestore();
  });
});
