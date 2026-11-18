import React, { useState } from 'react';

type Props = {
  inputId: string;
  value: string;
  onChange: (value: string) => void;
  // The suggestions for the text typed, listed below the input
  options: string[];
  // Called with the index of the suggestion selected
  onChoose: (index: number) => void;
  hasError?: boolean;
};

/**
 * A text input that lists suggestions below it as the user types, which can
 * be selected with the mouse or the arrow keys and Enter. The label, hint and
 * any error message belong to the form around it, with ids `<inputId>-hint`
 * and `<inputId>-error`.
 */
const SearchCombobox: React.FC<Props> = ({
  inputId,
  value,
  onChange,
  options,
  onChoose,
  hasError = false,
}) => {
  const listboxId = `${inputId}-listbox`;
  const [listOpen, setListOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const showList = listOpen && options.length > 0;

  const choose = (index: number) => {
    setListOpen(false);
    setActiveIndex(-1);
    onChoose(index);
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
      choose(activeIndex);
    } else if (event.key === 'Escape') {
      setListOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <>
      <div className="app-mps-search">
        <input
          id={inputId}
          className={`govuk-input${hasError ? ' govuk-input--error' : ''}`}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-activedescendant={
            showList && activeIndex >= 0
              ? `${listboxId}-${activeIndex}`
              : undefined
          }
          aria-describedby={`${inputId}-hint${hasError ? ` ${inputId}-error` : ''}`}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setListOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setListOpen(false)}
        />
        <ul
          id={listboxId}
          role="listbox"
          className="app-mps-search__menu"
          hidden={!showList}
        >
          {options.map((option, index) => (
            <li
              key={`${option}-${index}`}
              id={`${listboxId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`app-mps-search__option${index === activeIndex ? ' app-mps-search__option--focused' : ''}`}
              // Choose before the input's blur closes the list
              onMouseDown={(event) => {
                event.preventDefault();
                choose(index);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      </div>
      <div className="govuk-visually-hidden" role="status">
        {listOpen && value.trim()
          ? `${options.length} ${options.length === 1 ? 'result is' : 'results are'} available`
          : ''}
      </div>
    </>
  );
};

export default SearchCombobox;
