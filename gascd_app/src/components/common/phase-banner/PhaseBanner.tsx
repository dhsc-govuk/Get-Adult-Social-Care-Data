import Link from 'next/link';
import React from 'react';

const PhaseBanner: React.FC = () => {
  const feedback_url = process.env.NEXT_PUBLIC_FEEDBACK_FORM_LINK as string;
  return (
    <div className="govuk-phase-banner">
      <p className="govuk-phase-banner__content">
        <strong className="govuk-tag govuk-phase-banner__content__tag">
          Beta
        </strong>
        <span className="govuk-phase-banner__text">
          This is a new service. Help us improve it and{' '}
          <Link
            href={feedback_url ?? ''}
            className="govuk-link"
            target="_blank"
          >
            give your feedback (opens in new tab)
          </Link>
          .
        </span>
      </p>
    </div>
  );
};

export default PhaseBanner;
