'use client';
import React, { useMemo, useState } from 'react';
import { useAllLocalAuthorities } from '@/components/charts/peer-group/useAllLocalAuthorities';
import { withBasePath } from '@/lib/basePath';
import MpsSearchForm from './MpsSearchForm';

type Props = {
  // The user's own LA, whose statement is already linked above
  excludeLaCode?: string;
};

const MpsSearch: React.FC<Props> = ({ excludeLaCode }) => {
  const [open, setOpen] = useState(false);
  const { authorities, error } = useAllLocalAuthorities(open);
  const otherAuthorities = useMemo(
    () =>
      (authorities ?? [])
        .filter((la) => la.laCode !== excludeLaCode)
        .sort((a, b) => a.laName.localeCompare(b.laName)),
    [authorities, excludeLaCode]
  );

  return (
    <details
      className="govuk-details"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">
          View a market position statement for another local authority
        </span>
      </summary>
      <div className="govuk-details__text">
        <MpsSearchForm
          authorities={otherAuthorities}
          loadError={error}
          label="Local authority"
          extraAction={
            <a
              href={withBasePath('/market-position-statements')}
              className="govuk-button govuk-button--secondary"
            >
              Browse all statements
            </a>
          }
        />
      </div>
    </details>
  );
};

export default MpsSearch;
