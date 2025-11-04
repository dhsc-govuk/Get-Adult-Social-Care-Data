import IndicatorDisplayService from '@/services/indicator/IndicatorDisplayService';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';

describe('IndicatorDisplayService', () => {
  it('Returns an empty string when given null', () => {
    expect(IndicatorDisplayService.getSource(null)).toBe('');
  });

  it('Returns a single data source correctly', () => {
    const metaData: IndicatorDisplay[] = [
      {
        data_source: 'NHS',
        theme: '',
        category: '',
        group_id: '',
        metric_id: '',
        group: '',
        metric_name: '',
        description: '',
        numerator: '',
        denominator: '',
        mirrored: '',
        filter_age: '',
        filter_support_type: '',
        filter_support_setting: '',
        filter_disabilty_status: '',
        filter_care_provider_type: '',
        filter_bedtype: '',
        metric_type: '',
        aggreation: '',
        graph: '',
        comments: '',
      },
    ];
    expect(IndicatorDisplayService.getSource(metaData)).toBe('NHS');
  });

  it('Replaces "ONS" with "Office for National Statistics"', () => {
    const metaData: IndicatorDisplay[] = [
      {
        data_source: 'ONS',
        theme: '',
        category: '',
        group_id: '',
        metric_id: '',
        group: '',
        metric_name: '',
        description: '',
        numerator: '',
        denominator: '',
        mirrored: '',
        filter_age: '',
        filter_support_type: '',
        filter_support_setting: '',
        filter_disabilty_status: '',
        filter_care_provider_type: '',
        filter_bedtype: '',
        metric_type: '',
        aggreation: '',
        graph: '',
        comments: '',
      },
    ];
    expect(IndicatorDisplayService.getSource(metaData)).toBe(
      'Office for National Statistics'
    );
  });

  it('Removes duplicate sources', () => {
    const metaData: IndicatorDisplay[] = [
      {
        data_source: 'ONS',
        theme: '',
        category: '',
        group_id: '',
        metric_id: '',
        group: '',
        metric_name: '',
        description: '',
        numerator: '',
        denominator: '',
        mirrored: '',
        filter_age: '',
        filter_support_type: '',
        filter_support_setting: '',
        filter_disabilty_status: '',
        filter_care_provider_type: '',
        filter_bedtype: '',
        metric_type: '',
        aggreation: '',
        graph: '',
        comments: '',
      },
      {
        data_source: 'ONS',
        theme: '',
        category: '',
        group_id: '',
        metric_id: '',
        group: '',
        metric_name: '',
        description: '',
        numerator: '',
        denominator: '',
        mirrored: '',
        filter_age: '',
        filter_support_type: '',
        filter_support_setting: '',
        filter_disabilty_status: '',
        filter_care_provider_type: '',
        filter_bedtype: '',
        metric_type: '',
        aggreation: '',
        graph: '',
        comments: '',
      },
      {
        data_source: 'Capacity Tracker',
        theme: '',
        category: '',
        group_id: '',
        metric_id: '',
        group: '',
        metric_name: '',
        description: '',
        numerator: '',
        denominator: '',
        mirrored: '',
        filter_age: '',
        filter_support_type: '',
        filter_support_setting: '',
        filter_disabilty_status: '',
        filter_care_provider_type: '',
        filter_bedtype: '',
        metric_type: '',
        aggreation: '',
        graph: '',
        comments: '',
      },
    ];
    expect(IndicatorDisplayService.getSource(metaData)).toBe(
      'Office for National Statistics, Capacity Tracker'
    );
  });

  it('Handles multiple unique sources correctly', () => {
    const metaData: IndicatorDisplay[] = [
      {
        data_source: 'ONS',
        theme: '',
        category: '',
        group_id: '',
        metric_id: '',
        group: '',
        metric_name: '',
        description: '',
        numerator: '',
        denominator: '',
        mirrored: '',
        filter_age: '',
        filter_support_type: '',
        filter_support_setting: '',
        filter_disabilty_status: '',
        filter_care_provider_type: '',
        filter_bedtype: '',
        metric_type: '',
        aggreation: '',
        graph: '',
        comments: '',
      },
      {
        data_source: 'Capacity Tracker',
        theme: '',
        category: '',
        group_id: '',
        metric_id: '',
        group: '',
        metric_name: '',
        description: '',
        numerator: '',
        denominator: '',
        mirrored: '',
        filter_age: '',
        filter_support_type: '',
        filter_support_setting: '',
        filter_disabilty_status: '',
        filter_care_provider_type: '',
        filter_bedtype: '',
        metric_type: '',
        aggreation: '',
        graph: '',
        comments: '',
      },
      {
        data_source: 'Local Authority',
        theme: '',
        category: '',
        group_id: '',
        metric_id: '',
        group: '',
        metric_name: '',
        description: '',
        numerator: '',
        denominator: '',
        mirrored: '',
        filter_age: '',
        filter_support_type: '',
        filter_support_setting: '',
        filter_disabilty_status: '',
        filter_care_provider_type: '',
        filter_bedtype: '',
        metric_type: '',
        aggreation: '',
        graph: '',
        comments: '',
      },
    ];
    expect(IndicatorDisplayService.getSource(metaData)).toBe(
      'Office for National Statistics, Capacity Tracker, Local Authority'
    );
  });

  it('Handles an empty array correctly', () => {
    expect(IndicatorDisplayService.getSource([])).toBe('');
  });
});
