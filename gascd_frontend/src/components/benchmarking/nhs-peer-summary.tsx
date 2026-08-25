import React from 'react';

type Props = {
  // ...
};

const SummaryNHSPeerGroup: React.FC<Props> = ({}) => {
  return (
    <details className="govuk-details govuk-!-margin-top-3">
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">
          Interpreting the NHS Peer Group
        </span>
      </summary>
      <div className="govuk-details__text">
        GASCD currently uses a{' '}
        <a
          className="govuk-link"
          href="https://github.com/NHSDigital/ASC_LA_Peer_Groups"
          target="_blank"
          rel="noopener noreferrer"
        >
          statistical neighbours model
        </a>{' '}
        developed by NHS digital in 2022/23 to support benchmarking. This is one
        of a number of approaches that aim to group authorities with similar
        socio-economic and geographic factors (e.g. age, ethnicity, education).
        It is important to note that there is limited evidence of which factors
        are the most important drivers of variation in adult social care. As a
        result, these statistical neighbours should be viewed as a helpful
        starting point for benchmarking, rather than a definitive indication of
        which authorities are most alike or measuring relative performance.
      </div>
    </details>
  );
};

export default SummaryNHSPeerGroup;
