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
    <p className="govuk-body" data-testid="sharing-source-note">
      {category.additionalSourceNote}
    </p>
  );
};

export default SharingSourceNote;
