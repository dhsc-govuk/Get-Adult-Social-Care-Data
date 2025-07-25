import { LAGeoData } from '@/helpers/maps/la_geo_data';
const baseUrl = `https://www.ons.gov.uk/census/maps/choropleth/population/age/resident-age-11a`;

export function generatePopulationMapURL(
  la_code: string,
  age_range: string
): string | undefined {
  const geodata = LAGeoData[la_code];
  if (geodata && geodata.bbox) {
    let map_qs =
      '&embed=true&embedInteractive=true&embedAreaSearch=false&embedCategorySelection=false&embedView=viewport';
    map_qs += `&embedBounds=${geodata.bbox[0]},${geodata.bbox[1]}`;
    map_qs += `&lad=${la_code}`;
    const newUrl = `${baseUrl}/${age_range}?${map_qs}`;
    return newUrl;
  }
}
