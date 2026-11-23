import Layout from '@/components/common/layout/Layout';
import React from 'react';
import DataLinkCard from '@/components/data-components/DataLinkCard';
import { TOPICS, subtopicsFor } from '@/config/topics';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function FuturePlanningPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const subtopics = subtopicsFor(
    TOPICS.futurePlanning,
    session?.user.locationType
  );

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
