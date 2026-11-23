'use client';
import { useEffect, useState } from 'react';
import { withBasePath } from '@/lib/basePath';
import { MSPItems, MSPLookup } from './msp-lookup';

// MPS links by LA code, from the register. Null while loading. Uses the
// hard-coded list if the request fails.
export function useMpsLinks(): MSPItems | null {
  const [links, setLinks] = useState<MSPItems | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(withBasePath('/api/get_mps_links'))
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data: MSPItems) => {
        if (!cancelled) setLinks(data);
      })
      .catch(() => {
        if (!cancelled) setLinks(MSPLookup);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return links;
}
