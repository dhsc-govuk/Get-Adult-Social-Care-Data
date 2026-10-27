'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ALL_LOCATIONS,
  InviteErrors,
  InviteFields,
  ProviderLocation,
  validateInviteEmail,
  validateInviteLocations,
  validateInviteName,
} from '@/lib/manageUsers';
import { inviteUser } from './actions';

type Step = 'name' | 'email' | 'locations' | 'check';

const STEP_ORDER: Step[] = ['name', 'email', 'locations', 'check'];

const FIELD_STEP: Record<keyof InviteFields, Step> = {
  name: 'name',
  email: 'email',
  locations: 'locations',
};

const FIELD_INPUT_ID: Record<keyof InviteFields, string> = {
  name: 'invite-name',
  email: 'invite-email',
  locations: 'invite-locations',
};

type Props = {
  providerWide: boolean;
  locations: ProviderLocation[];
};

const InviteUserForm: React.FC<Props> = ({ providerWide, locations }) => {
  const [step, setStep] = useState<Step>('name');
  const [returnToCheck, setReturnToCheck] = useState(false);
  const [fields, setFields] = useState<InviteFields>({
    name: '',
    email: '',
    locations: [],
  });
  const [errors, setErrors] = useState<InviteErrors>({});
  const [serviceError, setServiceError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const headingRef = useRef<HTMLElement | null>(null);
  const setHeading = (element: HTMLElement | null) => {
    headingRef.current = element;
  };
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

  const continueFrom = (current: Step) => {
    const field = current as keyof InviteFields;
    const error =
      field === 'name'
        ? validateInviteName(fields.name)
        : field === 'email'
          ? validateInviteEmail(fields.email)
          : validateInviteLocations(fields.locations, {
              providerWide,
              locations,
            });
    if (error) {
      setErrors({ [field]: error });
      return;
    }
    goTo(returnToCheck ? 'check' : STEP_ORDER[STEP_ORDER.indexOf(current) + 1]);
  };

  const change = (field: keyof InviteFields) => {
    setReturnToCheck(true);
    goTo(FIELD_STEP[field]);
  };

  const back = () => {
    if (returnToCheck && step !== 'check') {
      goTo('check');
    } else {
      goTo(STEP_ORDER[STEP_ORDER.indexOf(step) - 1]);
    }
  };

  const toggleLocation = (code: string, checked: boolean) => {
    setFields((current) => {
      if (code === ALL_LOCATIONS) {
        return { ...current, locations: checked ? [ALL_LOCATIONS] : [] };
      }
      const others = current.locations.filter(
        (c) => c !== code && c !== ALL_LOCATIONS
      );
      return { ...current, locations: checked ? [...others, code] : others };
    });
  };

  const submit = () => {
    startTransition(async () => {
      const result = await inviteUser(fields);
      // Success redirects, so only errors come back
      const firstField = (
        Object.keys(result.errors) as (keyof InviteFields)[]
      )[0];
      if (firstField) {
        setReturnToCheck(true);
        setStep(FIELD_STEP[firstField]);
        setErrors(result.errors);
      } else if (result.error) {
        setServiceError(result.error);
      }
    });
  };

  const locationSummary = fields.locations.includes(ALL_LOCATIONS)
    ? ['All locations']
    : locations
        .filter((location) => fields.locations.includes(location.code))
        .map((location) => location.name);

  const errorSummary = hasErrors && (
    <div
      className="govuk-error-summary"
      data-module="govuk-error-summary"
      ref={errorSummaryRef}
      tabIndex={-1}
    >
      <div role="alert">
        <h2 className="govuk-error-summary__title">There is a problem</h2>
        <div className="govuk-error-summary__body">
          <ul className="govuk-list govuk-error-summary__list">
            {(Object.keys(errors) as (keyof InviteFields)[]).map((field) => (
              <li key={field}>
                <a href={`#${FIELD_INPUT_ID[field]}`}>{errors[field]}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const fieldError = (field: keyof InviteFields) =>
    errors[field] && (
      <p id={`${FIELD_INPUT_ID[field]}-error`} className="govuk-error-message">
        <span className="govuk-visually-hidden">Error:</span> {errors[field]}
      </p>
    );

  const backLink =
    step === 'name' ? (
      <Link href="/manage-users" className="govuk-back-link">
        Back
      </Link>
    ) : (
      <button
        type="button"
        className="govuk-back-link govuk-link"
        style={{ background: 'none', border: 0, cursor: 'pointer' }}
        onClick={back}
      >
        Back
      </button>
    );

  const continueButton = (
    <button type="submit" className="govuk-button" data-module="govuk-button">
      Save and continue
    </button>
  );

  const textStep = (
    field: 'name' | 'email',
    heading: string,
    inputProps: React.InputHTMLAttributes<HTMLInputElement>
  ) => (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        continueFrom(field);
      }}
    >
      <div
        className={`govuk-form-group ${errors[field] ? 'govuk-form-group--error' : ''}`}
      >
        <h1 className="govuk-label-wrapper">
          <span className="govuk-caption-l">Invite a new user</span>
          <label
            className="govuk-label govuk-label--l"
            htmlFor={FIELD_INPUT_ID[field]}
            ref={setHeading}
            tabIndex={-1}
          >
            {heading}
          </label>
        </h1>
        {fieldError(field)}
        <input
          className={`govuk-input ${errors[field] ? 'govuk-input--error' : ''}`}
          id={FIELD_INPUT_ID[field]}
          name={field}
          value={fields[field]}
          onChange={(event) =>
            setFields({ ...fields, [field]: event.target.value })
          }
          aria-describedby={
            errors[field] ? `${FIELD_INPUT_ID[field]}-error` : undefined
          }
          {...inputProps}
        />
      </div>
      {continueButton}
    </form>
  );

  return (
    <>
      {backLink}
      <div id="invite-user-step">
        {errorSummary}

        {step === 'name' &&
          textStep('name', "What is the user's full name?", {
            type: 'text',
            autoComplete: 'off',
            spellCheck: false,
          })}

        {step === 'email' &&
          textStep('email', 'What is their email address?', {
            type: 'email',
            autoComplete: 'off',
            spellCheck: false,
          })}

        {step === 'locations' && (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              continueFrom('locations');
            }}
          >
            <div
              className={`govuk-form-group ${errors.locations ? 'govuk-form-group--error' : ''}`}
            >
              <fieldset
                className="govuk-fieldset"
                aria-describedby={`invite-locations-hint${errors.locations ? ' invite-locations-error' : ''}`}
              >
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                  <span className="govuk-caption-l">Invite a new user</span>
                  <h1
                    className="govuk-fieldset__heading"
                    ref={setHeading}
                    tabIndex={-1}
                  >
                    Which locations should they be able to access?
                  </h1>
                </legend>
                <div id="invite-locations-hint" className="govuk-hint">
                  Select all that apply.
                </div>
                {fieldError('locations')}
                <div
                  className="govuk-checkboxes"
                  data-module="govuk-checkboxes"
                >
                  {providerWide && (
                    <>
                      <div className="govuk-checkboxes__item">
                        <input
                          className="govuk-checkboxes__input"
                          id={FIELD_INPUT_ID.locations}
                          name="locations"
                          type="checkbox"
                          value={ALL_LOCATIONS}
                          checked={fields.locations.includes(ALL_LOCATIONS)}
                          onChange={(event) =>
                            toggleLocation(ALL_LOCATIONS, event.target.checked)
                          }
                          aria-describedby="invite-locations-all-hint"
                        />
                        <label
                          className="govuk-label govuk-checkboxes__label"
                          htmlFor={FIELD_INPUT_ID.locations}
                        >
                          All locations
                        </label>
                        <div
                          id="invite-locations-all-hint"
                          className="govuk-hint govuk-checkboxes__hint"
                        >
                          Includes any locations added in future
                        </div>
                      </div>
                      <div className="govuk-checkboxes__divider">or</div>
                    </>
                  )}
                  {locations.map((location, index) => {
                    const id =
                      !providerWide && index === 0
                        ? FIELD_INPUT_ID.locations
                        : `invite-location-${location.code}`;
                    return (
                      <div
                        className="govuk-checkboxes__item"
                        key={location.code}
                      >
                        <input
                          className="govuk-checkboxes__input"
                          id={id}
                          name="locations"
                          type="checkbox"
                          value={location.code}
                          checked={fields.locations.includes(location.code)}
                          onChange={(event) =>
                            toggleLocation(location.code, event.target.checked)
                          }
                        />
                        <label
                          className="govuk-label govuk-checkboxes__label"
                          htmlFor={id}
                        >
                          {location.name}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            </div>
            {continueButton}
          </form>
        )}

        {step === 'check' && (
          <>
            <span className="govuk-caption-l">Invite a new user</span>
            <h1 className="govuk-heading-l" ref={setHeading} tabIndex={-1}>
              Check your answers
            </h1>
            <dl className="govuk-summary-list govuk-!-margin-bottom-9">
              {(
                [
                  ['name', "What is the user's full name?", [fields.name]],
                  ['email', 'What is their email address?', [fields.email]],
                  [
                    'locations',
                    'Which locations should they be able to access?',
                    locationSummary,
                  ],
                ] as [keyof InviteFields, string, string[]][]
              ).map(([field, label, values]) => (
                <div className="govuk-summary-list__row" key={field}>
                  <dt className="govuk-summary-list__key">{label}</dt>
                  <dd className="govuk-summary-list__value">
                    {values.map((value) => (
                      <span key={value} className="govuk-!-display-block">
                        {value}
                      </span>
                    ))}
                  </dd>
                  <dd className="govuk-summary-list__actions">
                    <button
                      type="button"
                      className="govuk-link"
                      style={{
                        background: 'none',
                        border: 0,
                        padding: 0,
                        cursor: 'pointer',
                      }}
                      onClick={() => change(field)}
                    >
                      Change
                      <span className="govuk-visually-hidden"> {label}</span>
                    </button>
                  </dd>
                </div>
              ))}
            </dl>

            <h2 className="govuk-heading-m">Your responsibilities</h2>
            <p className="govuk-body">By inviting this user, you agree to:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>check they need access to the data for their role</li>
              <li>manage their access, and the access of anyone they invite</li>
              <li>
                remove their access as soon as they no longer need it, for
                example if they leave your organisation, change role or are on
                long-term leave
              </li>
            </ul>
            <p className="govuk-body">
              GASCD contains sensitive data. You may be asked to confirm who has
              access and why.
            </p>

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
              onClick={submit}
            >
              Invite user
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default InviteUserForm;
