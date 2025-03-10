import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';

class IndicatorDisplayService {
  public static getSource(metaData: IndicatorDisplay[] | null): string {
    if (metaData == null) {
      return '';
    }
    return Array.from(
      new Set(
        metaData.map((item) =>
          item.data_source === 'ONS'
            ? 'Office for National Statistics'
            : item.data_source
        )
      )
    ).join(', ');
  }
}

export default IndicatorDisplayService;
