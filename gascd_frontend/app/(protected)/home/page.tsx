import React from 'react';
import Layout from '@/components/common/layout/Layout';
import { LA_USER_TYPE } from '@/constants';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const HomePage: React.FC = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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

  let topics: Topic[] = [
    {
      title: 'Care provision',
      url: 'topics/residential-care/subtopics',
      subtopics: [
        {
          title: 'Care provider services',
          description:
            'Data on care provision by service type and number of providers.',
          url: '/topics/residential-care/residential-care-providers/data',
        },
        {
          title: 'Care home beds and occupancy levels',
          description:
            'Provision and capacity data for care homes, including local, regional and national statistics.',
          url: 'topics/residential-care/provision-and-occupancy/data',
        },
        {
          title: 'Number of adults receiving community social care',
          description:
            'Data on the number of people supported through community social care, including trends over time.',
          url: '/topics/residential-care/number-of-people-receiving-care/data',
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
      title: 'Funding',
      url: 'topics/financial-spend-and-unpaid-care/subtopics',
      subtopics: [
        {
          title: 'Local authority (LA) funding for adult social care',
          description:
            'Data on funding for both short-term and long-term care, also funding by individual care type.',
          url: 'topics/financial-spend-and-unpaid-care/financial-spend/data',
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
            'Population data at district, LA, regional and national levels for England.',
          url: 'topics/population-needs/population-age-and-size/data',
        },
        {
          title: 'Economic factors and household composition',
          description:
            'Data on household deprivation, property ownership and older people living alone.',
          url: 'topics/population-needs/household-composition-and-economic-factors/data',
        },
        {
          title: 'General health and disability',
          description:
            'Data on disability prevalence, learning disability diagnoses and reasons for accessing care.',
          url: 'topics/population-needs/disability-prevalence/data',
        },
        {
          title: 'Dementia prevalence',
          description: 'Data on undiagnosed dementia.',
          url: 'topics/population-needs/dementia-prevalence/data',
        },
      ],
    },
  ];

  if (session?.user.locationType == LA_USER_TYPE) {
    topics.push({
      title: 'Future planning',
      url: 'topics/future-planning/subtopics',
      subtopics: [
        {
          title: 'Local authority funding projected demand',
          description:
            'Consolidated estimated data on population with selected conditions within a LA area.',
          url: 'topics/future-planning/la-funding-planning/data',
        },
      ],
    });
  }

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
