'use client';
import React, {
  MouseEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { initAll } from '../../../../public/govuk-frontend/js/govuk-frontend.min.js';
import Header from '../header/Header';
import ServiceName from '../service-name/ServiceName';
import Footer from '../footer/Footer';
import { focusMainContent } from '../../../helpers/ManageFocus';
import PhaseBanner from '../phase-banner/PhaseBanner';
import Breadcrumbs from '../breadcrumbs/Breadcrumbs';
import { Breadcrumb } from '../../../data/interfaces/Breadcrumb';
import Navbar from '../navbar/Navbar';
import { Session } from 'next-auth';

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
}) => {
  const title_suffix = 'Get adult social care data - GOV.UK';
  const full_title = title + ' - ' + title_suffix;
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    initAll();
  });

  return (
    <>
      <title>{full_title}</title>
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
        <ServiceName session={session} />
        <div className="govuk-width-container">
          <div role="region" aria-label="Phasebar">
            <PhaseBanner />
          </div>
        </div>
        <div className="govuk-width-container">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
            </div>
          </div>
          <main
            ref={mainRef}
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
        <Footer />
      </div>
    </>
  );
};

export default Layout;
