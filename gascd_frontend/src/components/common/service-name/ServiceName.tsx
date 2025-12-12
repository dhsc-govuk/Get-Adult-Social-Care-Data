'use client';

import React from 'react';
import Link from 'next/link';
import { Session } from '@/lib/auth-client';

type Props = {
  session?: Session | null;
};

const ServiceName: React.FC<Props> = ({ session }) => {
  const toggleNav = () => {
    const nav = document.getElementById('navigation');
    if (nav) {
      if (nav.style.display === 'block') {
        nav.style.display = 'none';
      } else {
        nav.style.display = 'block';
      }
    }
  };

  const topicLinks = [
    {
      name: 'Care Homes',
      description:
        'Data on residential care homes and nursing homes, including capacity data.',
      url: '/',
    },
    {
      name: 'Population needs',
      description:
        'Data on a range of care need indicators, including disability prevalence.',
      url: '/',
    },
  ];

  const serviceInformationLinks = [
    {
      name: 'Homepage',
      url: '/',
    },
    {
      name: 'Data indicator details',
      url: '/',
    },
  ];

  return (
    <>
      <section
        aria-label="Service information"
        className="govuk-service-navigation"
        data-module="govuk-service-navigation"
      >
        <div className="govuk-width-container">
          <div className="govuk-service-navigation__container">
            <span className="govuk-service-navigation__service-name">
              <Link href="/" className="govuk-service-navigation__link">
                Get adult social care data
              </Link>
            </span>

            <nav
              aria-label="Menu"
              className="govuk-service-navigation__wrapper"
            >
              <ul className="govuk-service-navigation__list" id="navigation">
                {session && session.user.selectedLocationId && (
                  <li className="govuk-service-navigation__item govuk-service-navigation__item-start">
                    <span data-testid="selected-location">
                      {session?.user.selectedLocationDisplayName ||
                        session?.user.selectedLocationId}
                    </span>
                    <a
                      className="govuk-service-navigation__link govuk-service-navigation__link-change"
                      href="/location-select"
                    >
                      Change
                    </a>
                  </li>
                )}
                <li className="govuk-service-navigation__item govuk-service-navigation__item-start">
                  <button
                    aria-label="Show navigation menu"
                    className="govuk-service-navigation__toggle"
                    type="button"
                    onClick={() => toggleNav()}
                  >
                    Menu
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </section>

      <nav
        id="navigation-menu"
        className="govuk-service-navigation govuk-!-padding-top-8 govuk-!-padding-bottom-4"
      >
        <div className="govuk-width-container">
          <div className="govuk-service-navigation__container">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <h3 className="govuk-heading-m">Topics</h3>
                <ul className="govuk-list">
                  {topicLinks.map((link, index) => (
                    <li
                      className="govuk-grid-column-one-half govuk-!-padding-left-0"
                      key={index}
                    >
                      <a className="govuk-link govuk-body-s" href={link.url}>
                        <strong>{link.name}</strong>
                      </a>
                      <p className="govuk-body-s">{link.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="govuk-grid-column-one-third">
                <h3 className="govuk-heading-m">Service Information</h3>
                <ul className="govuk-list">
                  {serviceInformationLinks.map((link, index) => (
                    <li className="govuk-!-padding-bottom-3" key={index}>
                      <a className="govuk-link govuk-body-s" href={link.url}>
                        <strong>{link.name}</strong>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default ServiceName;
