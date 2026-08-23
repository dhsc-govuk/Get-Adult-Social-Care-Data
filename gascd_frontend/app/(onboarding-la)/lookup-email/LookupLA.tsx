import React from 'react';

const LookupLA: React.FC = () => {
  return (
    <fieldset className="govuk-fieldset" aria-describedby="signIn-hint">
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
        <h1 className="govuk-fieldset__heading">Check your email here</h1>
      </legend>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="la-user-email">
          Email address
        </label>
        <p id="la-user-email-hint" className="govuk-hint govuk-!-margin-top-0">
          It will be checked against a list of approved LA domains.
        </p>
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
      </div>
    </fieldset>
  );
};

export default LookupLA;
