'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { cancelInvite, removeUser, resendInvite, restoreUser } from './actions';

const KINDS = {
  remove: { action: removeUser, label: 'Remove access', warning: true },
  restore: { action: restoreUser, label: 'Restore access', warning: false },
  resend: { action: resendInvite, label: 'Resend invite', warning: false },
  cancel: { action: cancelInvite, label: 'Cancel invite', warning: true },
};

type Props = {
  userId: string;
  kind: keyof typeof KINDS;
};

const ConfirmChange: React.FC<Props> = ({ userId, kind }) => {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      // Success redirects, so only errors come back
      const result = await KINDS[kind].action(userId);
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
          className={`govuk-button ${KINDS[kind].warning ? 'govuk-button--warning' : ''}`}
          data-module="govuk-button"
          disabled={isPending}
          onClick={confirm}
        >
          {KINDS[kind].label}
        </button>
        <Link href="/manage-users" className="govuk-link">
          {kind === 'cancel' ? 'Keep invite' : 'Cancel'}
        </Link>
      </div>
    </>
  );
};

export default ConfirmChange;
