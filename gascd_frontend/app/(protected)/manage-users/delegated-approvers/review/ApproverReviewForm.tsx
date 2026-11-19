'use client';

import React, { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import ErrorSummary from '../../ErrorSummary';
import { submitApproverReview } from '../../review/actions';

export type ReviewApprover = {
  userId: string;
  name: string;
  email: string;
  status: string;
};

type Decision = 'keep' | 'remove';

export const MISSING_DECISION_ERROR =
  'Select whether to keep or remove each delegated approver';

const DECISION_LABELS: Record<Decision, string> = {
  keep: 'Keep as a delegated approver',
  remove: 'Remove as a delegated approver',
};

type Props = {
  approvers: ReviewApprover[];
  caption: string;
  // Shown under the heading while choosing, e.g. the deadline
  warning?: React.ReactNode;
};

const ApproverReviewForm: React.FC<Props> = ({
  approvers,
  caption,
  warning,
}) => {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [step, setStep] = useState<'choose' | 'check'>('choose');
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const summaryRef = useRef<HTMLDivElement>(null);

  const missing = approvers.filter((a) => !decisions[a.userId]);
  const showError = showErrors && missing.length > 0;

  const next = (event: React.FormEvent) => {
    event.preventDefault();
    if (missing.length > 0) {
      setShowErrors(true);
      // After the summary renders
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setShowErrors(false);
    setStep('check');
    window.scrollTo(0, 0);
  };

  const submit = () =>
    startTransition(async () => {
      // Success redirects, so only errors come back
      const result = await submitApproverReview(
        approvers
          .filter((a) => decisions[a.userId] === 'remove')
          .map((a) => a.userId)
      );
      setError(result?.error);
    });

  const backToChoose = () => {
    setStep('choose');
    window.scrollTo(0, 0);
  };

  if (step === 'check') {
    const removing = approvers.filter((a) => decisions[a.userId] === 'remove');
    return (
      <>
        <a
          href="#"
          className="govuk-back-link"
          onClick={(event) => {
            event.preventDefault();
            backToChoose();
          }}
        >
          Back
        </a>
        <span className="govuk-caption-l">{caption}</span>
        <h1 className="govuk-heading-l">Check your answers</h1>
        <dl className="govuk-summary-list">
          {approvers.map((approver) => (
            <div className="govuk-summary-list__row" key={approver.userId}>
              <dt className="govuk-summary-list__key">
                {approver.name}
                <br />
                <span className="govuk-body-s">{approver.email}</span>
              </dt>
              <dd className="govuk-summary-list__value">
                {DECISION_LABELS[decisions[approver.userId]]}
              </dd>
              <dd className="govuk-summary-list__actions">
                <button
                  type="button"
                  className="govuk-link govuk-body"
                  style={{
                    border: 0,
                    background: 'none',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                  onClick={backToChoose}
                >
                  Change
                  <span className="govuk-visually-hidden">
                    {' '}
                    decision for {approver.name}
                  </span>
                </button>
              </dd>
            </div>
          ))}
        </dl>
        {removing.length > 0 && (
          <p className="govuk-body">
            People you remove will no longer be able to give or remove access.
            They will still be able to view your organisation&apos;s data, and
            anyone they gave access to keeps it. We will email them to let them
            know.
          </p>
        )}
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
            onClick={submit}
          >
            Confirm and submit
          </button>
        </div>
      </>
    );
  }

  return (
    <form onSubmit={next} noValidate>
      <Link href="/manage-users" className="govuk-back-link">
        Back
      </Link>
      {showError && (
        <ErrorSummary
          errors={[[`decision-${missing[0].userId}`, MISSING_DECISION_ERROR]]}
          ref={summaryRef}
        />
      )}
      <span className="govuk-caption-l">{caption}</span>
      <h1 className="govuk-heading-l">Review delegated approvers</h1>
      {warning}
      <p className="govuk-body">
        Delegated approvers can give and remove access to any location in your
        organisation. Check that each of them still needs to.
      </p>
      {approvers.map((approver) => {
        const fieldError = showError && !decisions[approver.userId];
        return (
          <div
            key={approver.userId}
            className={`govuk-form-group ${fieldError ? 'govuk-form-group--error' : ''}`}
          >
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                {approver.name}
              </legend>
              <div className="govuk-hint">
                {approver.email}
                {approver.status !== 'Active' &&
                  ` (${approver.status.toLowerCase()})`}
              </div>
              {fieldError && (
                <p className="govuk-error-message">
                  <span className="govuk-visually-hidden">Error:</span>{' '}
                  {MISSING_DECISION_ERROR}
                </p>
              )}
              <div className="govuk-radios" data-module="govuk-radios">
                {(Object.keys(DECISION_LABELS) as Decision[]).map(
                  (decision, index) => {
                    const id =
                      index === 0
                        ? `decision-${approver.userId}`
                        : `decision-${approver.userId}-${decision}`;
                    return (
                      <div className="govuk-radios__item" key={decision}>
                        <input
                          className="govuk-radios__input"
                          id={id}
                          name={`decision-${approver.userId}`}
                          type="radio"
                          value={decision}
                          checked={decisions[approver.userId] === decision}
                          onChange={() =>
                            setDecisions((current) => ({
                              ...current,
                              [approver.userId]: decision,
                            }))
                          }
                        />
                        <label
                          className="govuk-label govuk-radios__label"
                          htmlFor={id}
                        >
                          {DECISION_LABELS[decision]}
                        </label>
                      </div>
                    );
                  }
                )}
              </div>
            </fieldset>
          </div>
        );
      })}
      <div className="govuk-button-group">
        <button
          type="submit"
          className="govuk-button"
          data-module="govuk-button"
        >
          Continue
        </button>
        <Link href="/manage-users" className="govuk-link">
          Cancel
        </Link>
      </div>
    </form>
  );
};

export default ApproverReviewForm;
