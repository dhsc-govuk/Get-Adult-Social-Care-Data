'use client';
import { useEffect, useState } from 'react';
import { withBasePath } from '@/lib/basePath';
import { LocalAuthoritySummary } from './types';

interface LocalAuthorityListApiResponse {
  local_authorities?: {
    code?: string;
    display_name?: string;
    region_code?: string;
    region_name?: string;
  }[];
}

// Lazily fetches the full list of local authorities the first time it is
// enabled (i.e. when the comparator group builder opens).
export function useAllLocalAuthorities(enabled: boolean): {
  authorities: LocalAuthoritySummary[] | null;
  error: boolean;
} {
  const [authorities, setAuthorities] = useState<
    LocalAuthoritySummary[] | null
  >(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled || authorities) return;

    let cancelled = false;
    setError(false);
    fetch(withBasePath('/api/get_la_list'))
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data: LocalAuthorityListApiResponse) => {
        if (cancelled) return;
        setAuthorities(
          (data.local_authorities ?? [])
            .filter((la) => la.code && la.display_name)
            .map((la) => ({
              laCode: la.code as string,
              laName: la.display_name as string,
              regionName: la.region_name,
            }))
        );
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, authorities]);

  return { authorities, error };
}
