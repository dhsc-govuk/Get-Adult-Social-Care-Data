import React from 'react';

const Navbar: React.FC = () => {
  return (
    <div
      className="govuk-service-navigation"
      data-module="govuk-service-navigation"
    >
      <div className="govuk-width-container">
        <div className="govuk-service-navigation__container">
          <nav aria-label="Menu" className="govuk-service-navigation__wrapper">
            <button
              type="button"
              className="govuk-service-navigation__toggle govuk-js-service-navigation-toggle"
              aria-controls="navigation"
              hidden
            >
              Navigation
            </button>
            <ul
              className="govuk-service-navigation__list govuk-service-navigation__item--active"
              id="navigation"
            >
              <li className="govuk-service-navigation__item govuk-service-navigation__item--active">
                <a
                  className="govuk-service-navigation__link"
                  href="/"
                  aria-current="true"
                >
                  <strong className="govuk-service-navigation__active-fallback">
                    Home
                  </strong>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
