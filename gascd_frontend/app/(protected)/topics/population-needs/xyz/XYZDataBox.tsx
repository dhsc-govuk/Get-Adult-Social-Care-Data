import React from 'react';

export type DataKey = 'LA' | 'Regional' | 'National' | 'CP' | 'Peer';

export type MetricKey =
  | 'perc_households_deprivation_deprived'
  | 'perc_household_ownership'
  | 'perc_households_one_person'
  | 'perc_unpaid_care_provider';

type Props = {
  children?: React.ReactNode;
  metricKey: MetricKey;
};

export default async function XYZDataBox({
  children,
  // metricKey,
}: Props) {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <div className="data-box govuk-form-group">{children}</div>
      </div>
    </div>
  );
}
