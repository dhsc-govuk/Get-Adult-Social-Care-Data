import React from 'react';

type TableColumn = {
  text: string;
};
type Props = {
  head: TableColumn[];
  rows: TableColumn[][];
};
const XYZDataTable: React.FC<Props> = ({ head, rows }) => {
  return (
    <table className="govuk-table">
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          {head.map((value) => (
            <th scope="col" className="govuk-table__header" key={value.text}>
              {value.text}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {rows.map((row, idx) => (
          <tr className="govuk-table__row" key={idx}>
            {row.map((value, idx) => (
              <td className="govuk-table__cell" key={idx}>
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
