import React from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  children?: React.ReactNode;
  // Namespaces this instance's element ids. Several filters render on one page,
  // so fixed ids here would be duplicated across them.
  idPrefix: string;
};

const FilterBox: React.FC<Props> = ({ children, idPrefix }) => {
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
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterBox;
