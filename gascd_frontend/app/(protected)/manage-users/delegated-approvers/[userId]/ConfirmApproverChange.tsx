'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  cancelApproverInviteAction,
  removeApprover,
  resendApproverInviteAction,
} from './actions';

const KINDS = {
  remove: {
    action: removeApprover,
    label: 'Remove delegated approver',
    warning: true,
    keep: 'Cancel',
  },
  resend: {
    action: resendApproverInviteAction,
    label: 'Resend invite',
    warning: false,
    keep: 'Cancel',
  },
  cancel: {
    action: cancelApproverInviteAction,
    label: 'Cancel invite',
    warning: true,
    keep: 'Keep invite',
  },
};

type Props = {
  userId: string;
  kind: keyof typeof KINDS;
};

const ConfirmApproverChange: React.FC<Props> = ({ userId, kind }) => {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      // Success redirects, so only errors come back
      const result = await KINDS[kind].action(userId);
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
          className={`govuk-button ${KINDS[kind].warning ? 'govuk-button--warning' : ''}`}
          data-module="govuk-button"
          disabled={isPending}
          onClick={confirm}
        >
          {KINDS[kind].label}
        </button>
        <Link href="/manage-users" className="govuk-link">
          {KINDS[kind].keep}
        </Link>
      </div>
    </>
  );
};

export default ConfirmApproverChange;
