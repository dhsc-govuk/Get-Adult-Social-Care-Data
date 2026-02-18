import { render, screen, waitFor } from '@testing-library/react';
import SubCatergoryTable from '@/components/tables/SubCatergoryTable';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
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

  test('fetches data and displays correctly in the SubCatergoryTable component', async () => {
    vi.spyOn(IndicatorFetchService, 'getData').mockResolvedValue(mockTableData);

    render(
      <SubCatergoryTable
        columnHeaders={mockTableColumnHeaders}
        rowHeaders={mockTableRowHeaders}
        data={mockTableData}
        showCareProvider={false}
      ></SubCatergoryTable>
    );

    await waitFor(() => {
      mockTableData.forEach((item) => {
        expect(screen.getByText(item.data_point)).toBeInTheDocument();
      });
    });
  });
  test('Displays the row and column headers correctly in the SubCatergoryTable component', async () => {
    vi.spyOn(IndicatorFetchService, 'getData').mockResolvedValue(mockTableData);

    render(
      <SubCatergoryTable
        columnHeaders={mockTableColumnHeaders}
        rowHeaders={mockTableRowHeaders}
        data={mockTableData}
        showCareProvider={false}
        totalsRows={['Population']}
      ></SubCatergoryTable>
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

  test('fetches data and displays correctly in the SubCatergoryTable component when data is currency', async () => {
    vi.spyOn(IndicatorFetchService, 'getData').mockResolvedValue(mockTableData);

    render(
      <SubCatergoryTable
        columnHeaders={mockTableColumnHeaders}
        rowHeaders={mockTableRowHeaders}
        data={mockTableData}
        showCareProvider={false}
        percentageRows={percentageMock}
      ></SubCatergoryTable>
    );

    await waitFor(() => {
      mockTableData.forEach((item) => {
        const expectedDataPoint = `£${item.data_point}`;

        expect(screen.getByText(expectedDataPoint)).toBeInTheDocument();
      });
    });
  });

  test('fetches data and displays correctly in the SubCatergoryTable component when there are percentage rows added', async () => {
    vi.spyOn(IndicatorFetchService, 'getData').mockResolvedValue(mockTableData);

    render(
      <SubCatergoryTable
        columnHeaders={mockTableColumnHeaders}
        rowHeaders={mockTableRowHeaders}
        data={mockTableData}
        showCareProvider={false}
        percentageRows={percentageMock}
        currency={true}
      ></SubCatergoryTable>
    );

    await waitFor(() => {
      mockTableData.forEach((item) => {
        const shouldBePercentage = percentageMock.some(
          (percentageRow: string) => percentageRow === item.metric_id
        );

        const expectedDataPoint = shouldBePercentage
          ? `${item.data_point}%`
          : item.data_point;

        expect(screen.getByText(expectedDataPoint)).toBeInTheDocument();
      });
    });
  });

  test('Displays the correct Data and headers when showCareProvider flag is true', async () => {
    vi.spyOn(IndicatorFetchService, 'getData').mockResolvedValue(
      mockTableDataWithCareProvider
    );

    render(
      <SubCatergoryTable
        columnHeaders={mockTableColumnHeadersCareProvider}
        rowHeaders={mockTableRowHeadersCareProvider}
        data={mockTableDataWithCareProvider}
        careProviderMedianMetrics={mockCareProviderMedianMetrics}
        showCareProvider={true}
      ></SubCatergoryTable>
    );
    await waitFor(() => {
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
