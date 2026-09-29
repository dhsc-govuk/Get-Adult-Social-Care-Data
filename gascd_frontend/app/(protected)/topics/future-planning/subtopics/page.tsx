import Layout from '@/components/common/layout/Layout';
import React from 'react';
import DataLinkCard from '@/components/data-components/DataLinkCard';
import { LA_USER_TYPE } from '@/constants';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

type Subtopic = {
  title: string;
  description: string;
  url: string;
};

export default async function FuturePlanningPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const subtopics: Subtopic[] = [
    {
      title:
        'Special Educational Needs (SEN) and Education, Health and Care Plans (EHCP)',
      description:
        'Data on the number and percentage of pupils with SEN support, and on children and young people with an EHCP.',
      url: '/topics/future-planning/sen-and-ehcp/data',
    },
    {
      title: 'Children in need',
      description:
        'Data on children assessed as needing help and protection, including episodes ending due to transfer to adult social care.',
      url: '/topics/future-planning/children-in-need/data',
    },
  ];

  // Population projections come from PANSI, which is only licensed for LA users
  if (session?.user.locationType === LA_USER_TYPE) {
    subtopics.push({
      title: 'Population projections within local authorities',
      description:
        'Data estimates on the future prevalence of long-term conditions and disability for adults.',
      url: '/topics/future-planning/la-funding-planning/data',
    });
  }

  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
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
