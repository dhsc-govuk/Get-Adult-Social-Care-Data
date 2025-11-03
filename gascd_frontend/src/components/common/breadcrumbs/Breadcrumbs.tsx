import React from "react";
import { Breadcrumb } from "../../../data/interfaces/Breadcrumb";

type Props = {
  breadcrumbs: Array<Breadcrumb>;
};

const Breadcrumbs: React.FC<Props> = ({ breadcrumbs }) => {
  return (
    <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
      <ol className="govuk-breadcrumbs__list">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={index} className="govuk-breadcrumbs__list-item">
            <a className="govuk-breadcrumbs__link" href={breadcrumb.url}>
              {breadcrumb.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
