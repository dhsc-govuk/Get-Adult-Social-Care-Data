import Layout from '@/components/common/layout/Layout';
import React from 'react';
import DataLinkCard from '@/components/data-components/DataLinkCard';

export default function ResidentialCarePage() {
  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
  ];

  type Subtopic = {
    title: string;
    description: string;
    url: string;
  };

  const subtopics = [
    {
      title: 'Care providers: locations and services',
      description:
        'Data on care provision by location, service type and number of providers.',
      url: 'topics/residential-care/residential-care-providers/data',
    },
    {
      title: 'Care home beds and occupancy levels',
      description:
        'Provision and capacity data for care homes, including local, regional and national statistics.',
      url: '/topics/residential-care/provision-and-occupancy/data',
    },
    {
      title: 'Unpaid care',
      description:
        'Statistics on the people who provide unpaid care to family members, friends and neighbours.',
      url: '/topics/residential-care/unpaid-care/data',
    },
  ];

  return (
    <Layout
      title="Care provision - Get adult social care"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="residential-care"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Care provision</h1>
          <p className="govuk-body-l">
            Find data on care provision and the support provided by unpaid
            carers across England.
          </p>
          <ul className="gem-c-cards__list gem-c-cards__list--one-column">
            {subtopics.map((topic: Subtopic, index) => (
              <DataLinkCard
                key={index}
                label={topic.title}
                description={topic.description}
                url={topic.url}
              />
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
