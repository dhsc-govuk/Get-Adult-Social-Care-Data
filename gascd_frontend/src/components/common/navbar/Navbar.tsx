'use client';

import { Session } from 'next-auth';
import React, { useState, useEffect } from 'react';

type Props = {
  session?: Session | null;
};

const Navbar: React.FC<Props> = ({ session }) => {

  const [selectedLocation, setSelectedLocation] =
    useState<string>();

  useEffect(() => {
    if(localStorage.selectedValue) {
      setSelectedLocation(localStorage.selectedValue);
    } else {
      setSelectedLocation("no location");
    }
  }, []);
  
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
      name: "Care Homes",
      description: "Data on residential care homes and nursing homes, including capacity data.",
      url: "/"
    },
    {
      name: "Community social care",
      description: "Data on home care, supported living and supported housing providers.",
      url: "/"
    },
    {
      name: "Funding and unpaid care",
      description: "Data on local authority funding and support provided by unpaid carers.",
      url: "/"
    },
    {
      name: "Population needs",
      description: "Data on a range of care need indicators, including disability prevalence.",
      url: "/"
    }
  ]

  const serviceInformationLinks = [
    {
      name: "Homepage",
      url: "/"
    },
    {
      name: "About this service",
      url: "/"
    },
    {
      name: "Data indicator details",
      url: "/"
    },
    {
      name: "User guide",
      url: "/"
    },
  ]

  return (
    <>
      <section aria-label="Service information" className="govuk-service-navigation" data-module="govuk-service-navigation" data-govuk-service-navigation-init="">
        <div className="govuk-width-container">
          <div className="govuk-service-navigation__container">      
            <span className="govuk-service-navigation__service-name">
              <a href="/home" className="govuk-service-navigation__link">Get adult social care data</a>
            </span>
              <ul className="govuk-service-navigation__list">
                <li className="govuk-service-navigation__item govuk-service-navigation__item--active govuk-service-navigation__item-start">
                  {selectedLocation} <a className="govuk-service-navigation__link govuk-service-navigation__link-change" href="/select-location">Change</a>
                </li>
                <li className="govuk-service-navigation__item govuk-service-navigation__item-start">
                  <button aria-label="Show navigation menu" className="govuk-service-navigation__toggle" type="button" onClick={() => toggleNav()}>
                    Menu
                  </button>
                </li>
              </ul>
          </div>
        </div>
      </section>

      <nav id="navigation"  className="govuk-service-navigation govuk-!-padding-top-8 govuk-!-padding-bottom-4">
        <div className="govuk-width-container">
          <div className="govuk-service-navigation__container">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <h3 className="govuk-heading-m">Topics</h3>
                <ul className="govuk-list">
                  {topicLinks.map((link) => (
                    <li className="govuk-grid-column-one-half govuk-!-padding-left-0">
                      <a className="govuk-link govuk-body-s" href={link.url}>
                        <strong>{link.name}</strong>
                      </a>
                      <p className="govuk-body-s">
                        {link.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="govuk-grid-column-one-third">
                <h3 className="govuk-heading-m">Service Information</h3>
                <ul className="govuk-list">
                  {serviceInformationLinks.map((link) => (
                    <li className="govuk-!-padding-bottom-3">
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

export default Navbar;
