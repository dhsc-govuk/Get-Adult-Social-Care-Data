'use client';

import React from 'react';
import Link from 'next/link';
import { Session } from '@/lib/auth-client';

type Props = {
  session?: Session | null;
};

const ServiceName: React.FC<Props> = ({ session }) => {
  const toggleNav = () => {
    const nav = document.getElementById('super-navigation-menu');
    const navLastChild = document.querySelector<HTMLElement>(
      '#navigation li:last-child'
    );
    const menuButton = document.querySelector<HTMLElement>(
      '#super-navigation-menu-toggle'
    );
    if (nav) {
      if (nav.style.display === 'block') {
        nav.style.display = 'none';
        nav.ariaExpanded = 'false';
        navLastChild?.classList.remove(
          'govuk-service-navigation__item--active'
        );
        menuButton?.classList.remove(
          'gem-c-layout-super-navigation-header__open-button'
        );
      } else {
        nav.style.display = 'block';
        nav.ariaExpanded = 'true';
        navLastChild?.classList.add('govuk-service-navigation__item--active');
        menuButton?.classList.add(
          'gem-c-layout-super-navigation-header__open-button'
        );
      }
    }
  };

  const topicLinks = [
    {
      name: 'Care Homes',
      description:
        'Find data on residential care homes and nursing homes across England.',
      url: '/topics/residential-care/subtopics',
    },
    {
      name: 'Population needs',
      description:
        'Find data on a range of care need indicators, such as household economic factors and disability prevalence.',
      url: '/topics/population-needs/subtopics',
    },
  ];

  const serviceInformationLinks = [
    {
      name: 'Homepage',
      url: '/home',
    },
    {
      name: 'Data indicator details',
      url: '/service-information/data-indicator-details',
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
                {session && session.user.selectedLocationId && (
                  <li className="govuk-service-navigation__item govuk-service-navigation__item-end">
                    <button
                      aria-label="Show navigation menu"
                      id="super-navigation-menu-toggle"
                      className="gem-c-layout-super-navigation-header__navigation-top-toggle-button"
                      onClick={() => toggleNav()}
                    >
                      <span className="gem-c-layout-super-navigation-header__navigation-top-toggle-button-inner">
                        Menu
                      </span>
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      {session && session.user.selectedLocationId && (
        <div
          id="super-navigation-menu"
          className="gem-c-layout-super-navigation-header__navigation-dropdown-menu"
          aria-hidden="true"
          style={{ display: 'none' }}
        >
          <div className="govuk-width-container">
            <div className="govuk-grid-row gem-c-layout-super-navigation-header__navigation-items">
              <div className="govuk-grid-column-two-thirds-from-desktop">
                <h3 className="govuk-heading-m gem-c-layout-super-navigation-header__column-header">
                  Topics
                </h3>
                <ul className="gem-c-layout-super-navigation-header__navigation-second-items gem-c-layout-super-navigation-header__navigation-second-items--topics">
                  {topicLinks.map((link, index) => (
                    <li
                      className="gem-c-layout-super-navigation-header__dropdown-list-item"
                      key={index}
                    >
                      <a
                        className="govuk-link gem-c-layout-super-navigation-header__navigation-second-item-link gem-c-layout-super-navigation-header__navigation-second-item-link--with-description"
                        href={link.url}
                      >
                        {link.name}
                      </a>
                      <p className="govuk-body-s gem-c-layout-super-navigation-header__navigation-second-item-description">
                        {link.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="govuk-grid-column-one-third-from-desktop gem-c-layout-super-navigation-header__column--government-activity">
                <h3 className="govuk-heading-m gem-c-layout-super-navigation-header__column-header">
                  Service information
                </h3>
                <ul className="gem-c-layout-super-navigation-header__navigation-second-items gem-c-layout-super-navigation-header__navigation-second-items--government-activity">
                  {serviceInformationLinks.map((link, index) => (
                    <li
                      className="gem-c-layout-super-navigation-header__dropdown-list-item"
                      key={index}
                    >
                      <a
                        className="govuk-link gem-c-layout-super-navigation-header__navigation-second-item-link gem-c-layout-super-navigation-header__navigation-second-item-link--with-description"
                        href={link.url}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceName;
