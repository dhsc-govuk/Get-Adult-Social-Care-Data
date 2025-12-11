import React from 'react';
import Link from 'next/link';
import { Session } from '@/lib/auth-client';

type Props = {
  session?: Session | null;
};

const ServiceName: React.FC<Props> = ({ session }) => {
  return (
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

          <nav aria-label="Menu" className="govuk-service-navigation__wrapper">
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
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default ServiceName;
