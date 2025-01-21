'use client';

import React, { MouseEvent, ReactNode, useEffect, useRef } from 'react';
import { initAll } from '../../../../public/govuk-frontend/js/govuk-frontend.min.js';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import { focusMainContent } from '../../../helpers/ManageFocus';
import PhaseBanner from '../phase-banner/PhaseBanner';
import Breadcrumbs from '../breadcrumbs/Breadcrumbs';
import { Breadcrumb } from '../../../data/interfaces/Breadcrumb';
import LoginInformation from '../../util-components/login-information/LoginInformation';
import Navbar from '../navbar/Navbar';

type Props = {
  children: ReactNode;
  breadcrumbs?: Array<Breadcrumb>;
  autoSpaceMainContent?: boolean;
  showLoginInformation: boolean;
  currentPage: string;
};

const Layout: React.FC<Props> = ({
  children,
  breadcrumbs,
  showLoginInformation,
  autoSpaceMainContent = true,
  currentPage,
}) => {
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    initAll();
  }, []);

  return (
    <div ref={layoutRef} tabIndex={-1} id="layout">
      <a
        href="#main-content"
        className="govuk-skip-link"
        onClick={(e: MouseEvent<HTMLAnchorElement>) =>
          focusMainContent(e, mainRef)
        }
      >
        Skip to main content
      </a>
      <Header />
      <div className="govuk-width-container">
        <div role="region" aria-label="Phasebar">
          <PhaseBanner />
        </div>
      </div>
      <Navbar currentPage={currentPage} />
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
          </div>
          {/* <div className="govuk-grid-column-two-thirds govuk-!-margin-top-3">
            {showLoginInformation && <LoginInformation />}
          </div> */}
          {/* Temporarily commented out due to prototype design ^^ */}
        </div>
        <main
          ref={mainRef}
          id="main-content"
          className={
            autoSpaceMainContent
              ? 'govuk-main-wrapper govuk-main-wrapper--auto-spacing'
              : ''
          }
        >
          <div id="main-content">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
