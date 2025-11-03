import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';

class IndicatorDisplayService {
  public static getSource(metaData: IndicatorDisplay[] | null): string {
    if (!metaData) {
      return '';
    }
    return Array.from(
      new Set(
        metaData.map((item) =>
          item.data_source.includes('ONS')
            ? item.data_source.replace('ONS', 'Office for National Statistics')
            : item.data_source
        )
      )
    ).join(', ');
  }
}

export default IndicatorDisplayService;
