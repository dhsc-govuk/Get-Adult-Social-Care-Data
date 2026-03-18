import Layout from '@/components/common/layout/Layout';
import React from 'react';
import DataLinkCard from '@/components/data-components/DataLinkCard';

export default function PopulationNeedsPage() {
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
      title: 'Dementia prevalence',
      description: 'Data on undiagnosed dementia.',
      url: '/topics/population-needs/dementia-prevalence/data',
    },
    {
      title: 'Economic factors and household composition',
      description:
        'Data on household deprivation, property ownership and older people living alone.',
      url: '/topics/population-needs/household-composition-and-economic-factors/data',
    },
    {
      title: 'General health and disability',
      description:
        'Data on disability prevalence, learning disability diagnoses and reasons for accessing care.',
      url: '/topics/population-needs/disability-prevalence/data',
    },
    {
      title: 'Population size and age group percentages',
      description:
        'Population data at district, LA, regional and national levels for England.',
      url: '/topics/population-needs/population-age-and-size/data',
    },
  ];

  return (
    <Layout
      title="Population needs - Get adult social care"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="population-needs"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Population needs</h1>
          <p className="govuk-body-l">
            Find data on a range of care need indicators, such as household
            economic factors and disability prevalence.
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
