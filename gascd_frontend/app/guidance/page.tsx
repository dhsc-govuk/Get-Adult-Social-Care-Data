import React from 'react';
import Layout from '@/components/common/layout/Layout';

const GuidancePage = () => {
  return (
    <>
      <Layout
        title="Guidance"
        showLoginInformation={false}
        currentPage="guidance"
        showNavBar={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Guidance</h1>
            <p className="govuk-body">From:</p>
            <p className="govuk-body govuk-!-font-weight-bold">
              Department for Health and Social Care{' '}
            </p>
            <p className="govuk-body">Published:</p>
            <p className="govuk-body">28 January 2026</p>
            <p className="govuk-body govuk-!-font-weight-bold">
              Applies to England{' '}
            </p>
            <h2 className="govuk-heading-m">Contents</h2>
            <ol className="govuk-list govuk-list--number govuk-list--spaced">
              <li>Overview</li>
              <li>What data is available</li>
              <li>Data not included</li>
              <li>Important</li>
              <li>Who can use this service</li>
              <li>How to sign up to use the GASCD service</li>
              <li>Data sources and methodology</li>
              <li>Useful links</li>
            </ol>
            <div
              data-module="govspeak"
              className="gem-c-govspeak govuk-govspeak govuk-!-margin-bottom-0"
            >
              <div className="govspeak">
                <h2 className="govuk-heading-m" id="overview">
                  Overview
                </h2>
                <p className="govuk-body">
                  The government collects and stores a significant amount of
                  adult social care data from sources including care providers
                  and local authorities. This data is analysed for government
                  purposes and is now being made available as a free, easy to
                  access, robust and secure service to CQC-registered Adult
                  Social Care (ASC) providers and local authorities (LA) to
                  support strategic planning and operational purposes. The data
                  is intended to support confident strategic decision-making.
                  Also available are the Market Position Statements written by
                  local authorities to help care providers make informed
                  decisions in providing the right care provision for everyone
                  needing support and care from adult social care services.
                </p>
                <h2 className="govuk-heading-m" id="gascd-data">
                  What data is available
                </h2>
                <p className="govuk-body">
                  <abbr title="{{serviceName}}">GASCD</abbr> gives you access to
                  data and insights such as population needs and services in
                  your local area, region and across England.
                </p>
                <p className="govuk-body">Includes data on:</p>
                <h3 className="govuk-heading-s">
                  CQC regulated care provision
                </h3>
                <ul className="govuk-list govuk-list--bullet">
                  <li>care providers locations and services</li>
                  <li>care home beds and occupancy levels</li>
                  <li>number of adults receiving care in their own home</li>
                </ul>
                <h3 className="govuk-heading-s">
                  Non regulated care provision
                </h3>
                <ul className="govuk-list govuk-list--bullet">
                  <li>Unpaid care</li>
                </ul>
                <h3 className="govuk-heading-s">Funding</h3>
                <ul className="govuk-list govuk-list--bullet">
                  <li>local authority funding for adult social care</li>
                </ul>
                <h3 className="govuk-heading-s">Population needs</h3>
                <ul className="govuk-list govuk-list--bullet">
                  <li>dementia prevalence and estimated diagnosis rate</li>
                  <li>economic factors and household composition</li>
                  <li>general health, disability and learning disability</li>
                  <li>population size and age group percentages</li>
                </ul>
                <p className="govuk-body">
                  Local authority Market Position Statements (MPS) giving
                  detailed information on population needs and commissioning
                  intentions are also included.
                </p>
                <h2 className="govuk-heading-m" id="data-not-included">
                  Data not included
                </h2>
                <p className="govuk-body">
                  The following data is not included:
                </p>
                <ul className="govuk-list govuk-list--bullet">
                  <li>services not regulated by the CQC</li>
                  <li>quality of care</li>
                  <li>outcomes for people who draw on care</li>
                  <li>hospital discharge data</li>
                  <li>workforce</li>
                  <li>person-level data</li>
                </ul>
                <div className="govuk-warning-text">
                  <span className="govuk-warning-text__icon" aria-hidden="true">
                    !
                  </span>
                  <strong className="govuk-warning-text__text">
                    <span className="govuk-visually-hidden">Warning</span>
                    Note this service provides information only and does not
                    constitute advice.{' '}
                    <abbr title="Department of Health and Social Care">
                      DHSC
                    </abbr>{' '}
                    does not accept any liability for decisions made by
                    providers following use of this service. Further details are
                    in the{' '}
                    <a
                      href="../../footer/disclaimer?backLink=false"
                      className="govuk-link"
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      Full Disclaimer (opens in new tab)
                    </a>
                    .
                  </strong>
                </div>
                <h2 className="govuk-heading-m" id="who-can-use-this-service">
                  Who can use this service
                </h2>
                <p className="govuk-body">
                  You can only use this service if you are the nominated
                  individual for a CQC registered care provider organisation or
                  are a local authority officer.
                </p>
                <h2
                  className="govuk-heading-m"
                  id="how-to-sign-up-to-use-gascd"
                >
                  How to sign up to use the{' '}
                  <abbr title="{{serviceName}}">GASCD</abbr> service
                </h2>
                <p className="govuk-body">
                  You need a{' '}
                  <a
                    href="../one-login/using-your-gov-uk-one-login"
                    className="govuk-link"
                  >
                    GOV.UK One Login
                  </a>{' '}
                  to sign in to this service, and it must be tied to your CQC
                  registered email address. You can{' '}
                  <a href="../one-login/start" className="govuk-link">
                    create one
                  </a>{' '}
                  if you do not already have one.
                </p>
                <p className="govuk-body">
                  You can have more than one GOV.UK One login, for example, a
                  work account in addition to your personal account, so you can
                  create one to access this service.
                </p>
                <h2
                  className="govuk-heading-m"
                  id="data-sources-and-methodology"
                >
                  Data sources and methodology
                </h2>
                <p className="govuk-body">
                  Links to data sources and methodology information are included
                  with each data set provided within the service.
                </p>
                <h2 className="govuk-heading-m" id="useful-links">
                  Useful links
                </h2>
                <p className="govuk-body">
                  View the GASCD service{' '}
                  <a
                    href="../../footer/privacy-policy?backLink=false"
                    className="govuk-link"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    privacy policy (opens in new tab)
                  </a>{' '}
                  to find out what happens to your personal information.
                </p>
                <p className="govuk-body">
                  Find out more about{' '}
                  <a
                    href="https://www.cqc.org.uk/what-we-do/services-we-regulate/services-we-regulate"
                    className="govuk-link"
                  >
                    services the CQC regulates
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default GuidancePage;
