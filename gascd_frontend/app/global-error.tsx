'use client';

import Layout from '@/components/common/layout/Layout';
import '../src/styles/globals.scss';
import '../src/styles/styles.scss';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <Layout
      title="Error"
      autoSpaceMainContent={false}
      showLoginInformation={false}
      currentPage="error"
      session={null}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            Sorry, there is a problem with the service
          </h1>
          <p className="govuk-body">Try again later.</p>
          <p className="govuk-body">
            When the service is available, you will need to start again.
          </p>
        </div>
      </div>
    </Layout>
  );
}
