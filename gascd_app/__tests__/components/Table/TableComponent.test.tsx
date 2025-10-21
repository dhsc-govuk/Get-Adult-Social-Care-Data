import { render, screen, waitFor } from '@testing-library/react';
import DataTable from '@/components/tables/table';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
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

import { vi } from 'vitest';

describe('Table component tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('fetches data and displays correctly in the DataTable component', async () => {
    vi.spyOn(IndicatorFetchService, 'getData').mockResolvedValue(mockTableData);

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
  test('Displays the row and column headers correctly in the DataTable component', async () => {
    vi.spyOn(IndicatorFetchService, 'getData').mockResolvedValue(mockTableData);

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
    vi.spyOn(IndicatorFetchService, 'getData').mockResolvedValue(mockTableData);

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
    vi.spyOn(IndicatorFetchService, 'getData').mockResolvedValue(
      mockTableDataWithCareProvider
    );

    render(
      <DataTable
        columnHeaders={mockTableColumnHeadersCareProvider}
        rowHeaders={mockTableRowHeadersCareProvider}
        data={mockTableDataWithCareProvider}
        careProviderMedianMetrics={mockCareProviderMedianMetrics}
        showCareProvider={true}
        percentageRows={percentageMetricMock}
      ></DataTable>
    );
    await waitFor(() => {
      mockTableDataWithCareProvider.forEach((item) => {
        const shouldBePercentage = percentageMetricMock.some(
          (percentageRow) => percentageRow.metric_id === item.metric_id
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
