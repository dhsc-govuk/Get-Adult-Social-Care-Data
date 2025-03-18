import { render, screen, waitFor } from '@testing-library/react';
import DataTable from '@/components/tables/table';
import PresentDemandService from '@/services/present-demand/presentDemandService';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import userEvent from '@testing-library/user-event';
import {
  mockTableData,
  mockTableDataWithCareProvider,
  mockTableColumnHeaders,
  mockTableRowHeaders,
  percentageMetricMock,
  mockTableColumnHeadersCareProvider,
  mockTableRowHeadersCareProvider,
  mockCareProviderMedianMetrics,
} from '../../../TestData/TableMockData';

describe('Table component tests', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('fetches data and displays correctly in the DataTable component', async () => {
    jest
      .spyOn(IndicatorFetchService, 'getData')
      .mockResolvedValue(mockTableData);

    render(
      <DataTable
        columnHeaders={mockTableColumnHeaders}
        rowHeaders={mockTableRowHeaders}
        data={mockTableData}
        showCareProvider={false}
      ></DataTable>
    );

    await waitFor(() => {
      mockTableData.forEach((item) => {
        expect(screen.getByText(item.data_point)).toBeInTheDocument();
      });
    });
  });
  test('Displays the row headers correctly in the DataTable component', async () => {
    jest
      .spyOn(IndicatorFetchService, 'getData')
      .mockResolvedValue(mockTableData);

    render(
      <DataTable
        columnHeaders={mockTableColumnHeaders}
        rowHeaders={mockTableRowHeaders}
        data={mockTableData}
        showCareProvider={false}
      ></DataTable>
    );

    await waitFor(() => {
      mockTableData.forEach((item) => {
        expect(screen.getByText(item.data_point)).toBeInTheDocument();
      });
    });
  });

  test('fetches data and displays correctly in the DataTable component when there are percentage rows added', async () => {
    jest
      .spyOn(IndicatorFetchService, 'getData')
      .mockResolvedValue(mockTableData);

    render(
      <DataTable
        columnHeaders={mockTableColumnHeaders}
        rowHeaders={mockTableRowHeaders}
        data={mockTableData}
        showCareProvider={false}
        percentageRows={percentageMetricMock}
      ></DataTable>
    );

    await waitFor(() => {
      mockTableData.forEach((item) => {
        const shouldBePercentage = percentageMetricMock.some(
          (percentageRow) => percentageRow.metric_id === item.metric_id
        );

        const expectedDataPoint = shouldBePercentage
          ? `${item.data_point}%`
          : item.data_point;

        expect(screen.getByText(expectedDataPoint)).toBeInTheDocument();
      });
    });
  });

  test('Displays the correct Data and headers when showCareProvider flag is true', async () => {
    jest
      .spyOn(IndicatorFetchService, 'getData')
      .mockResolvedValue(mockTableDataWithCareProvider);

    render(
      <DataTable
        columnHeaders={mockTableColumnHeadersCareProvider}
        rowHeaders={mockTableRowHeadersCareProvider}
        data={mockTableDataWithCareProvider}
        careProviderMedianMetrics={mockCareProviderMedianMetrics}
        showCareProvider={true}
      ></DataTable>
    );
    await waitFor(() => {
      mockTableData.forEach((item) => {
        const shouldBePercentage = percentageMetricMock.some(
          (percentageRow) => percentageRow.metric_id === item.metric_id
        );

        const expectedDataPoint = shouldBePercentage
          ? `${item.data_point}%`
          : item.data_point;

        expect(screen.getByText(expectedDataPoint)).toBeInTheDocument();
      });
    });
  });
});
