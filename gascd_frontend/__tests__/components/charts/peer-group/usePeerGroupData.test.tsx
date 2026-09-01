import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { usePeerGroupData } from '@/components/charts/peer-group/usePeerGroupData';
import {
  ComparatorSelection,
  CustomComparatorGroup,
} from '@/components/charts/peer-group/types';

const jsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

// A fetch response the test resolves by hand, to control request ordering
const deferred = () => {
  let resolve!: (value: Response) => void;
  const promise = new Promise<Response>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const groups: CustomComparatorGroup[] = [
  { id: 'g1', name: 'Group one', laCodes: ['E08000015'] },
  { id: 'g2', name: 'Group two', laCodes: ['E08000016'] },
];
const metrics = ['metric_a', 'metric_b'];

describe('usePeerGroupData', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = mockFetch;
  });

  it('drops the previous comparator values as soon as the selection changes', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ group_members: [], custom_group_average: 11 })
    );
    const { result, rerender } = renderHook(
      ({ selection }: { selection: ComparatorSelection }) =>
        usePeerGroupData('E08000014', metrics, selection, groups),
      { initialProps: { selection: { kind: 'custom', groupId: 'g1' } } }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.dataByMetric.metric_a?.averagePeerGroup).toBe(11);

    // Switch to group two, whose responses are held back
    const pending = [deferred(), deferred()];
    mockFetch
      .mockReturnValueOnce(pending[0].promise)
      .mockReturnValueOnce(pending[1].promise);
    rerender({ selection: { kind: 'custom', groupId: 'g2' } });

    // While loading, nothing from group one may still be visible
    expect(result.current.loading).toBe(true);
    expect(result.current.dataByMetric).toEqual({});

    await act(async () => {
      pending[0].resolve(
        jsonResponse({ group_members: [], custom_group_average: 22 })
      );
      pending[1].resolve(
        jsonResponse({ group_members: [], custom_group_average: 23 })
      );
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.dataByMetric.metric_a?.averagePeerGroup).toBe(22);
    expect(result.current.dataByMetric.metric_b?.averagePeerGroup).toBe(23);
  });

  it('ignores a late response from a superseded selection', async () => {
    const slow = [deferred(), deferred()];
    mockFetch
      .mockReturnValueOnce(slow[0].promise)
      .mockReturnValueOnce(slow[1].promise);
    const { result, rerender } = renderHook(
      ({ selection }: { selection: ComparatorSelection }) =>
        usePeerGroupData('E08000014', metrics, selection, groups),
      { initialProps: { selection: { kind: 'custom', groupId: 'g1' } } }
    );

    mockFetch.mockResolvedValue(
      jsonResponse({ group_members: [], custom_group_average: 22 })
    );
    rerender({ selection: { kind: 'custom', groupId: 'g2' } });
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Group one's responses arrive after group two has already resolved
    await act(async () => {
      slow[0].resolve(
        jsonResponse({ group_members: [], custom_group_average: 11 })
      );
      slow[1].resolve(
        jsonResponse({ group_members: [], custom_group_average: 11 })
      );
    });
    expect(result.current.dataByMetric.metric_a?.averagePeerGroup).toBe(22);
    expect(result.current.dataByMetric.metric_b?.averagePeerGroup).toBe(22);
  });

  it('keeps the metrics that loaded when one metric request fails', async () => {
    mockFetch.mockImplementation((url: string) =>
      Promise.resolve(
        url.includes('metric_code=metric_b')
          ? jsonResponse({ error: 'boom' }, 500)
          : jsonResponse({
              local_authority_peers: [],
              average_peer_group: 7.5,
              national_average: 10,
            })
      )
    );
    const { result } = renderHook(() =>
      usePeerGroupData('E08000014', metrics, { kind: 'nhs_peer_group' }, groups)
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.dataByMetric.metric_a?.averagePeerGroup).toBe(7.5);
    expect(result.current.dataByMetric.metric_b).toBeNull();
    // Only a total failure is a page-wide error
    expect(result.current.error).toBe(false);
  });

  it('flags a page-wide error only when every metric request fails', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ error: 'boom' }, 500));
    const { result } = renderHook(() =>
      usePeerGroupData('E08000014', metrics, { kind: 'nhs_peer_group' }, groups)
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(true);
    expect(result.current.dataByMetric).toEqual({
      metric_a: null,
      metric_b: null,
    });
  });
});
