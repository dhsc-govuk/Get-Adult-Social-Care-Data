import Layout from '@/components/common/layout/Layout';
import React from 'react';
import DataLinkCard from '@/components/data-components/DataLinkCard';

export default function FuturePlanningPage() {
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
      title: 'Population projections within local authorities',
      description:
        'Data estimates on the future prevalence of long-term conditions and disability for adults.',
      url: '/topics/future-planning/la-funding-planning/data',
    },
  ];

  return (
    <Layout
      title="Future planning - Get adult social care"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="future-planning"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Future planning</h1>
          <p className="govuk-body-l">
            Find estimated and experimental data on future population needs.
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
