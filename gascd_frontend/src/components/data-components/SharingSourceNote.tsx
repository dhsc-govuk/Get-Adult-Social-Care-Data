import React from 'react';
import { SharingCategory } from '@/data/sharingCategories';

type Props = {
  category?: SharingCategory;
};

/**
 * The additional source note that applies to restricted metrics, shown directly
 * below the source line for the figure, table or download.
 */
const SharingSourceNote: React.FC<Props> = ({ category }) => {
  if (!category?.additionalSourceNote) return null;

  return (
    // The top margin gives the same gap below every source line, whether or
    // not that line has a bottom margin of its own (the two collapse)
    <p
      className="govuk-body govuk-!-margin-top-4"
      data-testid="sharing-source-note"
    >
      {category.additionalSourceNote}
    </p>
  );
};

export default SharingSourceNote;
