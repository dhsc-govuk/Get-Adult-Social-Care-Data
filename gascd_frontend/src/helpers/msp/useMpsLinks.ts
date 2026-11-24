'use client';
import { useEffect, useState } from 'react';
import { withBasePath } from '@/lib/basePath';
import { MSPItems } from './types';

// MPS links by LA code, from the register. Null while loading. Has no links
// if the request fails.
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
        if (!cancelled) setLinks({});
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return links;
}
