'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { removeUser, restoreUser } from './actions';

type Props = {
  userId: string;
  kind: 'remove' | 'restore';
};

const ConfirmChange: React.FC<Props> = ({ userId, kind }) => {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      // Success redirects, so only errors come back
      const result = await (kind === 'remove' ? removeUser : restoreUser)(
        userId
      );
      setError(result.error);
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
          className={`govuk-button ${kind === 'remove' ? 'govuk-button--warning' : ''}`}
          data-module="govuk-button"
          disabled={isPending}
          onClick={confirm}
        >
          {kind === 'remove' ? 'Remove access' : 'Restore access'}
        </button>
        <Link href="/manage-users" className="govuk-link">
          Cancel
        </Link>
      </div>
    </>
  );
};

export default ConfirmChange;
