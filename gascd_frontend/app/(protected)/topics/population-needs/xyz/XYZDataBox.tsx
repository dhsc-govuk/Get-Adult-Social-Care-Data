import { get_la_peers } from '@/data/DAL';
import { User } from '@/lib/auth';
import React from 'react';

export type DataKey = 'LA' | 'Regional' | 'National' | 'CP' | 'Peer';

type MetricKey =
  | 'perc_households_deprivation_deprived'
  | 'perc_household_ownership'
  | 'perc_households_one_person';

type Props = {
  children?: React.ReactNode;
  metricKey: MetricKey;
  dataKeys: Record<DataKey, string>;
  user: User;
};

export default async function XYZDataBox({
  children,
  dataKeys,
  metricKey,
  user,
}: Props) {
  const result = await get_la_peers({
    user,
    la_code: dataKeys.LA,
    metric_code: metricKey,
  });
  console.log(':$:', { metricKey, dataKeys, result });

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <div className="data-box govuk-form-group">{children}</div>
      </div>
    </div>
  );
}
