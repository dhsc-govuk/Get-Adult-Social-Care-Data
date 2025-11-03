import React from "react";

type Props = {
  buttonString: string;
  buttonFunction: () => void;
};

const StandardButton: React.FC<Props> = ({ buttonString, buttonFunction }) => {
  return (
    <button className="govuk-button" onClick={buttonFunction}>
      {buttonString}
    </button>
  );
};

export default StandardButton;
