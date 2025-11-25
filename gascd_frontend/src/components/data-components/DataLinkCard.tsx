import React from 'react';
import '../../../src/styles/cards.scss';

type Props = {
  label: string;
  sources: String;
  updateFrequency: string;
  limitations: boolean;
  url: string;
};

const DataLinkCard: React.FC<Props> = ({
  label,
  sources,
  updateFrequency,
  limitations,
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
          <p className="govuk-body gem-c-cards__description">
            Sources: {sources}.
          </p>
          <p className="govuk-body gem-c-cards__description">
            {updateFrequency} updates{limitations && ', limitations apply'}.
          </p>
        </div>
      </li>
    </>
  );
};

export default DataLinkCard;
