import axios, { AxiosResponse } from "axios";
import RawCapacityTrackerAgencyByRegionData from "../../src/data/mockResponses/capacity_tracker_agency_by_region.json";
import RawCapacityTrackerAgencyByLaData from "../../src/data/mockResponses/capacity_tracker_agency_by_la.json";
import { CapacityTrackerTotalHoursAgencyWorked } from "../../src/data/interfaces/CapacityTrackerTotalHoursAgencyWorked";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token: string = await fetch(
    `https://dapalpha-${
      process.env.NEXT_PUBLIC_APP_ENV
    }-app.azurewebsites.net/.auth/me`
  )
    .then((response) => response.json())
    .then((data) => data[0].id_token);

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getCapacityTrackerData(locationLevel: string) {
  if (process.env.NEXT_PUBLIC_APP_ENV === "local") {
    if (locationLevel === "region") {
      return RawCapacityTrackerAgencyByRegionData;
    } else {
      return RawCapacityTrackerAgencyByLaData;
    }
  } else {
    try {
      const response: AxiosResponse<CapacityTrackerTotalHoursAgencyWorked[]> =
        await axios.get(
          `https://dapalpha-func-app-${
            process.env.NEXT_PUBLIC_APP_ENV
          }.azurewebsites.net/api/get_capacity_tracker_data`,
          {
            params: { location_level: locationLevel },
            headers: await getAuthHeaders(),
          }
        );
      return response.data;
    } catch (error) {
      console.error("Error fetching capacity tracker data:", error);
      throw error;
    }
  }
}
