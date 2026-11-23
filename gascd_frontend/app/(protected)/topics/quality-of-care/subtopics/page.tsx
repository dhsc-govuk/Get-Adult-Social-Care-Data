import { TOPICS, subtopicsFor } from '@/config/topics';
import Layout from '@/components/common/layout/Layout';
import React from 'react';
import DataLinkCard from '@/components/data-components/DataLinkCard';

export default function QualityOfCarePage() {
  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
  ];

  const subtopics = subtopicsFor(TOPICS.qualityOfCare);

  return (
    <Layout
      title="Quality of care - Get adult social care"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="quality-of-care"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Quality of care</h1>
          <p className="govuk-body-l">
            Find data on the quality of adult social care, including CQC ratings
            of locations.
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
