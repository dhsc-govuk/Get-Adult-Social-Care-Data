import 'server-only';

import { NextResponse } from 'next/server';
import { authDB } from '@/lib/auth';
import { getAPIClient } from '@/data/dataAPI';
import logger from '@/utils/logger';
import {
  MAX_GROUPS_PER_USER,
  validateGroupName,
} from '@/lib/comparatorGroups';

export interface ComparatorGroupRow {
  id: string;
  userId: string;
  name: string;
  laCodes: string; // JSON-serialised string array
  createdAt: Date;
  updatedAt: Date;
}

export interface ComparatorGroupDto {
  id: string;
  name: string;
  laCodes: string[];
}

export const toDto = (row: ComparatorGroupRow): ComparatorGroupDto => {
  let laCodes: string[] = [];
  try {
    const parsed = JSON.parse(row.laCodes);
    if (Array.isArray(parsed)) {
      laCodes = parsed.filter((code): code is string => typeof code === 'string');
    }
  } catch {
    logger.error(`Malformed laCodes stored for comparator group ${row.id}`);
  }
  return { id: row.id, name: row.name, laCodes };
};

export const listGroupsForUser = async (
  userId: string
): Promise<ComparatorGroupRow[]> => {
  // authDB is Kysely<any>, so rows come back untyped
  return (await authDB
    .selectFrom('comparatorGroup')
    .selectAll()
    .where('userId', '=', userId)
    .orderBy('createdAt')
    .execute()) as ComparatorGroupRow[];
};

const normalizeName = (name: string) => name.trim().toLowerCase();

const deleteGroupRow = (id: string, userId: string) =>
  authDB
    .deleteFrom('comparatorGroup')
    .where('id', '=', id)
    .where('userId', '=', userId)
    .execute();

export type InsertGuardResult = 'ok' | 'duplicate_name' | 'limit_exceeded';

// A write rejected by UQ_comparatorGroup_userId_name (created by
// scripts/user-db-post-migrate.ts) is the authoritative duplicate signal;
// confirm against the table so unrelated DB errors still propagate.
const isDuplicateNameViolation = async (
  userId: string,
  name: string,
  excludeId?: string
): Promise<boolean> => {
  const rows = await listGroupsForUser(userId);
  return rows.some(
    (row) =>
      row.id !== excludeId && normalizeName(row.name) === normalizeName(name)
  );
};

// Inserts a group, then re-checks the duplicate-name and max-count rules.
// The route's pre-checks give fast, friendly errors, but concurrent requests
// can both pass them. Two layers close the race: the DB unique index on
// (userId, name) rejects a duplicate outright, and the post-insert re-check
// covers the max-count rule (which no constraint enforces) - on a conflict
// the deterministic winner (lowest id / earliest created) survives and this
// request removes its own row and reports the conflict.
export const insertGroupWithGuards = async (
  group: ComparatorGroupRow
): Promise<InsertGuardResult> => {
  try {
    await authDB.insertInto('comparatorGroup').values(group).execute();
  } catch (error) {
    if (await isDuplicateNameViolation(group.userId, group.name)) {
      return 'duplicate_name';
    }
    throw error;
  }

  const rows = await listGroupsForUser(group.userId);

  const duplicates = rows.filter(
    (row) => normalizeName(row.name) === normalizeName(group.name)
  );
  if (duplicates.length > 1 && duplicates.some((row) => row.id < group.id)) {
    await deleteGroupRow(group.id, group.userId);
    return 'duplicate_name';
  }

  if (rows.length > MAX_GROUPS_PER_USER) {
    const ordered = [...rows].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() ||
        (a.id < b.id ? -1 : 1)
    );
    const myIndex = ordered.findIndex((row) => row.id === group.id);
    if (myIndex >= MAX_GROUPS_PER_USER) {
      await deleteGroupRow(group.id, group.userId);
      return 'limit_exceeded';
    }
  }

  return 'ok';
};

// Applies an update, then re-checks the duplicate-name rule against
// concurrent writes; on a conflict the update is reverted to the previous
// values and the conflict reported.
export const updateGroupWithGuards = async (
  previous: ComparatorGroupRow,
  update: { name: string; laCodes: string }
): Promise<'ok' | 'duplicate_name'> => {
  const applyUpdate = (values: {
    name: string;
    laCodes: string;
    updatedAt: Date;
  }) =>
    authDB
      .updateTable('comparatorGroup')
      .set(values)
      .where('id', '=', previous.id)
      .where('userId', '=', previous.userId)
      .execute();

  try {
    await applyUpdate({ ...update, updatedAt: new Date() });
  } catch (error) {
    // The unique index rejected the rename atomically - nothing to revert
    if (
      await isDuplicateNameViolation(previous.userId, update.name, previous.id)
    ) {
      return 'duplicate_name';
    }
    throw error;
  }

  const rows = await listGroupsForUser(previous.userId);
  const clash = rows.some(
    (row) =>
      row.id !== previous.id &&
      normalizeName(row.name) === normalizeName(update.name)
  );
  if (clash) {
    await applyUpdate({
      name: previous.name,
      laCodes: previous.laCodes,
      updatedAt: previous.updatedAt,
    });
    return 'duplicate_name';
  }
  return 'ok';
};

// The LA reference list changes rarely - cache it in module scope so group
// validation does not hit the data API on every save.
const LA_CODES_CACHE_TTL_MS = 60 * 60 * 1000;
let laCodesCache: { codes: Set<string>; fetchedAt: number } | null = null;

export const getValidLaCodes = async (): Promise<Set<string> | null> => {
  if (laCodesCache && Date.now() - laCodesCache.fetchedAt < LA_CODES_CACHE_TTL_MS) {
    return laCodesCache.codes;
  }
  const client = getAPIClient();
  const { data, error, response } = await client.GET(
    '/metric_locations/local_authorities'
  );
  if (!response.ok || !data || error) {
    logger.error(
      `LA list fetch for comparator group validation failed: ${response.status}`
    );
    return null;
  }
  const codes = new Set(
    (data.local_authorities ?? [])
      .map((la) => la.code)
      .filter((code): code is string => Boolean(code))
  );
  laCodesCache = { codes, fetchedAt: Date.now() };
  return codes;
};

// Validates a submitted group body against the shared rules plus the LA
// reference list. Returns either the cleaned values or an error response.
export const validateGroupSubmission = async (
  body: unknown,
  existingNames: string[]
): Promise<
  | { ok: true; name: string; laCodes: string[] }
  | { ok: false; response: NextResponse }
> => {
  const badRequest = (error: string) => ({
    ok: false as const,
    response: NextResponse.json({ error }, { status: 400 }),
  });

  if (typeof body !== 'object' || body === null) {
    return badRequest('Invalid request body');
  }
  const { name, laCodes } = body as { name?: unknown; laCodes?: unknown };
  if (typeof name !== 'string') {
    return badRequest('Enter a name for this comparator group');
  }
  const nameError = validateGroupName(name, existingNames);
  if (nameError) {
    return badRequest(nameError);
  }

  if (!Array.isArray(laCodes) || laCodes.some((c) => typeof c !== 'string')) {
    return badRequest('Select at least one local authority');
  }
  const dedupedCodes = [...new Set(laCodes as string[])];
  if (dedupedCodes.length === 0) {
    return badRequest('Select at least one local authority');
  }

  const validCodes = await getValidLaCodes();
  if (validCodes === null) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Could not validate local authority codes' },
        { status: 502 }
      ),
    };
  }
  const unknownCodes = dedupedCodes.filter((code) => !validCodes.has(code));
  if (unknownCodes.length > 0) {
    return badRequest(
      `Unknown local authority codes: ${unknownCodes.join(', ')}`
    );
  }

  return { ok: true, name: name.trim(), laCodes: dedupedCodes };
};
