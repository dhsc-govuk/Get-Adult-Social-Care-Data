import { LatLngTuple } from 'leaflet';

export interface LocationDisplayData {
  coordinates: LatLngTuple;
  provider_location_id: string;
  name: string;
  address: string;
  services: string;
  cqc_rating: string;
  distance_from_postcode: number;
}
