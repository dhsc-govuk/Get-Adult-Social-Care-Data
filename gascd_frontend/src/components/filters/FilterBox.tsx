import React from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  children?: React.ReactNode;
  // An optional second column in the same panel, applied and cleared by the
  // same buttons - e.g. the population group beside the bed type filter.
  aside?: React.ReactNode;
  idPrefix: string;
};

const FilterBox: React.FC<Props> = ({ children, aside, idPrefix }) => {
  const route = useRouter();

  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <div id={`${idPrefix}-content`} className="dhsc-filter--content">
            <form>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-third govuk-grid-column-one-third-searchable-radios-section">
                  <div
                    className="app-c-option-select js-collapsible"
                    id={`${idPrefix}-options`}
                  >
                    {children}
                  </div>
                </div>
                {aside && (
                  <div className="govuk-grid-column-one-third">{aside}</div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterBox;
