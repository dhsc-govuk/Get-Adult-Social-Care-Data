import { render, screen, waitFor } from '@testing-library/react';
import DataTable from '@/components/tables/table';
import PresentDemandService from '@/services/present-demand/presentDemandService';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import userEvent from '@testing-library/user-event';
import {
  mockTableData,
  mockTableColumnHeaders,
  mockTableRowHeaders,
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
});
