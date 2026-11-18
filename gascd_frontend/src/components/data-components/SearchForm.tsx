import React, { useEffect, useState } from 'react';
import SearchCombobox from '@/components/common/input/SearchCombobox';

type Props = {
  inputId: string;
  label: string;
  hint: string;
  // The search in place; the text typed is only used once Search is selected
  value: string;
  onSearch: (value: string) => void;
  // The suggestions to list below the input for the text typed
  suggest: (term: string) => Promise<string[]>;
};

// How long to wait after the last key press before asking for suggestions
const SUGGEST_DELAY_MS = 300;

const SearchForm: React.FC<Props> = ({
  inputId,
  label,
  hint,
  value,
  onSearch,
  suggest,
}) => {
  const [term, setTerm] = useState(value);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!term.trim()) {
      setOptions([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      suggest(term.trim())
        .then((suggestions) => {
          if (!cancelled) setOptions(suggestions);
        })
        .catch((error) => console.error('Error fetching suggestions:', error));
    }, SUGGEST_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term, suggest]);

  return (
    <form
      className="govuk-form-group"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(term.trim());
      }}
    >
      <label className="govuk-label govuk-!-font-weight-bold" htmlFor={inputId}>
        {label}
      </label>
      <div id={`${inputId}-hint`} className="govuk-hint">
        {hint}
      </div>
      <SearchCombobox
        inputId={inputId}
        value={term}
        onChange={setTerm}
        options={options}
        onChoose={(index) => {
          setTerm(options[index]);
          onSearch(options[index]);
        }}
      />
      <div className="govuk-!-margin-top-3">
        <button
          type="submit"
          className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchForm;
