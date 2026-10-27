'use client';
import React, { useMemo, useState } from 'react';
import { MSPLookup } from '@/helpers/msp/msp-lookup';
import AnalyticsService from '@/services/analytics/analyticsService';
import { LocalAuthoritySummary } from '@/components/charts/peer-group/types';

type Props = {
  authorities: LocalAuthoritySummary[];
  loadError: boolean;
  label: string;
  // Shown beside the View statement button
  extraAction?: React.ReactNode;
};

const INPUT_ID = 'mps-search-la';
const LISTBOX_ID = `${INPUT_ID}-listbox`;

// Names starting with the text first, then names with a later word starting
// with it, so "york" finds York and North Yorkshire
const matches = (authorities: LocalAuthoritySummary[], term: string) => {
  const query = term.trim().toLowerCase();
  if (!query) return [];
  const name = (la: LocalAuthoritySummary) => la.laName.toLowerCase();
  const startsWith = authorities.filter((la) => name(la).startsWith(query));
  const wordStartsWith = authorities.filter(
    (la) =>
      !name(la).startsWith(query) &&
      name(la)
        .split(/[\s,-]+/)
        .some((word) => word.startsWith(query))
  );
  return [...startsWith, ...wordStartsWith];
};

const MpsSearchForm: React.FC<Props> = ({
  authorities,
  loadError,
  label,
  extraAction,
}) => {
  const [term, setTerm] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);

  const options = useMemo(
    () => matches(authorities, term),
    [authorities, term]
  );
  const showList = listOpen && options.length > 0;

  const choose = (la: LocalAuthoritySummary) => {
    setTerm(la.laName);
    setListOpen(false);
    setActiveIndex(-1);
    setError(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && options.length > 0) {
      event.preventDefault();
      setListOpen(true);
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === 'ArrowUp' && showList) {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && showList && activeIndex >= 0) {
      event.preventDefault();
      choose(options[activeIndex]);
    } else if (event.key === 'Escape') {
      setListOpen(false);
      setActiveIndex(-1);
    }
  };

  const viewStatement = () => {
    setNotFound(null);
    if (!term.trim()) {
      setError('Enter a local authority');
      return;
    }
    const la = authorities.find(
      (authority) =>
        authority.laName.toLowerCase() === term.trim().toLowerCase()
    );
    if (!la) {
      setError('Select a local authority from the list');
      return;
    }
    setError(null);
    const url = MSPLookup[la.laCode]?.url;
    if (!url) {
      setNotFound(la.laName);
      return;
    }
    AnalyticsService.trackMPSClicked(la.laCode);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div
        className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}
      >
        <label
          className="govuk-label govuk-!-font-weight-bold"
          htmlFor={INPUT_ID}
        >
          {label}
        </label>
        <div id={`${INPUT_ID}-hint`} className="govuk-hint">
          Start typing, for example Leeds or Surrey
        </div>
        {error && (
          <p id={`${INPUT_ID}-error`} className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {error}
          </p>
        )}
        {loadError && (
          <p className="govuk-body">
            The list of local authorities could not be loaded. Try again later.
          </p>
        )}
        <div className="app-mps-search">
          <input
            id={INPUT_ID}
            className={`govuk-input${error ? ' govuk-input--error' : ''}`}
            type="text"
            role="combobox"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={LISTBOX_ID}
            aria-activedescendant={
              showList && activeIndex >= 0
                ? `${LISTBOX_ID}-${activeIndex}`
                : undefined
            }
            aria-describedby={`${INPUT_ID}-hint${error ? ` ${INPUT_ID}-error` : ''}`}
            value={term}
            onChange={(event) => {
              setTerm(event.target.value);
              setListOpen(true);
              setActiveIndex(-1);
              setNotFound(null);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => setListOpen(false)}
          />
          <ul
            id={LISTBOX_ID}
            role="listbox"
            className="app-mps-search__menu"
            hidden={!showList}
          >
            {options.map((la, index) => (
              <li
                key={la.laCode}
                id={`${LISTBOX_ID}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`app-mps-search__option${index === activeIndex ? ' app-mps-search__option--focused' : ''}`}
                // Choose before the input's blur closes the list
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(la);
                }}
              >
                {la.laName}
              </li>
            ))}
          </ul>
        </div>
        <div className="govuk-visually-hidden" role="status">
          {listOpen && term.trim()
            ? `${options.length} ${options.length === 1 ? 'result is' : 'results are'} available`
            : ''}
        </div>
      </div>
      {notFound && (
        <p className="govuk-body">
          We were unable to find a market position statement for {notFound}. Get
          in touch with the <abbr title="Local Authority">LA</abbr> to request
          it.
        </p>
      )}
      <div className="govuk-button-group govuk-!-margin-bottom-0">
        <button type="button" className="govuk-button" onClick={viewStatement}>
          View statement
          <span className="govuk-visually-hidden"> (opens in new tab)</span>
        </button>
        {extraAction}
      </div>
    </>
  );
};

export default MpsSearchForm;
