'use client';
import { useEffect, useState } from 'react';
import { withBasePath } from '@/lib/basePath';
import { ComparatorSelection, CustomComparatorGroup } from './types';

const GROUPS_URL = '/api/comparator_groups';

const parseGroup = (raw: unknown): CustomComparatorGroup | null => {
  const group = raw as Partial<CustomComparatorGroup> | null;
  if (
    typeof group?.id === 'string' &&
    typeof group?.name === 'string' &&
    Array.isArray(group?.laCodes)
  ) {
    return { id: group.id, name: group.name, laCodes: group.laCodes };
  }
  return null;
};

// Reads the error message from a failed response, falling back to a generic
// one, and throws it - callers surface it in the builder panel.
const throwResponseError = async (res: Response): Promise<never> => {
  let message = 'Your comparator group could not be saved. Try again.';
  try {
    const body = await res.json();
    if (typeof body?.error === 'string') message = body.error;
  } catch {
    // Keep the generic message
  }
  throw new Error(message);
};

// Custom comparator groups are persisted against the user's account via
// /api/comparator_groups. Mutations are pessimistic: local state updates only
// after the server confirms, and failures throw with a user-facing message.
export function useComparatorGroups(): {
  groups: CustomComparatorGroup[];
  selection: ComparatorSelection;
  setSelection: (selection: ComparatorSelection) => void;
  saveGroup: (group: {
    name: string;
    laCodes: string[];
  }) => Promise<CustomComparatorGroup>;
  updateGroup: (
    id: string,
    group: { name: string; laCodes: string[] }
  ) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
} {
  const [groups, setGroups] = useState<CustomComparatorGroup[]>([]);
  const [selection, setSelection] = useState<ComparatorSelection>({
    kind: 'nhs_peer_group',
  });

  useEffect(() => {
    let cancelled = false;
    fetch(withBasePath(GROUPS_URL))
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data: { groups?: unknown[] }) => {
        if (cancelled) return;
        const loaded = (data.groups ?? [])
          .map(parseGroup)
          .filter((group): group is CustomComparatorGroup => group !== null);
        // Merge rather than replace: any group already in local state was
        // created or edited by the user after this request started, so it is
        // fresher than the server snapshot and must not be dropped.
        setGroups((current) => {
          const loadedIds = new Set(loaded.map((group) => group.id));
          return [
            ...loaded.map(
              (group) =>
                current.find((existing) => existing.id === group.id) ?? group
            ),
            ...current.filter((group) => !loadedIds.has(group.id)),
          ];
        });
      })
      .catch((error) => {
        // Saved groups are unavailable this visit; the NHS peer group and
        // group creation still work
        console.error('Error loading comparator groups:', error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveGroup = async (group: { name: string; laCodes: string[] }) => {
    const res = await fetch(withBasePath(GROUPS_URL), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(group),
    });
    if (!res.ok) await throwResponseError(res);
    const data = await res.json();
    const newGroup = parseGroup(data?.group);
    if (!newGroup) {
      throw new Error('Your comparator group could not be saved. Try again.');
    }
    setGroups((current) => [...current, newGroup]);
    setSelection({ kind: 'custom', groupId: newGroup.id });
    return newGroup;
  };

  const updateGroup = async (
    id: string,
    group: { name: string; laCodes: string[] }
  ) => {
    const res = await fetch(withBasePath(`${GROUPS_URL}/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(group),
    });
    if (!res.ok) await throwResponseError(res);
    const data = await res.json();
    const updated = parseGroup(data?.group);
    if (!updated) {
      throw new Error('Your comparator group could not be saved. Try again.');
    }
    setGroups((current) =>
      current.map((existing) => (existing.id === id ? updated : existing))
    );
  };

  const deleteGroup = async (id: string) => {
    const res = await fetch(withBasePath(`${GROUPS_URL}/${id}`), {
      method: 'DELETE',
    });
    if (!res.ok) await throwResponseError(res);
    setGroups((current) => current.filter((existing) => existing.id !== id));
    // A deleted group cannot stay selected - fall back to the NHS peer group
    setSelection((current) =>
      current.kind === 'custom' && current.groupId === id
        ? { kind: 'nhs_peer_group' }
        : current
    );
  };

  return {
    groups,
    selection,
    setSelection,
    saveGroup,
    updateGroup,
    deleteGroup,
  };
}
