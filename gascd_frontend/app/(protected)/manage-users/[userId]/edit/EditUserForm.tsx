'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { ProviderLocation } from '@/lib/manageUsers';
import { EditFields, updateUser } from '../actions';
import LocationCheckboxes from '../../LocationCheckboxes';
import ErrorSummary from '../../ErrorSummary';

const INPUT_ID: Record<keyof EditFields, string> = {
  name: 'edit-name',
  locations: 'edit-locations',
};

type Props = {
  userId: string;
  email: string;
  initialName: string;
  initialLocations: string[];
  // A CQC Registered Manager's own locations, which can't be changed here
  fixedLocations: string[];
  providerWide: boolean;
  locations: ProviderLocation[];
};

const EditUserForm: React.FC<Props> = ({
  userId,
  email,
  initialName,
  initialLocations,
  fixedLocations,
  providerWide,
  locations,
}) => {
  const cqcRegistered = fixedLocations.length > 0;
  const [fields, setFields] = useState<EditFields>({
    name: initialName,
    locations: initialLocations,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof EditFields, string>>
  >({});
  const [serviceError, setServiceError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Object.keys(errors).length > 0) errorSummaryRef.current?.focus();
  }, [errors]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      // Success redirects, so only errors come back
      const result = await updateUser(userId, fields);
      setErrors(result.errors);
      setServiceError(result.error);
    });
  };

  const errorFor = (field: keyof EditFields) =>
    errors[field] && (
      <p id={`${INPUT_ID[field]}-error`} className="govuk-error-message">
        <span className="govuk-visually-hidden">Error:</span> {errors[field]}
      </p>
    );

  return (
    <>
      <Link href="/manage-users" className="govuk-back-link">
        Back
      </Link>
      {Object.keys(errors).length > 0 && (
        <ErrorSummary
          ref={errorSummaryRef}
          errors={(Object.keys(INPUT_ID) as (keyof EditFields)[])
            .filter((field) => errors[field])
            .map((field) => [INPUT_ID[field], errors[field] as string])}
        />
      )}
      <span className="govuk-caption-l">{email}</span>
      <h1 className="govuk-heading-l">Edit user</h1>
      <form noValidate onSubmit={submit}>
        <div
          className={`govuk-form-group ${errors.name ? 'govuk-form-group--error' : ''}`}
        >
          <label className="govuk-label govuk-label--m" htmlFor={INPUT_ID.name}>
            Full name
          </label>
          {cqcRegistered && (
            <div id={`${INPUT_ID.name}-hint`} className="govuk-hint">
              Their name comes from their CQC registration.
            </div>
          )}
          {errorFor('name')}
          <input
            className={`govuk-input ${errors.name ? 'govuk-input--error' : ''}`}
            id={INPUT_ID.name}
            name="name"
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={fields.name}
            disabled={cqcRegistered}
            onChange={(event) =>
              setFields({ ...fields, name: event.target.value })
            }
            aria-describedby={
              [
                cqcRegistered && `${INPUT_ID.name}-hint`,
                errors.name && `${INPUT_ID.name}-error`,
              ]
                .filter(Boolean)
                .join(' ') || undefined
            }
          />
        </div>

        <div
          className={`govuk-form-group ${errors.locations ? 'govuk-form-group--error' : ''}`}
        >
          <fieldset
            className="govuk-fieldset"
            aria-describedby={`edit-locations-hint${errors.locations ? ` ${INPUT_ID.locations}-error` : ''}`}
          >
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
              Which locations should they be able to access?
            </legend>
            <div id="edit-locations-hint" className="govuk-hint">
              {cqcRegistered
                ? 'Their CQC registered locations are already ticked and cannot be changed here. Select any other locations they should be able to access.'
                : 'Select all that apply.'}
            </div>
            {errorFor('locations')}
            <LocationCheckboxes
              id={INPUT_ID.locations}
              providerWide={providerWide}
              locations={locations}
              selected={fields.locations}
              fixed={fixedLocations}
              onChange={(selected) =>
                setFields({ ...fields, locations: selected })
              }
            />
          </fieldset>
        </div>

        {serviceError && (
          <p className="govuk-error-message" role="alert">
            <span className="govuk-visually-hidden">Error:</span> {serviceError}
          </p>
        )}
        <div className="govuk-button-group">
          <button
            type="submit"
            className="govuk-button"
            data-module="govuk-button"
            disabled={isPending}
          >
            Save changes
          </button>
          <Link href="/manage-users" className="govuk-link">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
};

export default EditUserForm;
