import React from 'react';
import { CqcRatingId } from '@/config/metrics';
import { CQC_RATING_COLOURS } from '@/data/cqcMetrics';
import {
  CQC_LOCATION_COLUMNS,
  CqcLocation,
  cqcRatingDate,
  cqcRatingLabel,
  cqcServiceTypeLabel,
} from '@/data/cqcLocations';

type Props = {
  // The id of the table's title, which is shown above it
  titleId: string;
  locations: CqcLocation[];
};

/**
 * One row per adult social care location, with its overall CQC rating and the
 * date that rating was published. Each rating carries the colour it has in
 * the CQC ratings chart.
 */
const CqcLocationsTable: React.FC<Props> = ({ titleId, locations }) => (
  <div>
    <div className="moj-scrollable-pane" role="region">
      <table className="govuk-table" aria-labelledby={titleId}>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            {[
              CQC_LOCATION_COLUMNS.provider,
              CQC_LOCATION_COLUMNS.location,
              CQC_LOCATION_COLUMNS.serviceType,
              CQC_LOCATION_COLUMNS.rating,
            ].map((heading) => (
              <th key={heading} scope="col" className="govuk-table__header">
                {heading}
              </th>
            ))}
            <th
              scope="col"
              className="govuk-table__header govuk-table__header--numeric"
            >
              {CQC_LOCATION_COLUMNS.ratingDate}
            </th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {locations.map((location) => (
            <tr key={location.code} className="govuk-table__row">
              <td className="govuk-table__cell">{location.provider_name}</td>
              <th
                scope="row"
                className="govuk-table__cell govuk-!-font-weight-regular"
              >
                {location.name}
              </th>
              <td className="govuk-table__cell">
                {cqcServiceTypeLabel(location)}
              </td>
              <td className="govuk-table__cell">
                <span
                  className="dhsc-category-key"
                  style={{
                    backgroundColor:
                      CQC_RATING_COLOURS[
                        location.overall_rating as CqcRatingId
                      ],
                  }}
                  aria-hidden="true"
                />
                {cqcRatingLabel(location)}
              </td>
              <td className="govuk-table__cell govuk-table__cell--numeric">
                {cqcRatingDate(location)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default CqcLocationsTable;
