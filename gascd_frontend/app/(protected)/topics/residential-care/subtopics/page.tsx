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
      title: 'Care home beds and occupancy levels',
      description:
        'Provision and capacity data for care homes, including local, regional and national statistics.',
      url: '/topics/residential-care/provision-and-occupancy/data',
    },
  ];

  return (
    <Layout
      title="Cage homes - Get adult social care"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="residential-care"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Care homes</h1>
          <p className="govuk-body-l">
            Find data on residential care homes and nursing homes across
            England.
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
