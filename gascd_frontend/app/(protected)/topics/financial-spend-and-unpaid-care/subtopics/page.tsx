import Layout from '@/components/common/layout/Layout';
import React from 'react';
import DataLinkCard from '@/components/data-components/DataLinkCard';

export default function FundingPage() {
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
      title: 'LA funding for adult social care',
      description:
        'Data on funding for both short-term and long-term care, also funding by individual care type.',
      url: '/topics/financial-spend-and-unpaid-care/financial-spend/data',
    },
  ];

  return (
    <Layout
      title="Funding - Get adult social care"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="funding"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Funding</h1>
          <p className="govuk-body-l">
            Find data on <abbr title="local authority">LA</abbr> funding.
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
