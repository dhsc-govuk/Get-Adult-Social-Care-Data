'use client';
import { useCallback, useEffect, useState } from 'react';

const FILTER_CHANGE_EVENT = 'gascd-filter-change';

/**
 * For a filter shown in more than one tab. Pass `key` to every copy and call
 * `announce` after applying or clearing: each copy remounts and reads the new
 * selection from local storage.
 */
export function useFilterSync(filterType: string): {
  key: number;
  announce: () => void;
} {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const handleChange = (event: Event) => {
      if ((event as CustomEvent<string>).detail === filterType) {
        setKey((current) => current + 1);
      }
    };
    window.addEventListener(FILTER_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(FILTER_CHANGE_EVENT, handleChange);
  }, [filterType]);

  const announce = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent(FILTER_CHANGE_EVENT, { detail: filterType })
    );
  }, [filterType]);

  return { key, announce };
}
