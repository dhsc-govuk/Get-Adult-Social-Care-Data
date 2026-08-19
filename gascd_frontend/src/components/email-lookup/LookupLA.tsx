import React from 'react';

const LookupLA: React.FC = () => {
  const showDomainNoMatchWarning = true;
  return (
    <fieldset className="govuk-fieldset" aria-describedby="signIn-hint">
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
        <h1 className="govuk-fieldset__heading">Check your email here</h1>
      </legend>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="la-user-email">
          Email
        </label>
        {/* <div id="la-user-email-hint" className="govuk-hint">
                  A domain match must be found before Location ID can be
                  selected.
                </div> */}
        <input
          id="la-user-email"
          className="govuk-input govuk-!-width-one-third"
          type="email"
          aria-describedby="la-user-email-hint"
          name="email"
          // value={email}
          // onChange={(event) => setEmail(event.target.value)}
          // disabled={submitting}
        />
        {showDomainNoMatchWarning ? (
          <p className="govuk-warning-text govuk-!-margin-top-2 govuk-!-margin-bottom-0">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning</span>
              No matching council domain was found for this email address.
            </strong>
          </p>
        ) : null}
      </div>
    </fieldset>
  );
};

export default LookupLA;
