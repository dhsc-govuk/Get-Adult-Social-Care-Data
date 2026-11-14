'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { AppointErrors, AppointFields } from '@/lib/manageUsers';
import { appointApprover, checkApprover } from './actions';
import ErrorSummary from '../../ErrorSummary';

type Step = 'details' | 'check';

const FIELD_INPUT_ID: Record<keyof AppointFields, string> = {
  name: 'approver-name',
  email: 'approver-email',
};

const CAPTION = 'Appoint a delegated approver';

const linkButtonStyle = {
  background: 'none',
  border: 0,
  padding: 0,
  cursor: 'pointer',
};

const AppointApproverForm: React.FC = () => {
  const [step, setStep] = useState<Step>('details');
  const [fields, setFields] = useState<AppointFields>({ name: '', email: '' });
  const [errors, setErrors] = useState<AppointErrors>({});
  const [serviceError, setServiceError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    (hasErrors ? errorSummaryRef.current : headingRef.current)?.focus();
  }, [step, errors]);

  const goTo = (next: Step) => {
    setErrors({});
    setServiceError(undefined);
    setStep(next);
  };

  // The server checks the details too, as only it knows who already has access
  const submit = (fromStep: Step) =>
    startTransition(async () => {
      // Appointing redirects, so only errors come back
      const result = await (fromStep === 'details'
        ? checkApprover(fields)
        : appointApprover(fields));
      if (Object.keys(result.errors).length > 0) {
        setStep('details');
        setErrors(result.errors);
      } else if (result.error) {
        setServiceError(result.error);
      } else if (fromStep === 'details') {
        goTo('check');
      }
    });

  const fieldError = (field: keyof AppointFields) =>
    errors[field] && (
      <p id={`${FIELD_INPUT_ID[field]}-error`} className="govuk-error-message">
        <span className="govuk-visually-hidden">Error:</span> {errors[field]}
      </p>
    );

  const textField = (
    field: keyof AppointFields,
    label: string,
    type: string
  ) => (
    <div
      className={`govuk-form-group ${errors[field] ? 'govuk-form-group--error' : ''}`}
    >
      <label
        className="govuk-label govuk-label--m"
        htmlFor={FIELD_INPUT_ID[field]}
      >
        {label}
      </label>
      {fieldError(field)}
      <input
        className={`govuk-input ${errors[field] ? 'govuk-input--error' : ''}`}
        id={FIELD_INPUT_ID[field]}
        name={field}
        type={type}
        autoComplete="off"
        spellCheck={false}
        value={fields[field]}
        onChange={(event) =>
          setFields({ ...fields, [field]: event.target.value })
        }
        aria-describedby={
          errors[field] ? `${FIELD_INPUT_ID[field]}-error` : undefined
        }
      />
    </div>
  );

  return (
    <>
      {step === 'details' ? (
        <Link href="/manage-users" className="govuk-back-link">
          Back
        </Link>
      ) : (
        <button
          type="button"
          className="govuk-back-link govuk-link"
          style={{ background: 'none', border: 0, cursor: 'pointer' }}
          onClick={() => goTo('details')}
        >
          Back
        </button>
      )}

      {hasErrors && (
        <ErrorSummary
          ref={errorSummaryRef}
          errors={(Object.keys(errors) as (keyof AppointFields)[]).map(
            (field) => [FIELD_INPUT_ID[field], errors[field] as string]
          )}
        />
      )}

      {step === 'details' && (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            submit('details');
          }}
        >
          <span className="govuk-caption-l">{CAPTION}</span>
          <h1 className="govuk-heading-l" ref={headingRef} tabIndex={-1}>
            Who do you want to appoint?
          </h1>
          <p className="govuk-body">
            A delegated approver can give and remove access to any location in
            your organisation, like you. They cannot appoint other delegated
            approvers.
          </p>
          {textField('name', 'Full name', 'text')}
          {textField('email', 'Email address', 'email')}
          {serviceError && (
            <p className="govuk-error-message" role="alert">
              <span className="govuk-visually-hidden">Error:</span>{' '}
              {serviceError}
            </p>
          )}
          <button
            type="submit"
            className="govuk-button"
            data-module="govuk-button"
            disabled={isPending}
          >
            Continue
          </button>
        </form>
      )}

      {step === 'check' && (
        <>
          <span className="govuk-caption-l">{CAPTION}</span>
          <h1 className="govuk-heading-l" ref={headingRef} tabIndex={-1}>
            Check your answers
          </h1>
          <dl className="govuk-summary-list govuk-!-margin-bottom-9">
            {(
              [
                ['name', 'Full name'],
                ['email', 'Email address'],
              ] as [keyof AppointFields, string][]
            ).map(([field, label]) => (
              <div className="govuk-summary-list__row" key={field}>
                <dt className="govuk-summary-list__key">{label}</dt>
                <dd className="govuk-summary-list__value">{fields[field]}</dd>
                <dd className="govuk-summary-list__actions">
                  <button
                    type="button"
                    className="govuk-link"
                    style={linkButtonStyle}
                    onClick={() => goTo('details')}
                  >
                    Change
                    <span className="govuk-visually-hidden"> {label}</span>
                  </button>
                </dd>
              </div>
            ))}
          </dl>

          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <div className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning</span>
              They will be able to give anyone access to your
              organisation&apos;s data. You can remove their role at any time.
            </div>
          </div>

          {serviceError && (
            <p className="govuk-error-message" role="alert">
              <span className="govuk-visually-hidden">Error:</span>{' '}
              {serviceError}
            </p>
          )}
          <button
            type="button"
            className="govuk-button"
            data-module="govuk-button"
            disabled={isPending}
            onClick={() => submit('check')}
          >
            Appoint delegated approver
          </button>
        </>
      )}
    </>
  );
};

export default AppointApproverForm;
