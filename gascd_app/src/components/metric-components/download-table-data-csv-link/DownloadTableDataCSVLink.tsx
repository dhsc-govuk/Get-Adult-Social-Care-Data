import React, { useState } from "react";
import { downloadCSV } from "../../../helpers/downloadToCsvHelpers";

type Props = {
  data: any[];
  filename?: string;
  xLabel: string;
};

const DownloadTableDataCSVLink: React.FC<Props> = ({
  data,
  filename = "data.csv",
  xLabel,
}) => {

  const handleDownloadClick = () => {
    downloadCSV(data, filename, xLabel);
  };

  return (
    <>
      <a href="#" className="govuk-link" onClick={handleDownloadClick}>Download table data (CSV)</a>          
    </>
  );
};

export default DownloadTableDataCSVLink;
