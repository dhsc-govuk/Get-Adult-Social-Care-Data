'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Session, User } from '@/lib/auth-client';
import { ALLOWED_CP_USER_TYPES, LA_USER_TYPE } from '@/constants';
import LocationService from '@/services/location/locationService';

type Props = {
  session?: Session | null;
};

const ServiceName: React.FC<Props> = ({ session }) => {
  const [selectedLocationName, setSelectedLocationName] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [topicLinks, setTopicLinks] = useState<any[]>([]);

  useEffect(() => {
    const fetchNames = async () => {
      if (session?.user.selectedLocationDisplayName) {
        setSelectedLocationName(session?.user.selectedLocationDisplayName);
      } else if (session?.user.locationType == LA_USER_TYPE) {
        // LA names are looked up dynamically
        const lnames = await LocationService.getLocationNames('', false);
        if (lnames?.LALabel) {
          setSelectedLocationName(lnames.LALabel);
        }
      }
    };
    fetchNames();
  }, [session]);

  useEffect(() => {
    let links = [
      {
        name: 'Care Provision',
        description:
          'Find data on care provision and the support provided by unpaid carers across England.',
        url: '/topics/residential-care/subtopics',
      },
      {
        name: 'Funding',
        description: (
          <>
            Find data on <abbr title="Local Authority">LA</abbr> funding.
          </>
        ),
        url: '/topics/financial-spend-and-unpaid-care/subtopics',
      },
      {
        name: 'Population needs',
        description:
          'Find data on a range of care need indicators, such as household economic factors and disability prevalence.',
        url: '/topics/population-needs/subtopics',
      },
    ];
    if (session?.user.locationType === LA_USER_TYPE) {
      links.push({
        name: 'Future planning',
        description:
          'Find estimated and experimental data on future population needs.',
        url: '/topics/future-planning/subtopics',
      });
    }
    setTopicLinks(links);
  }, [session]);

  const canChangeLocation = (user: User) => {
    return ALLOWED_CP_USER_TYPES.includes(user.locationType || '');
  };

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
        setMenuOpen(false);
        nav.style.display = 'none';
        navLastChild?.classList.remove(
          'govuk-service-navigation__item--active'
        );
        menuButton?.classList.remove(
          'gem-c-layout-super-navigation-header__open-button'
        );
      } else {
        setMenuOpen(true);
        nav.style.display = 'block';
        navLastChild?.classList.add('govuk-service-navigation__item--active');
        menuButton?.classList.add(
          'gem-c-layout-super-navigation-header__open-button'
        );
      }
    }
  };

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
                      {selectedLocationName}
                    </span>
                    {canChangeLocation(session.user) && (
                      <a
                        className="govuk-service-navigation__link govuk-service-navigation__link-change"
                        href="/location-select"
                      >
                        Change
                      </a>
                    )}
                  </li>
                )}
                {session && session.user.selectedLocationId && (
                  <li className="govuk-service-navigation__item govuk-service-navigation__item-end">
                    <button
                      aria-label="Show navigation menu"
                      id="super-navigation-menu-toggle"
                      className="gem-c-layout-super-navigation-header__navigation-top-toggle-button"
                      onClick={() => toggleNav()}
                      aria-expanded={menuOpen}
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
