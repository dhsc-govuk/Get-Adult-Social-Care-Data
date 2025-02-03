'use client';

import React from 'react';

type Props = {
  indicatorView: string;
  svgRef: React.RefObject<HTMLDivElement>;
};

const IndicatorView: React.FC<Props> = ({ indicatorView, svgRef }) => {
  return <>{indicatorView === 'barchart' && <div ref={svgRef}></div>}</>;
};

export default IndicatorView;
