import Layout from '@/components/common/layout/Layout';
import React from 'react';
import DataLinkCard from '@/components/data-components/DataLinkCard';

type Subtopic = {
  title: string;
  description: string;
  url: string;
};

export default function QualityOfCarePage() {
  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
  ];

  const subtopics: Subtopic[] = [
    {
      title: 'CQC ratings of adult social care locations',
      description:
        'Data on CQC ratings of adult social care locations, including number and percentage of locations by CQC rating, number and percentage not yet inspected, and date of latest inspection.',
      url: '/topics/quality-of-care/cqc-ratings/data',
    },
  ];

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
            Find data on the quality of adult social care, including{' '}
            <abbr title="Care Quality Commission">CQC</abbr> ratings of
            locations.
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
