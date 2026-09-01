import React from 'react';
import { SharingCategory } from '@/data/sharingCategories';

type Props = {
  category?: SharingCategory;
};

/**
 * The sharing statement for a metric, with its label to the right. Sits above
 * the figure, table or download link so users can tell how the data in front of
 * them may be shared.
 */
const SharingLabel: React.FC<Props> = ({ category }) => {
  if (!category) return null;

  return (
    <div className="sharing-label" data-testid="sharing-label">
      <p className="sharing-label__statement govuk-body govuk-!-font-weight-bold">
        {category.showWarningIcon && (
          <>
            <span className="sharing-label__icon" aria-hidden="true">
              !
            </span>
            <span className="govuk-visually-hidden">Warning</span>
          </>
        )}
        {category.statement}
      </p>
      <p className="sharing-label__tag-wrapper govuk-body">
        <span className="govuk-visually-hidden">Sharing label: </span>
        <strong className={`govuk-tag ${category.tagModifier}`}>
          {category.label}
        </strong>
      </p>
    </div>
  );
};

export default SharingLabel;
