import React, { ReactNode } from 'react';
import Header from '../header/Header';
import ServiceName from '../service-name/ServiceName';
import Footer from '../footer/Footer';
import PhaseBanner from '../phase-banner/PhaseBanner';
import Breadcrumbs from '../breadcrumbs/Breadcrumbs';
import { Breadcrumb } from '../../../data/interfaces/Breadcrumb';
import { Session } from '@/lib/auth-client';

type Props = {
  title: string;
  children?: ReactNode;
  breadcrumbs?: Array<Breadcrumb>;
  autoSpaceMainContent?: boolean;
  showLoginInformation?: boolean;
  currentPage?: string;
  backURL?: string;
  showNavBar?: boolean;
  session?: Session | null;
  useCookieBanner?: boolean;
};

const Layout: React.FC<Props> = ({
  title,
  children,
  breadcrumbs,
  showLoginInformation,
  autoSpaceMainContent = true,
  showNavBar = false,
  currentPage,
  backURL,
  session,
  useCookieBanner = true,
}) => {
  const title_suffix = 'Get adult social care data - GOV.UK';
  const full_title = title + ' - ' + title_suffix;

  // Public version numbers to pass to the footer
  // - these are public variables as they are injected at build time, regardless of environment
  const tag = process.env.NEXT_PUBLIC_GASCD_GIT_TAG || '0.0.0';
  const hash = process.env.NEXT_PUBLIC_GASCD_GIT_HASH || '';

  return (
    <>
      <title>{full_title}</title>
      <div tabIndex={-1} id="layout">
        <a href="#main-content" className="govuk-skip-link">
          Skip to main content
        </a>
        <Header useCookieBanner={useCookieBanner} />
        <ServiceName session={session} />
        <div
          style={currentPage === 'home' ? { backgroundColor: '#d2e2f1' } : {}}
        >
          <div className="govuk-width-container">
            <div role="region" aria-label="Phasebar">
              <PhaseBanner />
            </div>
          </div>
        </div>

        {currentPage === 'home' && (
          <div className="x-govuk-masthead">
            <div className="govuk-width-container">
              <div className="govuk-grid-row govuk-!-padding-bottom-4">
                <div className="govuk-grid-column-two-thirds govuk-!-padding-left-0">
                  <h1 className="x-govuk-masthead__title">
                    Get adult social care data
                  </h1>
                  <p className="x-govuk-masthead__description">
                    Find data on adult social care and related population needs
                    in England.
                  </p>
                  <p className="x-govuk-masthead__description">
                    This service shows local and regional statistics based on
                    your selected location.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="govuk-width-container">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
            </div>
          </div>
          <main
            id="main-content"
            className={
              autoSpaceMainContent
                ? 'govuk-main-wrapper govuk-main-wrapper--auto-spacing'
                : 'govuk-main-wrapper'
            }
          >
            {backURL && (
              <div className="backlink-wrapper">
                <a href={backURL} className="govuk-back-link">
                  Back
                </a>
              </div>
            )}
            {children}
          </main>
        </div>
        <Footer version_tag={tag} version_hash={hash} />
      </div>
    </>
  );
};

export default Layout;
