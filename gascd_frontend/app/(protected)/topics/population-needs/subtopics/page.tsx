import { TOPICS, subtopicsFor } from '@/config/topics';
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

  const subtopics = subtopicsFor(TOPICS.populationNeeds);

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
            {subtopics.map((topic, index) => (
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
