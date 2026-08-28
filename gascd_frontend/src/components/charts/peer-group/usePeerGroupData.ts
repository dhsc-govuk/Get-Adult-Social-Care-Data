'use client';
import { useEffect, useMemo, useState } from 'react';
import { withBasePath } from '@/lib/basePath';
import {
  mapCustomGroupResponse,
  mapPeerGroupResponse,
} from './MapPeerGroupResponse';
import {
  ComparatorSelection,
  CustomComparatorGroup,
  CustomGroupApiResponse,
  PeerGroupApiResponse,
  PeerGroupData,
} from './types';

const isValidLaCode = (laCode: string | undefined): laCode is string =>
  Boolean(laCode) && laCode !== 'Loading...' && laCode !== 'undefined';

const fetchNhsPeerGroup = async (
  laCode: string,
  metricCode: string
): Promise<PeerGroupData> => {
  const res = await fetch(
    withBasePath(
      `/api/get_la_peers?la_code=${encodeURIComponent(laCode)}&metric_code=${encodeURIComponent(metricCode)}`
    )
  );
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data: PeerGroupApiResponse = await res.json();
  return mapPeerGroupResponse(data);
};

const fetchCustomGroup = async (
  laCodes: string[],
  metricCode: string
): Promise<PeerGroupData> => {
  const codeParams = laCodes
    .map((code) => `la_codes=${encodeURIComponent(code)}`)
    .join('&');
  const res = await fetch(
    withBasePath(
      `/api/get_custom_group_values?${codeParams}&metric_code=${encodeURIComponent(metricCode)}`
    )
  );
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data: CustomGroupApiResponse = await res.json();
  return mapCustomGroupResponse(data);
};

// Single fetcher for all peer-group charts on a page: one request per metric,
// shared by the Chart, Table and Download tabs.
export function usePeerGroupData(
  laCode: string | undefined,
  metricCodes: string[],
  selection: ComparatorSelection,
  groups: CustomComparatorGroup[]
): {
  dataByMetric: Record<string, PeerGroupData | null>;
  loading: boolean;
  error: boolean;
} {
  const [dataByMetric, setDataByMetric] = useState<
    Record<string, PeerGroupData | null>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const selectedGroup = useMemo(
    () =>
      selection.kind === 'custom'
        ? (groups.find((group) => group.id === selection.groupId) ?? null)
        : null,
    [selection, groups]
  );

  const metricsKey = metricCodes.join(',');
  const selectionKey =
    selection.kind === 'custom'
      ? `custom:${selectedGroup?.id}:${selectedGroup?.laCodes.join(',')}`
      : selection.kind;

  useEffect(() => {
    if (!isValidLaCode(laCode) || metricCodes.length === 0) {
      setDataByMetric({});
      setLoading(false);
      setError(false);
      return;
    }
    if (selection.kind === 'custom' && !selectedGroup) {
      setDataByMetric({});
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);
    // Drop the previous comparator's values immediately: the table and CSV
    // derive from dataByMetric directly and switch their heading as soon as
    // the selection changes, so leaving the old values in place would show
    // the previous group's average under the new group's name.
    setDataByMetric({});

    // Each metric is fetched independently so one failure does not discard
    // the data for the other metrics on the page.
    Promise.allSettled(
      metricCodes.map(async (metricCode) => {
        const data = selectedGroup
          ? await fetchCustomGroup(selectedGroup.laCodes, metricCode)
          : await fetchNhsPeerGroup(laCode, metricCode);
        return [metricCode, data] as const;
      })
    ).then((results) => {
      if (cancelled) return;
      const entries = results.map((result, index) => {
        if (result.status === 'fulfilled') return result.value;
        console.error(
          `Error fetching comparator data for ${metricCodes[index]}:`,
          result.reason
        );
        return [metricCodes[index], null] as const;
      });
      setDataByMetric(Object.fromEntries(entries));
      // Failed metrics are null in dataByMetric, which their chart/table show
      // as unavailable; the page-wide error flag is for the case where
      // nothing came back at all.
      setError(results.every((result) => result.status === 'rejected'));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [laCode, metricsKey, selectionKey]);

  return { dataByMetric, loading, error };
}
