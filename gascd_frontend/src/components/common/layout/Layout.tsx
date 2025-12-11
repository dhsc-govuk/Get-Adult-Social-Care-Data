import React, { ReactNode } from 'react';
import Footer from '../footer/Footer';
import PhaseBanner from '../phase-banner/PhaseBanner';
import Breadcrumbs from '../breadcrumbs/Breadcrumbs';
import { Breadcrumb } from '../../../data/interfaces/Breadcrumb';

type Props = {
  title: string;
  children?: ReactNode;
  breadcrumbs?: Array<Breadcrumb>;
  autoSpaceMainContent?: boolean;
  showLoginInformation?: boolean;
  currentPage?: string;
  backURL?: string;
  showNavBar?: boolean;
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

      {currentPage !== 'home' && (
        <div
          style={currentPage === 'home' ? { backgroundColor: '#d2e2f1' } : {}}
        >
          <div className="govuk-width-container">
            <PhaseBanner />
          </div>
        </div>
      )}

      {currentPage === 'home' && (
        <div className="x-govuk-masthead">
          <div className="govuk-width-container">
            <PhaseBanner />
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <h1 className="x-govuk-masthead__title">
                  Get adult social care data
                </h1>
                <p className="x-govuk-masthead__description">
                  Find data on adult social care and related population needs in
                  England.
                </p>
                <p className="x-govuk-masthead__description">
                  This service shows local and regional statistics based on your
                  selected location.
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
    </>
  );
};

export default Layout;
