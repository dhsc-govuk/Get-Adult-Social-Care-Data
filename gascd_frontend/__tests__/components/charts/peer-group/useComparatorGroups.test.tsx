import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useComparatorGroups } from '@/components/charts/peer-group/useComparatorGroups';

const jsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

describe('useComparatorGroups', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    // Default: no saved groups
    mockFetch.mockResolvedValue(jsonResponse({ groups: [] }));
  });

  it('starts with the NHS peer group selected and loads saved groups on mount', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        groups: [{ id: 'abc', name: 'Stored group', laCodes: ['E08000018'] }],
      })
    );

    const { result } = renderHook(() => useComparatorGroups());
    expect(result.current.selection).toEqual({ kind: 'nhs_peer_group' });

    await waitFor(() =>
      expect(result.current.groups).toEqual([
        { id: 'abc', name: 'Stored group', laCodes: ['E08000018'] },
      ])
    );
    expect(mockFetch).toHaveBeenCalledWith('/api/comparator_groups');
    // The selection still defaults to the NHS peer group each visit
    expect(result.current.selection).toEqual({ kind: 'nhs_peer_group' });
  });

  it('keeps a group saved while the initial load is still pending', async () => {
    let resolveInitialLoad!: (value: Response) => void;
    mockFetch.mockReturnValueOnce(
      new Promise<Response>((res) => {
        resolveInitialLoad = res;
      })
    );
    const { result } = renderHook(() => useComparatorGroups());

    // The user saves a new group before the mount-time GET has returned
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        group: { id: 'new-id', name: 'Brand new', laCodes: ['E08000014'] },
      })
    );
    await act(async () => {
      await result.current.saveGroup({
        name: 'Brand new',
        laCodes: ['E08000014'],
      });
    });
    expect(result.current.selection).toEqual({
      kind: 'custom',
      groupId: 'new-id',
    });

    // The stale snapshot arrives without the new group
    await act(async () => {
      resolveInitialLoad(
        jsonResponse({
          groups: [{ id: 'abc', name: 'Stored group', laCodes: ['E08000018'] }],
        })
      );
    });

    expect(result.current.groups).toEqual([
      { id: 'abc', name: 'Stored group', laCodes: ['E08000018'] },
      { id: 'new-id', name: 'Brand new', laCodes: ['E08000014'] },
    ]);
    expect(result.current.selection).toEqual({
      kind: 'custom',
      groupId: 'new-id',
    });
  });

  it('keeps working with no saved groups when the load fails', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'boom' }, 500));
    const { result } = renderHook(() => useComparatorGroups());
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(result.current.groups).toEqual([]);
  });

  it('saves a group via POST and selects it', async () => {
    const { result } = renderHook(() => useComparatorGroups());
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    mockFetch.mockResolvedValueOnce(
      jsonResponse(
        {
          group: {
            id: 'new-id',
            name: 'Custom group 1',
            laCodes: ['E08000014', 'E08000015'],
          },
        },
        201
      )
    );

    await act(async () => {
      await result.current.saveGroup({
        name: 'Custom group 1',
        laCodes: ['E08000014', 'E08000015'],
      });
    });

    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/comparator_groups',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.current.groups).toEqual([
      {
        id: 'new-id',
        name: 'Custom group 1',
        laCodes: ['E08000014', 'E08000015'],
      },
    ]);
    expect(result.current.selection).toEqual({
      kind: 'custom',
      groupId: 'new-id',
    });
  });

  it('throws the server error message when a save fails and keeps state unchanged', async () => {
    const { result } = renderHook(() => useComparatorGroups());
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    mockFetch.mockResolvedValueOnce(
      jsonResponse(
        { error: 'A comparator group with this name already exists' },
        400
      )
    );

    await expect(
      act(async () => {
        await result.current.saveGroup({ name: 'Dup', laCodes: ['E08000014'] });
      })
    ).rejects.toThrow('A comparator group with this name already exists');
    expect(result.current.groups).toEqual([]);
    expect(result.current.selection).toEqual({ kind: 'nhs_peer_group' });
  });

  it('updates a group via PUT, keeping it selected', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        groups: [{ id: 'abc', name: 'Original', laCodes: ['E08000014'] }],
      })
    );
    const { result } = renderHook(() => useComparatorGroups());
    await waitFor(() => expect(result.current.groups).toHaveLength(1));

    act(() => {
      result.current.setSelection({ kind: 'custom', groupId: 'abc' });
    });

    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        group: { id: 'abc', name: 'Renamed', laCodes: ['E08000015'] },
      })
    );
    await act(async () => {
      await result.current.updateGroup('abc', {
        name: 'Renamed',
        laCodes: ['E08000015'],
      });
    });

    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/comparator_groups/abc',
      expect.objectContaining({ method: 'PUT' })
    );
    expect(result.current.groups).toEqual([
      { id: 'abc', name: 'Renamed', laCodes: ['E08000015'] },
    ]);
    expect(result.current.selection).toEqual({
      kind: 'custom',
      groupId: 'abc',
    });
  });

  it('deletes a group via DELETE and falls back to the NHS peer group if it was selected', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        groups: [{ id: 'abc', name: 'To delete', laCodes: ['E08000014'] }],
      })
    );
    const { result } = renderHook(() => useComparatorGroups());
    await waitFor(() => expect(result.current.groups).toHaveLength(1));

    act(() => {
      result.current.setSelection({ kind: 'custom', groupId: 'abc' });
    });

    mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'OK' }));
    await act(async () => {
      await result.current.deleteGroup('abc');
    });

    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/comparator_groups/abc',
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(result.current.groups).toEqual([]);
    expect(result.current.selection).toEqual({ kind: 'nhs_peer_group' });
  });

  it('keeps the selection when deleting a group that is not selected', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        groups: [
          { id: 'first', name: 'First', laCodes: ['E08000014'] },
          { id: 'second', name: 'Second', laCodes: ['E08000015'] },
        ],
      })
    );
    const { result } = renderHook(() => useComparatorGroups());
    await waitFor(() => expect(result.current.groups).toHaveLength(2));

    act(() => {
      result.current.setSelection({ kind: 'custom', groupId: 'second' });
    });

    mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'OK' }));
    await act(async () => {
      await result.current.deleteGroup('first');
    });

    expect(result.current.groups).toHaveLength(1);
    expect(result.current.selection).toEqual({
      kind: 'custom',
      groupId: 'second',
    });
  });
});
