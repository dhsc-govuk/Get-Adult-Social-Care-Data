import { ALL_LOCATIONS, ProviderLocation } from '@/lib/manageUsers';

type Props = {
  // Given to the first box, so an error summary link can focus it
  id: string;
  providerWide: boolean;
  locations: ProviderLocation[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

// Ticking "All locations" clears the others, and ticking any other clears it
export const toggleLocation = (
  selected: string[],
  code: string,
  checked: boolean
) => {
  if (code === ALL_LOCATIONS) return checked ? [ALL_LOCATIONS] : [];
  const others = selected.filter((c) => c !== code && c !== ALL_LOCATIONS);
  return checked ? [...others, code] : others;
};

export default function LocationCheckboxes({
  id,
  providerWide,
  locations,
  selected,
  onChange,
}: Props) {
  const box = (code: string, boxId: string, label: string, hint?: string) => (
    <div className="govuk-checkboxes__item" key={code}>
      <input
        className="govuk-checkboxes__input"
        id={boxId}
        name="locations"
        type="checkbox"
        value={code}
        checked={selected.includes(code)}
        onChange={(event) =>
          onChange(toggleLocation(selected, code, event.target.checked))
        }
        aria-describedby={hint ? `${boxId}-hint` : undefined}
      />
      <label className="govuk-label govuk-checkboxes__label" htmlFor={boxId}>
        {label}
      </label>
      {hint && (
        <div id={`${boxId}-hint`} className="govuk-hint govuk-checkboxes__hint">
          {hint}
        </div>
      )}
    </div>
  );

  return (
    <div className="govuk-checkboxes" data-module="govuk-checkboxes">
      {providerWide && (
        <>
          {box(
            ALL_LOCATIONS,
            id,
            'All locations',
            'Includes any locations added in future'
          )}
          <div className="govuk-checkboxes__divider">or</div>
        </>
      )}
      {locations.map((location, index) =>
        box(
          location.code,
          !providerWide && index === 0 ? id : `${id}-${location.code}`,
          location.name
        )
      )}
    </div>
  );
}
