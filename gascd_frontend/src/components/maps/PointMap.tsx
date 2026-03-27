import React from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import { LocationDisplayData } from '@/data/interfaces/LocationDisplayData';
import postcodeIconImage from '../../../public/leaflet/images/your-postcode.svg';
import locationIconImage from '../../../public/leaflet/images/marker-icon.png';
import AddressPopup from './AddressPopup';

type Props = {
  centrePoint: LatLngTuple;
  popupText?: string;
  nearbyLocations: LocationDisplayData[];
};

const postcodeIcon = new Icon({
  iconUrl: postcodeIconImage.src,
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50],
});
const locationIcon = new Icon({
  iconUrl: locationIconImage.src,
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50],
});

const fillBlueOptions = {
  color: '#1d70b8',
  fillColor: '#b1b4b6',
  fillOpacity: 0.25,
};

const PointMap: React.FC<Props> = ({
  centrePoint,
  nearbyLocations,
  popupText = null,
}) => {
  return (
    <MapContainer
      center={centrePoint}
      zoom={11}
      scrollWheelZoom={false}
      style={{ height: 536 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={centrePoint}
        pathOptions={fillBlueOptions}
        radius={8046.72}
      />
      <Marker position={centrePoint} icon={postcodeIcon}>
        <Popup>
          <span className="popup">
            <strong>{popupText}</strong>
          </span>
        </Popup>
      </Marker>
      {nearbyLocations.map((location: LocationDisplayData) => {
        return (
          <Marker
            key={location.provider_location_id}
            position={location.coordinates}
            icon={locationIcon}
          >
            <AddressPopup locationData={location} />
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default PointMap;
