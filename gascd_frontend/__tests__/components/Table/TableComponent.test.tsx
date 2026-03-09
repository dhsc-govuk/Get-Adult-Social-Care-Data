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
          expectedDataPoint = shouldBePercentage
            ? `${item.data_point}%`
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
