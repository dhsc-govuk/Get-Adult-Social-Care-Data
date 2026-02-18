import React from 'react';
import '../../../src/styles/cards.scss';

type Props = {
  label: string | React.ReactNode;
  description?: string;
  sources?: String;
  updateFrequency?: string;
  limitations?: boolean;
  url: string;
};

const DataLinkCard: React.FC<Props> = ({
  label,
  description = null,
  sources = null,
  updateFrequency = null,
  limitations = null,
  url,
}) => {
  return (
    <>
      <li className="gem-c-cards__list-item">
        <div className="gem-c-cards__list-item-wrapper">
          <h2 className="gem-c-cards__sub-heading govuk-heading-s">
            <a
              className="govuk-link gem-c-cards__link gem-c-force-print-link-styles"
              href={url}
            >
              {label}
            </a>
          </h2>
          {description && (
            <p className="govuk-body gem-c-cards__description">{description}</p>
          )}
          {sources && (
            <p className="govuk-body gem-c-cards__description">
              Sources: {sources}.
            </p>
          )}
          {updateFrequency && (
            <p className="govuk-body gem-c-cards__description">
              {updateFrequency}, limitations {!limitations && 'might'} apply.
            </p>
          )}
        </div>
      </li>
    </>
  );
};

export default DataLinkCard;
