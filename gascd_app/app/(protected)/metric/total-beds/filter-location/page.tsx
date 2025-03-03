'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/common/layout/Layout';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const PresentDemandLocations: React.FC = () => {
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [selectedCPLocation, setSelectedCPLocation] = useState<string | null>(
    null
  );
  const { data: session, status } = useSession();
  const [cpLocation, setCpLocation] = useState<string>();

  useEffect(() => {
    if (session) {
      setCpLocation(session.user.locationId);
    }
  }, [session]);

  useEffect(() => {
    const getData = async () => {
      if (cpLocation) {
        try {
          const response = await fetch(
            `/api/get_locations`
          );
          if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
          }
          setAvailableLocations(await response.json());
        } catch (error) {
          console.error('Error fetching data', error);
        }
      }
    };
    getData();
  }, [cpLocation]);

  const handleChange = (value: any) => {
    setSelectedCPLocation(value);
  };

  const handleSubmit = () => {
    if (selectedCPLocation) {
      let selected = availableLocations.find(l => l.la_code === selectedCPLocation);

      localStorage.setItem('IndicatorLocationSelectedCode', selected.la_code);
      localStorage.setItem('IndicatorLocationSelectedName', selected.la_name);
      localStorage.setItem('IndicatorLocationSelectedRegion', selected.region_name);
    }
  };

  return (
    <Layout
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="present-demand-locations"
      showNavBar={false}
    >
      <a href="../metrics/total-beds" className="govuk-back-link">
        Back
      </a>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">Edit locations </h1>
          <h2 className="govuk-heading-m"> Your locations</h2>
          <div className="govuk-form-group">
            <form>
              <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
                <div className="govuk-radios" data-module="govuk-radios">
                  {availableLocations.map((item, index) => (
                    <div className="govuk-radios__item" key={item.la_code}>
                      <input
                        className="govuk-radios__input"
                        id={`radio-${index}`}
                        name="options"
                        type="radio"
                        value={item.la_code}
                        onChange={() => handleChange(item.la_code)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor={`radio-${index}`}
                      >
                        {item.la_name}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
              <Link href="/metric/total-beds" onClick={handleSubmit}>
                <button type="button" className="govuk-button">
                  Submit
                </button>
              </Link>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PresentDemandLocations;