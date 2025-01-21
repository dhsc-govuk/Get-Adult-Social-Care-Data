import React from 'react';

const PhaseBanner: React.FC = () => {
  return (
    <div className="govuk-phase-banner">
      <p className="govuk-phase-banner__content">
        <strong className="govuk-tag govuk-phase-banner__content__tag">
          Beta
        </strong>
        <span className="govuk-phase-banner__text">This is a new service.</span>
      </p>
    </div>
  );
};

export default PhaseBanner;
