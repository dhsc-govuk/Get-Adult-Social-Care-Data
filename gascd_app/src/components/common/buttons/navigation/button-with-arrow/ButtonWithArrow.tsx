'use client';
import React from 'react';

type Props = {
  buttonString: string;
  buttonUrl: string;
  onClick?: () => void;
};

const ButtonWithArrow: React.FC<Props> = ({
  buttonString,
  buttonUrl,
  onClick,
}) => {
  return (
    <a
      href={buttonUrl}
      role="button"
      draggable="false"
      className="govuk-button govuk-button--start"
      data-module="govuk-button"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {buttonString}
      <svg
        className="govuk-button__start-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="17.5"
        height="19"
        viewBox="0 0 33 40"
        aria-hidden="true"
        focusable="false"
      >
        <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
      </svg>
    </a>
  );
};

export default ButtonWithArrow;
