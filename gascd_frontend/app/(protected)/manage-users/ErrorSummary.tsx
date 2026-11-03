import { forwardRef } from 'react';

type Props = {
  // Input id to message, in the order the fields appear
  errors: [string, string][];
};

const ErrorSummary = forwardRef<HTMLDivElement, Props>(({ errors }, ref) => (
  <div
    className="govuk-error-summary"
    data-module="govuk-error-summary"
    ref={ref}
    tabIndex={-1}
  >
    <div role="alert">
      <h2 className="govuk-error-summary__title">There is a problem</h2>
      <div className="govuk-error-summary__body">
        <ul className="govuk-list govuk-error-summary__list">
          {errors.map(([inputId, message]) => (
            <li key={inputId}>
              <a href={`#${inputId}`}>{message}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
));
ErrorSummary.displayName = 'ErrorSummary';

export default ErrorSummary;
