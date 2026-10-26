import React from 'react';

type Props = {
  comparator?: React.ReactNode;
  // Further selects stacked below the comparison group, e.g. the population
  extraControls?: React.ReactNode;
  filters?: React.ReactNode;
};

// The controls that shape a section's view, kept together above its data
// and separated from it by a divider (GASCD-300)
const SectionControls: React.FC<Props> = ({
  comparator,
  extraControls,
  filters,
}) => (
  <div className="dhsc-section-controls">
    {[comparator, extraControls].map(
      (control, index) =>
        control && (
          <div key={index} className="dhsc-section-controls__item">
            {control}
          </div>
        )
    )}
    {filters && (
      <div className="dhsc-section-controls__item dhsc-section-controls__filters">
        {filters}
      </div>
    )}
    <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
  </div>
);

export default SectionControls;
