'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/common/layout/Layout';
import PresentDemandService from '@/services/present-demand/presentDemandService';
import { useSession } from 'next-auth/react';

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
          const locations =
            await PresentDemandService.getAvailableLocations(cpLocation);
          setAvailableLocations(locations);
        } catch (error) {
          console.error('Error fetching data', error);
        }
      }
    };
    getData();
  }, [cpLocation]);

  const handleChange = (value: string) => {
    setSelectedCPLocation(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCPLocation) {
      localStorage.setItem('selectedValue', selectedCPLocation);
      alert('Value saved: ' + selectedCPLocation);
    } else {
      alert('Select a Care Provider location');
    }
  };

  return (
    <Layout
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="present-demand-locations"
      showNavBar={false}
    >
      <a href="../present-demand" className="govuk-back-link">
        Back
      </a>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">Edit locations </h1>
          <h2 className="govuk-heading-m"> Your locations</h2>
        </div>
      </div>
    </Layout>
  );
};

export default PresentDemandLocations;
