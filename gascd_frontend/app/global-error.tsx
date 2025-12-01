'use client';

import Footer from '@/components/common/footer/Footer';
import Header from '@/components/common/header/Header';
import PhaseBanner from '@/components/common/phase-banner/PhaseBanner';
import ServiceName from '@/components/common/service-name/ServiceName';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const tag = process.env.NEXT_PUBLIC_GASCD_GIT_TAG || '0.0.0';
  const hash = process.env.NEXT_PUBLIC_GASCD_GIT_HASH || '';

  return (
    <html>
      <body>
        <div tabIndex={-1} id="layout">
          <a href="#main-content" className="govuk-skip-link">
            Skip to main content
          </a>
          <Header useCookieBanner={true} />
          <ServiceName session={null} />
          <div className="govuk-width-container">
            <div role="region" aria-label="Phasebar">
              <PhaseBanner />
            </div>
          </div>
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
          <Footer version_tag={tag} version_hash={hash} />
        </div>
      </body>
    </html>
  );
}
