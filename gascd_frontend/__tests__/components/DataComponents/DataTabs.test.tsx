import DataTabs from '@/components/data-components/DataTabs';
import { render, screen } from '@testing-library/react';

describe('DataTabs', () => {
  it('renders the component correctly with all tabs', () => {
    render(
      <DataTabs
        id="1"
        map={<p>Test map</p>}
        chart={<p>Test chart</p>}
        table={<p>Test table</p>}
        textSummary={<p>Test textSummary</p>}
        download={<p>Test download</p>}
      />
    );

    const mapElement = screen.getByText('Map');
    expect(mapElement).toBeInTheDocument();
    expect(mapElement).toHaveAttribute('href', '#map-1');

    const chartElement = screen.getByText('Chart');
    expect(chartElement).toBeInTheDocument();
    expect(chartElement).toHaveAttribute('href', '#chart-1');

    const tableElement = screen.getByText('Table');
    expect(tableElement).toBeInTheDocument();
    expect(tableElement).toHaveAttribute('href', '#table-1');

    const textSummaryElement = screen.getByText('Text Summary');
    expect(textSummaryElement).toBeInTheDocument();
    expect(textSummaryElement).toHaveAttribute('href', '#textSummary-1');

    const downloadElement = screen.getByText('Download');
    expect(downloadElement).toBeInTheDocument();
    expect(downloadElement).toHaveAttribute('href', '#download-1');
  });

  it('does not render tabs it is not given', () => {
    render(<DataTabs id="1" map={<p>Test map</p>} chart={<p>Test chart</p>} />);

    const mapElement = screen.getByText('Map');
    expect(mapElement).toBeInTheDocument();
    expect(mapElement).toHaveAttribute('href', '#map-1');

    const chartElement = screen.getByText('Chart');
    expect(chartElement).toBeInTheDocument();
    expect(chartElement).toHaveAttribute('href', '#chart-1');

    const tableElement = screen.queryByText('Table');
    expect(tableElement).not.toBeInTheDocument();

    const textSummaryElement = screen.queryByText('Text Summary');
    expect(textSummaryElement).not.toBeInTheDocument();

    const downloadElement = screen.queryByText('Download');
    expect(downloadElement).not.toBeInTheDocument();
  });
});
