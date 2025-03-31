'use client';

import React from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import ButtonWithArrow from '../../../src/components/common/buttons/navigation/button-with-arrow/ButtonWithArrow';
import './registerPage.scss';
import { Breadcrumb } from '@/data/interfaces/Breadcrumb';
import { signIn } from 'next-auth/react';

const RegisterPage: React.FC = () => {
  const breadcrumbs: Breadcrumb[] = [
    { text: 'Home', url: 'https://www.gov.uk' },
    {
      text: 'Health and social care',
      url: 'https://www.gov.uk/health-and-social-care',
    },
    {
      text: 'Social care',
      url: 'https://www.gov.uk/health-and-social-care/social-care',
    },
  ];

  return (
    <>
      <Layout
        breadcrumbs={breadcrumbs}
        showLoginInformation={false}
        currentPage="register"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">Guidance</span>
            <h1 className="govuk-heading-l">
              Get adult social care data: sign in or request access
            </h1>
            <p className="govuk-body-l">
              Find out how to access this digital insight tool for adult social
              care data in England.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            <p className="govuk-body-s">
              From:{' '}
              <a
                href="https://www.gov.uk/government/organisations/department-of-health-and-social-care"
                className="govuk-link"
              >
                Department for Health and Social Care
              </a>
              <br />
              Published 6 January 2025
            </p>

            <div className="govuk-!-display-none-print govuk-!-margin-bottom-3">
              <form
                className="gem-c-single-page-notification-button"
                action="https://www.gov.uk/email/subscriptions/single-page/new"
                method="POST"
              >
                <input
                  type="hidden"
                  name="base_path"
                  value="/guidance/sign-in-to-your-agent-services-account"
                />
                <button
                  className="govuk-body-s gem-c-single-page-notification-button__submit"
                  type="submit"
                >
                  <svg
                    className="gem-c-single-page-notification-button__icon"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    height="18"
                    width="18"
                    viewBox="0 0 459.334 459.334"
                  >
                    <path fill="currentColor" d="M177.216 404.514..." />
                  </svg>
                  <span className="gem-c-single-page-notification-button__text">
                    {' '}
                    Get emails about this page
                  </span>
                </button>
              </form>
            </div>

            <p className="govuk-body-s">Contents</p>
            <ul className="govuk-list">
              {[
                { id: 'about', text: 'About this service' },
                { id: 'who', text: 'Who can use the service' },
                { id: 'access', text: 'How to request access' },
                { id: 'sign-in', text: 'How to sign in to the service' },
                { id: 'help', text: 'Get help with this service' },
              ].map((item) => (
                <li key={item.id}>
                  –{' '}
                  <a className="govuk-link govuk-body-s" href={`#${item.id}`}>
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>

            <h2 id="about" className="govuk-heading-m">
              About this service
            </h2>
            <p className="govuk-body-m">
              Get adult social care data is a digital insight tool that provides
              access to a wide range of datasets relevant to adult social care
              in England.
            </p>

            <p className="govuk-body-m">
              The service brings together data from the Care Quality Commission,
              Office for National Statistics, NHS England, Capacity Tracker and
              other sources. When new data is published, the service updates
              automatically so you can get insights based on the most current
              information.
            </p>

            <p className="govuk-body-m">You can use this service to:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                access data and track indicators, across themes including
                demand, capacity, service quality, care outcomes, workforce, and
                market sustainability{' '}
              </li>
              <li>
                explore and visualise data with interactive tools that help you
                to identify patterns, trends and insights
              </li>
              <li>
                support decision-making and strategic planning by downloading
                datasets and charts in formats you can integrate into your own
                analyses
              </li>
            </ul>

            <h2 id="who" className="govuk-heading-m">
              Who can use the service
            </h2>
            <p className="govuk-body-m">
              This service is for professionals working in organisations with an
              interest in the adult social care sector in England, for example:
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>operational managers</li>
              <li>strategic leaders and business owners</li>
              <li>care commissioners</li>
              <li>public health officials</li>
              <li>policy makers</li>
              <li>analysts</li>
              <li>academic researchers</li>
            </ul>

            <p className="govuk-body-m">
              Some datasets are restricted, so you&apos;ll need to apply for
              access.{' '}
            </p>

            <p className="govuk-body-m">
              Access is subject to approval by the Department of Health and
              Social Care (DHSC).
            </p>

            <h2 id="access" className="govuk-heading-m">
              How to request access
            </h2>
            <p className="govuk-body-m">
              Use the online service to submit your request for access.
            </p>

            <p className="govuk-body-m">
              DHSC will normally contact you within x working days to grant
              access or ask for more information. During busy periods, this may
              take longer.
            </p>

            <div className="call-to-action">
              <p className="govuk-body-m">
                <a rel="external" href="1-email" className="govuk-link">
                  Request access to Get adult social care data
                </a>
              </p>
            </div>

            <h2 id="sign-in" className="govuk-heading-m">
              How to sign in to the service
            </h2>
            <p className="govuk-body-m">
              Once you&apos;re approved, you can sign in to Get adult social
              care data.
            </p>

            <p className="govuk-body-m">
              When you sign in for the first time, you&apos;ll be asked to
              create a password for your account.
            </p>

            <div className="govuk-inset-text">
              Online services may be slow during busy times. Check if there are
              any{' '}
              <a href="#" className="govuk-link">
                problems with this service
              </a>
              .
            </div>

            <ButtonWithArrow
              buttonString="Sign in now"
              buttonUrl="#"
              onClick={() =>
                signIn('azure-ad-b2c-signup', { callbackUrl: '/home' })
              }
            />

            <h2 id="help" className="govuk-heading-m">
              Get help with this service
            </h2>
            <p className="govuk-body">
              If you have any questions about Get adult social care data, email{' '}
              <a
                href="https://www.gov.uk/guidance/get-an-hmrc-agent-services-account"
                className="mailto:asc.data@dhsc.gov.uk"
              >
                ascd.enquiries@dhsc.gov.uk
              </a>
              .
            </p>

            <hr className="govuk-section-break govuk-section-break--visible" />
          </div>

          <div className="govuk-grid-column-one-third">
            <div className="gem-c-contextual-sidebar govuk-!-display-none-print">
              <div className="gem-c-related-navigation govuk-!-display-none-print">
                <h2 className="govuk-heading-s">Related content</h2>
                <nav role="navigation">
                  <a
                    className="govuk-link govuk-link--sidebar"
                    href="https://www.gov.uk/government/publications/care-data-matters-a-roadmap-for-better-adult-social-care-data"
                  >
                    Care data matters: a roadmap for better adult social care
                    data
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <h2 className="govuk-visually-hidden">Updates to this page</h2>
        <div className="app-c-published-dates">
          <p className="govuk-body-s">Published 6 January 2025</p>
        </div>

        <div className="published-dates-button-group">
          <h2 className="govuk-visually-hidden">
            Sign up for emails or print this page
          </h2>

          <div
            data-module="ga4-link-tracker"
            className="govuk-!-display-none-print govuk-!-margin-bottom-3"
            data-ga4-link-tracker-module-started="true"
          >
            <form
              className="gem-c-single-page-notification-button"
              action="https://www.gov.uk/email/subscriptions/single-page/new"
              method="POST"
              data-button-location="bottom"
              data-button-text-subscribe="Get emails about this page"
              data-button-text-unsubscribe="Stop getting emails about this page"
            >
              <input
                type="hidden"
                name="base_path"
                value="/guidance/sign-in-to-your-agent-services-account"
              />
              <button
                className="govuk-body-s gem-c-single-page-notification-button__submit"
                type="submit"
                data-ga4-link='{"event_name":"navigation","type":"subscribe","index_link":2,"index_total":2,"section":"Footer","url":"/email/subscriptions/single-page/new"}'
              >
                {' '}
                <svg
                  className="gem-c-single-page-notification-button__icon"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  height="18"
                  width="18"
                  viewBox="0 0 459.334 459.334"
                >
                  <path
                    fill="currentColor"
                    d="M177.216 404.514c-.001.12-.009.239-.009.359 0 30.078 24.383 54.461 54.461 54.461s54.461-24.383 54.461-54.461c0-.12-.008-.239-.009-.359H175.216zM403.549 336.438l-49.015-72.002v-89.83c0-60.581-43.144-111.079-100.381-122.459V24.485C254.152 10.963 243.19 0 229.667 0s-24.485 10.963-24.485 24.485v27.663c-57.237 11.381-100.381 61.879-100.381 122.459v89.83l-49.015 72.002a24.76 24.76 0 0 0 20.468 38.693H383.08a24.761 24.761 0 0 0 20.469-38.694z"
                  ></path>
                </svg>
                <span className="gem-c-single-page-notication-button__text">
                  Get emails about this page
                </span>
              </button>
            </form>
          </div>

          <div className="gem-c-print-link govuk-!-display-none-print govuk-!-margin-top-0 govuk-!-margin-bottom-2">
            <button
              className="govuk-link govuk-body-s gem-c-print-link__button"
              data-module="print-link"
              data-print-link-module-started="true"
            >
              Print this page
            </button>
          </div>
        </div>

        <a
          className="govuk-link app-c-back-to-top govuk-!-display-none-print"
          href="https://www.gov.uk/guidance/sign-in-to-your-agent-services-account#contents"
        >
          <svg
            className="app-c-back-to-top__icon"
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="17"
            viewBox="0 0 13 17"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M6.5 0L0 6.5 1.4 8l4-4v12.7h2V4l4.3 4L13 6.4z"
            ></path>
          </svg>
          Contents
        </a>
      </Layout>
    </>
  );
};

export default RegisterPage;
