import React from 'react';
import Layout from '@/components/common/layout/Layout';

const HomePage: React.FC = () => {
  type Subtopic = {
    title: string;
    description: string;
    url: string;
  };

  type Topic = {
    title: string;
    url: string;
    subtopics: Subtopic[];
  };

  const topics: Topic[] = [
    {
      title: 'Care provision',
      url: 'topics/residential-care/subtopics',
      subtopics: [
        {
          title: 'Care home beds and occupancy levels',
          description:
            'Provision and capacity data for care homes, including local, regional and national statistics.',
          url: 'topics/residential-care/provision-and-occupancy/data',
        },
        {
          title: 'Unpaid care',
          description:
            'Statistics on the people who provide unpaid care to family members, friends and neighbours.',
          url: '/topics/residential-care/unpaid-care/data',
        },
      ],
    },
    {
      title: 'Population needs',
      url: 'topics/population-needs/subtopics',
      subtopics: [
        {
          title: 'Population size and age group percentages',
          description:
            'Population data at district, local authority, regional and national levels for England.',
          url: 'topics/population-needs/population-age-and-size/data',
        },
        {
          title: 'Economic factors and household composition',
          description:
            'Data on household deprivation, property ownership and older people living alone.',
          url: 'topics/population-needs/household-composition-and-economic-factors/data',
        },
        {
          title: 'General health, disability and learning disability',
          description:
            'Data on disability prevalence, learning disability diagnoses and reasons for accessing care.',
          url: 'topics/population-needs/disability-prevalence/data',
        },
        {
          title: 'Dementia prevalence and estimated diagnosis rate',
          description:
            'Data on registered dementia diagnoses with estimates for undiagnosed dementia.',
          url: 'topics/population-needs/dementia-prevalence/data',
        },
      ],
    },
  ];

  return (
    <>
      <Layout
        title="Home"
        autoSpaceMainContent={false}
        showLoginInformation={true}
        currentPage="home"
      >
        {...topics.map((topic: Topic) => (
          <div className="govuk-grid-row" key={topic.title}>
            <div className="govuk-grid-column-full">
              <h2
                className={
                  'govuk-heading-l ' +
                  (topic.title === 'Care provision'
                    ? ''
                    : 'govuk-!-margin-top-7')
                }
              >
                <a href={topic.url} className="govuk-link">
                  {topic.title}
                </a>
              </h2>
            </div>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                {topic.subtopics.map((subtopic: Subtopic) => (
                  <div
                    className="govuk-grid-column-one-half"
                    key={subtopic.title}
                  >
                    <a href={subtopic.url} className="app-card">
                      <h3 className="govuk-heading-m app-card__heading">
                        {subtopic.title}
                      </h3>
                      <p className="govuk-body">{subtopic.description}</p>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </Layout>
    </>
  );
};

export default HomePage;
