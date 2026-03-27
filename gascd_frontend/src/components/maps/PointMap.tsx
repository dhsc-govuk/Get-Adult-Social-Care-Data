import React from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { Icon, popup } from 'leaflet';
import { LatLngTuple } from 'leaflet';
import marker from '../../../public/leaflet/images/marker-icon.png';
import { LocationDisplayData } from '@/data/interfaces/LocationDisplayData';
import AddressPopup from './AddressPopup';

type Props = {
  centrePoint: LatLngTuple;
  popupText?: string;
  nearbyLocations: LocationDisplayData[];
};

const myIcon = new Icon({
  iconUrl: marker.src,
  iconSize: [32, 40],
});

const PointMap: React.FC<Props> = ({
  centrePoint,
  nearbyLocations,
  popupText = null,
}) => {
  return (
    <MapContainer
      center={centrePoint}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: 536 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={centrePoint} icon={myIcon}>
        <Popup>{popupText}</Popup>
      </Marker>
      {nearbyLocations.map((location: LocationDisplayData) => {
        return (
          <Marker
            key={location.provider_location_id}
            position={location.coordinates}
            icon={myIcon}
          >
            <AddressPopup locationData={location} />
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default PointMap;
