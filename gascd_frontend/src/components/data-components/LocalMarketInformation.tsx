import React from 'react';
type Props = {
  localAuthority: string;
  url: string;
};

const LocalMarketInformation: React.FC<Props> = ({ localAuthority, url }) => {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h2 className="govuk-heading-l govuk-!-margin-top-9">
          Information on the local care market
        </h2>
        <p className="govuk-body">
          <a href={url} className="govuk-link">
            Market Position Statement for {localAuthority} (opens in new tab)
          </a>
        </p>
        <p className="govuk-body">
          Most local authorities in England publish Market Position Statements
          (MPS) to help care providers understand the local care market.
        </p>
        <p className="govuk-body">
          You can usually find these{' '}
          <abbr title="Market Position Statement">MPS</abbr> documents on local
          authority websites.
        </p>
        <p className="govuk-body">
          <abbr title="Market Position Statement">MPS</abbr> documents include
          information on:
        </p>
        <ul className="govuk-list govuk-list--bullet">
          <li>supply and demand in the local care market</li>
          <li>
            forecasts of future supply and demand for adult social care services
          </li>
          <li>
            how the local authority will support the local care market to meet
            demand
          </li>
          <li>
            how the local authority will engage with care providers on
            challenges in the sector, such as funding pressures
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LocalMarketInformation;
