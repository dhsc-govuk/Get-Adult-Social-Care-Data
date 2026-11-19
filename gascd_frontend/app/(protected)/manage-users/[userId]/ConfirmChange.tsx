'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  cancelInvite,
  removeUser,
  resendInvite,
  restoreUser,
  ReturnTo,
} from './actions';

const KINDS = {
  remove: { action: removeUser, label: 'Remove access', warning: true },
  restore: { action: restoreUser, label: 'Restore access', warning: false },
  resend: { action: resendInvite, label: 'Resend invite', warning: false },
  cancel: { action: cancelInvite, label: 'Cancel invite', warning: true },
};

type Props = {
  userId: string;
  kind: keyof typeof KINDS;
  returnTo?: ReturnTo;
};

const ConfirmChange: React.FC<Props> = ({ userId, kind, returnTo }) => {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      // Success redirects, so only errors come back
      const result = await KINDS[kind].action(userId, returnTo);
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
        <Link
          href={returnTo ? `/manage-users/${returnTo}` : '/manage-users'}
          className="govuk-link"
        >
          {kind === 'cancel' ? 'Keep invite' : 'Cancel'}
        </Link>
      </div>
    </>
  );
};

export default ConfirmChange;
