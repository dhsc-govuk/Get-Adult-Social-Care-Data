import React from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  children?: React.ReactNode;
};

const FilterBox: React.FC<Props> = ({ children }) => {
  const route = useRouter();

  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <div
            id="dhsc-filter--content1"
            className="dhsc-filter--content"
            aria-labelledby="dhsc-filter--button1"
          >
            <form>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-third govuk-grid-column-one-third-searchable-radios-section">
                  <div
                    className="app-c-option-select js-collapsible"
                    id="bed-type-radios"
                  >
                    <h3 className="js-container-heading govuk-heading-s searchable-filters-heading">
                      Bed type
                      <span
                        className="app-c-option-select__title app-c-option-select__button govuk-heading-s"
                        id="option-select-title-status-radios"
                      ></span>
                    </h3>
                    <div
                      id="radios-search"
                      className="app-c-option-select__filter"
                      hidden
                    >
                      <label
                        htmlFor="input-bedtype-radios"
                        className="govuk-label govuk-visually-hidden"
                      >
                        Bed type
                      </label>
                      <input
                        name="option-select-filter-bedtype-radios"
                        id="input-bedtype-radios"
                        className="app-c-option-select__filter-input govuk-input"
                        type="text"
                        aria-controls="radios-status"
                      />
                    </div>
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
