'use client';
import React, { useMemo, useState } from 'react';
import { useAllLocalAuthorities } from '@/components/charts/peer-group/useAllLocalAuthorities';
import { withBasePath } from '@/lib/basePath';
import MpsSearchForm from './MpsSearchForm';

const MpsSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { authorities, error } = useAllLocalAuthorities(open);
  const sortedAuthorities = useMemo(
    () =>
      [...(authorities ?? [])].sort((a, b) => a.laName.localeCompare(b.laName)),
    [authorities]
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
          authorities={sortedAuthorities}
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
