import React from 'react';

export type TableColumnValue = string | number | null;

type TableColumn = {
  text: TableColumnValue;
};
type Props = {
  head: TableColumn[];
  rows: TableColumn[][];
  caption: string;
};
const XYZDataTable: React.FC<Props> = ({ head, rows, caption }) => {
  return (
    <table className="govuk-table">
      {caption && (
        <caption className="govuk-table__caption govuk-table__caption--s">
          {caption}
        </caption>
      )}
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          {head.map((value, idx) => (
            <th
              scope="col"
              className={`govuk-table__header scrollable-table__header ${idx == 0 ? 'govuk-!-width-one-third' : 'govuk-table__cell--numeric'}`}
              key={value.text}
            >
              {value.text}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {rows.map((row, idx) => (
          <tr className="govuk-table__row" key={idx}>
            {row.map((value, idx) => (
              <td
                className={`govuk-table__cell ${idx == 0 ? 'govuk-!-font-weight-regular' : 'govuk-table__cell--numeric'}`}
                key={idx}
              >
                {value.text}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default XYZDataTable;
