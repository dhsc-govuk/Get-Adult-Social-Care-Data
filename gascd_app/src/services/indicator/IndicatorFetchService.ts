import { Indicator } from "@/data/interfaces/Indicator";
import { IndicatorDisplay } from "@/data/interfaces/IndicatorDisplay";


class IndicatorFetchService{
	public static async getData(metric_id: string): Promise<Indicator[]> {
		const data: Promise<Indicator[]> = (await fetch('/api/get_metric_data')).json();
		return data;
	}
	public static async getDisplayData(metric_id: string): Promise<IndicatorDisplay> {
		const response = await fetch('/api/get_metadata')
		const displayData: IndicatorDisplay = await response.json();
		return displayData;
	}
}

export default IndicatorFetchService;
