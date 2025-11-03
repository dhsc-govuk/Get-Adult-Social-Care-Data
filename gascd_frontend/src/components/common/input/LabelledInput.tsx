import React from 'react';

type Props = {
  eventName: string;
  inputId: string;
  children?: React.ReactNode;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  ariaLabel: string;
};

const LabelledInput: React.FC<Props> = ({
  eventName,
  inputId,
  value,
  onChange,
  children,
  ariaLabel,
}) => {
  return (
    <>
      <h1 className="govuk-label-wrapper">
        <label className="govuk-label" htmlFor={inputId}>
          {children}
        </label>
      </h1>
      <input
        className="govuk-input govuk-input--width-20"
        id={inputId}
        name={eventName}
        type="text"
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
      />
    </>
  );
};

export default LabelledInput;
