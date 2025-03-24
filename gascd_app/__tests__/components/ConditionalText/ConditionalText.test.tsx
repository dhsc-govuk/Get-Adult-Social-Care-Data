import React from 'react';
import { render, screen } from '@testing-library/react';
import ConditionalText from '@/components/common/conditional-text/ConditionalText';
import * as mockData from '../../../TestData/ConditionalTextMockData';
import { mock } from 'node:test';

describe('Tests for the conditional text component', () => {
  const locationNamesWithCareProvider = [
    'Filter',
    'Test Care Provider',
    'Northumberland',
    'North East',
    'England',
  ];

  const defaultProps = {
    ColumnHeaders: ['Filter', 'Test LA', 'Test Region', 'Test Country'],
    section: 'Drivers',
    data: mockData.mockConditionalTextDataHigher,
    locations: ['Filter', 'Northumberland', 'North East', 'England'],
    metric_Id: 'metric_1',
  };

  test('Renders the correct conditional text when LA data is greater than National Data', () => {
    render(
      <ConditionalText
        {...defaultProps}
        data={mockData.mockConditionalTextDataHigher}
        metric_Id="perc_65over"
      ></ConditionalText>
    );

    expect(screen.getByRole('paragraph')).toHaveTextContent(
      'Test LA has a larger proportion of people aged 65 and over (35%) compared to the national average (30%). This suggests the need for care services adjusted by population size in this local authority may be higher than average.'
    );
  });

  test('Renders the correct conditional text when LA data is lower than National Data', () => {
    render(
      <ConditionalText
        {...defaultProps}
        data={mockData.mockConditionalTextDataLower}
        metric_Id="perc_65over"
      ></ConditionalText>
    );
    expect(screen.getByRole('paragraph')).toHaveTextContent(
      'Test LA has a smaller proportion of people aged 65 and over (20%) compared to the national average (30%). This suggests the need for care services adjusted by population size in this local authority may be lower than average.'
    );
  });

  test('Renders the correct conditional text when LA data is similar to National Data', () => {
    render(
      <ConditionalText
        {...defaultProps}
        data={mockData.mockConditionalTextDataSimilar}
        metric_Id="perc_65over"
      ></ConditionalText>
    );
    expect(screen.getByRole('paragraph')).toHaveTextContent(
      'Test LA has a similar proportion of people aged 65 and over (20%) compared to the national average (20%). This suggests the need for care services adjusted by population size in this local authority may be in line with the national average.'
    );
  });

  test('Renders Loading... when no data is given', () => {
    render(<ConditionalText {...defaultProps} data={[]} />);

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('Renders correct text for CapacityLA section when LA occupancy is higher than regional', () => {
    render(
      <ConditionalText
        {...defaultProps}
        section="CapacityLA"
        data={mockData.mockConditionalTextDataHigher}
        metric_Id="median_occupancy_total"
      />
    );

    expect(screen.getByRole('paragraph')).toHaveTextContent(
      'Care homes in Northumberland are operating at 35% occupancy, which is higher than the regional average of (25%). This suggets a more limited capacity to meet population needs as the regional average.'
    );
  });

  test('Renders correct text for CapacityLA section when LA occupancy is Lower than regional', () => {
    render(
      <ConditionalText
        {...defaultProps}
        section="CapacityLA"
        data={mockData.mockConditionalTextDataLower}
        metric_Id="median_occupancy_total"
      />
    );

    expect(screen.getByRole('paragraph')).toHaveTextContent(
      'Care homes in Northumberland are operating at 20% occupancy, which is lower than the regional average of (25%). This suggests a greater capacity to meet population needs as the regional average.'
    );
  });

  test('Renders correct text for CapacityLA section when LA occupancy is similar to the regional', () => {
    render(
      <ConditionalText
        {...defaultProps}
        section="CapacityLA"
        data={mockData.mockConditionalTextDataSimilar}
        metric_Id="median_occupancy_total"
      />
    );

    expect(screen.getByRole('paragraph')).toHaveTextContent(
      'Care homes in Northumberland are operating at 20% occupancy, which is in line with the regional average of (20%). This suggests a similar capacity to meet population needs as the regional average.'
    );
  });

  test('Renders correct text for CapacityCareProvider section when careProvider occupancy is greater to the regional', () => {
    render(
      <ConditionalText
        {...defaultProps}
        section="CapacityCareProvider"
        ColumnHeaders={locationNamesWithCareProvider}
        locations={locationNamesWithCareProvider}
        data={mockData.mockConditionalTextDataHigher}
        metric_Id="median_occupancy_total"
      />
    );

    expect(screen.getByRole('paragraph')).toHaveTextContent(
      'Test Care Provider has (40%) occupancy for all adult social care beds compared to the median occupancy of all care homes in Northumberland (25%), suggesting limited availability for new admissions.'
    );
  });

  test('Renders correct text for CapacityCareProvider section when careProvider occupancy is lower to the regional', () => {
    render(
      <ConditionalText
        {...defaultProps}
        section="CapacityCareProvider"
        ColumnHeaders={locationNamesWithCareProvider}
        locations={locationNamesWithCareProvider}
        data={mockData.mockConditionalTextDataLower}
        metric_Id="median_occupancy_total"
      />
    );

    expect(screen.getByRole('paragraph')).toHaveTextContent(
      'Test Care Provider has (20%) occupancy for all adult social care beds compared to the median occupancy of all care homes in Northumberland (25%), suggesting greater availability for new admissions.'
    );
  });

  test('Renders correct text for CapacityCareProvider section when careProvider occupancy is similar to the regional', () => {
    render(
      <ConditionalText
        {...defaultProps}
        section="CapacityCareProvider"
        ColumnHeaders={locationNamesWithCareProvider}
        locations={locationNamesWithCareProvider}
        data={mockData.mockConditionalTextDataSimilar}
        metric_Id="median_occupancy_total"
      />
    );

    expect(screen.getByRole('paragraph')).toHaveTextContent(
      'Test Care Provider has (20%) occupancy for all adult social care beds compared to the median occupancy of all care homes in Northumberland (20%), suggesting a similar level of availability for new admissions.'
    );
  });
});
