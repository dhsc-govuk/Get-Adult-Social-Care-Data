'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { getSharingForHelpPage } from '@/data/sharingCategories';

/**
 * The "Sharing rules" row for the data indicator details pages that lay their
 * details out as a table rather than through the DataIndicatorDetails component.
 *
 * Like that component, the category comes from the page's own route, so both
 * layouts read the same agreed list.
 */
const SharingRulesTableRow: React.FC = () => {
  const sharingForPage = getSharingForHelpPage(usePathname());
  if (!sharingForPage) return null;

  const { category, reasoning } = sharingForPage;

  return (
    <tr className="govuk-table__row" data-testid="sharing-rules-row">
      <th scope="row" className="govuk-table__header">
        Sharing rules
      </th>
      <td className="govuk-table__cell">
        <p className="govuk-!-margin-top-0">
          <strong className={`govuk-tag ${category.tagModifier}`}>
            {category.label}
          </strong>
        </p>
        <p>{category.statement}</p>
        <p>{reasoning}</p>
        {category.additionalSourceNote && (
          <p className="govuk-!-margin-bottom-0">
            {category.additionalSourceNote}
          </p>
        )}
      </td>
    </tr>
  );
};

export default SharingRulesTableRow;
