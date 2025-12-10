import React from 'react';
import Link from 'next/link';

const ServiceName: React.FC = () => {
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
        </div>
      </div>
    </section>
  );
};

export default ServiceName;
