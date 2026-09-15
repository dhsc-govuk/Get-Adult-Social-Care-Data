import { render, screen, waitFor } from '@testing-library/react';
import DataTable from '@/components/tables/table';
import {
  mockTableData,
  mockTableDataWithCareProvider,
  mockTableColumnHeaders,
  mockTableRowHeaders,
  percentageMock,
  mockTableColumnHeadersCareProvider,
  mockTableRowHeadersCareProvider,
  mockCareProviderMedianMetrics,
} from '../../../TestData/TableMockData';

describe('Table component tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('fetches data and displays correctly in the DataTable component', async () => {
    const html = render(
      <DataTable
        columnHeaders={mockTableColumnHeaders}
        rowHeaders={mockTableRowHeaders}
        data={mockTableData}
        showCareProvider={false}
      ></DataTable>
    );

    await waitFor(() => {
      mockTableData.forEach((item) => {
        let expectedDataPoint;
        if (item.data_point === null) {
          expectedDataPoint = '--';
        } else {
          expectedDataPoint = item.data_point;
        }

        expect(html.getByText(expectedDataPoint)).toBeInTheDocument();
      });
      expect(html.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  test('displays Loading correctly in the DataTable component', async () => {
    const html = render(
      <DataTable
        columnHeaders={mockTableColumnHeaders}
        rowHeaders={mockTableRowHeaders}
        data={[]}
        showCareProvider={false}
      ></DataTable>
    );

    await waitFor(() => {
      const loading_els = html.getAllByText('Loading...');
      loading_els.forEach((el) => {
        expect(el).toBeInTheDocument();
      });
      // Every column should say 'loading' when data is empty
      expect(loading_els.length).toBe(
        (mockTableColumnHeaders.length - 1) *
          Object.keys(mockTableRowHeaders).length
      );
    });
  });

  test('fetches data and displays correctly in the DataTable component with small number suppression', async () => {
    const html = render(
      <DataTable
        columnHeaders={mockTableColumnHeaders}
        rowHeaders={mockTableRowHeaders}
        data={mockTableData}
        showCareProvider={false}
        smallNumberSuppression={true}
      ></DataTable>
    );

    await waitFor(() => {
      mockTableData.forEach((item) => {
        let expectedDataPoint;
        if (item.data_point === null) {
          expectedDataPoint = '(*)';
        } else {
          expectedDataPoint = item.data_point;
        }

        expect(html.getByText(expectedDataPoint)).toBeInTheDocument();
      });
      expect(html.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  test('Displays the row and column headers correctly in the DataTable component', async () => {
    render(
      <DataTable
        columnHeaders={mockTableColumnHeaders}
        rowHeaders={mockTableRowHeaders}
        data={mockTableData}
        showCareProvider={false}
      ></DataTable>
    );

    await waitFor(() => {
      mockTableColumnHeaders.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });

      Object.values(mockTableRowHeaders).forEach((value) => {
        if (typeof value === 'string') {
          expect(screen.getByText(value)).toBeInTheDocument();
        }
      });
    });
  });

  test('renders the comparator average column when a ComparatorLabel header is provided', async () => {
    const comparatorData = [
      ...mockTableData,
      {
        metric_id: 'perc_65over',
        metric_date_type: 'Test' as const,
        metric_date: new Date('01/01/2025') as Date,
        location_type: 'ComparatorAverage',
        location_id: 'Test',
        numerator: 50 as number,
        denominator: 50 as number,
        multiplier: 100 as number,
        data_point: 55.5,
        load_date_time: new Date('2025-03-02T20:12:22.550Z') as Date,
      },
    ];

    render(
      <DataTable
        columnHeaders={{
          CPLabel: null,
          LALabel: 'Northumberland',
          RegionLabel: 'North East',
          ComparatorLabel: 'NHS peer group average',
          CountryLabel: 'England',
        }}
        rowHeaders={{ perc_65over: 'Aged 65 and over' }}
        data={comparatorData as any}
        showCareProvider={false}
        percentageRows={['perc_65over']}
      ></DataTable>
    );

    await waitFor(() => {
      expect(screen.getByText('NHS peer group average')).toBeInTheDocument();
      expect(screen.getByText('55.5%')).toBeInTheDocument();
    });
  });

  test('fetches data and displays correctly in the DataTable component when there are percentage rows added', async () => {
    const html = render(
      <DataTable
        columnHeaders={mockTableColumnHeaders}
        rowHeaders={mockTableRowHeaders}
        data={mockTableData}
        showCareProvider={false}
        percentageRows={percentageMock}
      ></DataTable>
    );

    await waitFor(() => {
      mockTableData.forEach((item) => {
        const shouldBePercentage = percentageMock.some(
          (percentageRow: string) => percentageRow === item.metric_id
        );

        let expectedDataPoint;
        if (item.data_point === null) {
          expectedDataPoint = '--';
        } else {
          // Percentages always display with 1 decimal place
          expectedDataPoint = shouldBePercentage
            ? `${item.data_point.toFixed(1)}%`
            : item.data_point;
        }

        expect(html.getByText(expectedDataPoint)).toBeInTheDocument();
      });
      expect(html.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  test('Displays the correct Data and headers when showCareProvider flag is true', async () => {
    render(
      <DataTable
        columnHeaders={mockTableColumnHeadersCareProvider}
        rowHeaders={mockTableRowHeadersCareProvider}
        data={mockTableDataWithCareProvider}
        careProviderMedianMetrics={mockCareProviderMedianMetrics}
        showCareProvider={true}
        percentageRows={percentageMock}
      ></DataTable>
    );
    await waitFor(() => {
      mockTableDataWithCareProvider.forEach((item) => {
        const shouldBePercentage = percentageMock.some(
          (percentageRow: string) => percentageRow === item.metric_id
        );

        const expectedDataPoint = shouldBePercentage
          ? `${item.data_point}%`
          : item.data_point;

        expect(screen.getByText(expectedDataPoint)).toBeInTheDocument();
      });
      mockTableColumnHeadersCareProvider.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
      Object.values(mockTableRowHeadersCareProvider).forEach((value) => {
        if (typeof value === 'string') {
          expect(screen.getByText(value)).toBeInTheDocument();
        }
      });
    });
  });
});
