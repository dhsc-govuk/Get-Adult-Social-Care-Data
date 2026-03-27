import React from 'react';
import { Popup } from 'react-leaflet';
import { LocationDisplayData } from '@/data/interfaces/LocationDisplayData';

type Props = {
  locationData: LocationDisplayData;
};

const AddressPopup: React.FC<Props> = ({ locationData }) => {
  return (
    <Popup>
      <ul className="govuk-list popup">
        <li>Name: {locationData.name}</li>
        <li>Address: {locationData.address}</li>
        <li>Services: {locationData.services}</li>
        <li>CQG Rating: {locationData.cqc_rating}</li>
        <li>
          Distance from postcode: {locationData.distance_from_postcode} miles
        </li>
      </ul>
    </Popup>
  );
};

export default AddressPopup;
