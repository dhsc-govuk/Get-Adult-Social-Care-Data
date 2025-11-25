import React from 'react';
import '../../../src/styles/styles.scss';

const BackToTop: React.FC = () => {
  return (
    <div className="gem-c-contents-list-with-body__link-wrapper govuk-!-margin-top-9">
      <div className="gem-c-contents-list-with-body__link-container">
        <a
          className="govuk-link gem-c-back-to-top-link govuk-!-display-none-print"
          href="#top"
        >
          <svg
            className="gem-c-back-to-top-link__icon"
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="17"
            viewBox="0 0 13 17"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M6.5 0L0 6.5 1.4 8l4-4v12.7h2V4l4.3 4L13 6.4z"
            ></path>
          </svg>
          <span className="govuk-!-padding-left-1">Back to top</span>
        </a>
      </div>
    </div>
  );
};

export default BackToTop;
