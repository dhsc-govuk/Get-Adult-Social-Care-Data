/** The value of a filter's "All" checkbox, which stands for no filter */
export const ALL_OPTION = 'all';

/**
 * The checked boxes of a filter after one is ticked or unticked. "All" and the
 * specific options replace each other. With nothing else ticked "All" applies,
 * so it is ticked: unticking the last option ticks it, and it cannot be
 * unticked itself.
 */
export const toggleOption = (
  checked: string[],
  value: string,
  isChecked: boolean
): string[] => {
  if (value === ALL_OPTION) return [ALL_OPTION];
  const others = checked.filter(
    (option) => option !== ALL_OPTION && option !== value
  );
  const next = isChecked ? [...others, value] : others;
  return next.length ? next : [ALL_OPTION];
};

/** The checked boxes for an applied selection, where none chosen means "All" */
export const toChecked = (selected: string[] = []): string[] =>
  selected.length ? selected : [ALL_OPTION];

/**
 * The selection to apply, in the order the options are listed whatever order
 * they were ticked in. "All" is no filter.
 */
export const toSelected = (
  checked: string[],
  options: { value: string }[]
): string[] =>
  options.map((option) => option.value).filter((v) => checked.includes(v));

/** The options whose label contains the search text */
export const matchingOptions = <T extends { label: string }>(
  options: T[],
  search: string
): T[] => {
  const term = search.trim().toLowerCase();
  return term
    ? options.filter((option) => option.label.toLowerCase().includes(term))
    : options;
};
