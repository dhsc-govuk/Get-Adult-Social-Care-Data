import React from 'react';

// This is a workaround until we work out how to properly inject
// NEXT_PUBLIC_ environment variables at the docker build stage
export const FALLBACK_FEEDBACK_URL = 'https://forms.office.com/e/s9FCDSibN0';

interface Props {
  highlight?: boolean;
}

const Feedback: React.FC<Props> = ({ highlight = true }) => {
  let feedback_url =
    process.env.NEXT_PUBLIC_FEEDBACK_FORM_LINK || FALLBACK_FEEDBACK_URL;
  const className = highlight
    ? 'feedback-container call-to-action'
    : 'feedback-container';
  return (
    <div id="feedback-cta" className={className}>
      <h2 className="govuk-heading-m" id="feedback">
        Give your feedback on this service
      </h2>
      <p className="govuk-body">
        Thank you for volunteering to test this new digital service from the
        Department of Health and Social Care (DHSC).
      </p>
      <p className="govuk-body">
        We&apos;re keen to hear about your experience using the service. Your
        feedback will help us make improvements and add features for you.
      </p>
      <p className="govuk-body">
        <a
          href={feedback_url}
          className="govuk-link"
          rel="noreferrer noopener"
          target="_blank"
        >
          Fill in the feedback survey (opens in new tab)
        </a>
      </p>
    </div>
  );
};

export default Feedback;
