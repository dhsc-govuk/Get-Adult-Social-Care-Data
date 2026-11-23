import React from 'react';
import Layout from '@/components/common/layout/Layout';
import { TOPICS, Topic, Subtopic, subtopicsFor } from '@/config/topics';
import { auth } from '@/lib/auth';
import { withBasePath } from '@/lib/basePath';
import { headers } from 'next/headers';

const HomePage: React.FC = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const topics: Topic[] = Object.values(TOPICS).map((topic) => ({
    ...topic,
    subtopics: subtopicsFor(topic, session?.user.locationType),
  }));

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
                <a href={withBasePath(topic.url)} className="govuk-link">
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
                    <a href={withBasePath(subtopic.url)} className="app-card">
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
