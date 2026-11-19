'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { confirmUserReview } from './actions';

const ConfirmUserReview: React.FC = () => {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      // Success redirects, so only errors come back
      const result = await confirmUserReview();
      setError(result?.error);
    });

  return (
    <>
      {error && (
        <p className="govuk-error-message" role="alert">
          <span className="govuk-visually-hidden">Error:</span> {error}
        </p>
      )}
      <div className="govuk-button-group">
        <button
          type="button"
          className="govuk-button"
          data-module="govuk-button"
          disabled={isPending}
          onClick={confirm}
        >
          Confirm this list is up to date
        </button>
        <Link href="/manage-users" className="govuk-link">
          Cancel
        </Link>
      </div>
    </>
  );
};

export default ConfirmUserReview;
