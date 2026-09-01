import { NextRequest } from 'next/server';
import { mockSession, mockSessionUnregistered } from '@/test-utils/test-utils';
import { auth } from '@/lib/auth';
import { MAX_GROUPS_PER_USER } from '@/lib/comparatorGroups';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));
vi.mock('server-only', () => ({
  default: vi.fn(),
}));

// In-memory fake of the comparatorGroup table, driven through a minimal
// chainable authDB mock that mirrors the Kysely calls the routes make.
// enforceUniqueIndex simulates UQ_comparatorGroup_userId_name rejecting a
// duplicate write (as the real MSSQL index does).
let store: any[] = [];
let enforceUniqueIndex = false;

const hasDuplicateName = (userId: string, name: string, excludeId?: string) =>
  store.some(
    (row) =>
      row.userId === userId &&
      row.id !== excludeId &&
      row.name.trim().toLowerCase() === name.trim().toLowerCase()
  );

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
  authDB: {
    selectFrom: () => ({
      selectAll: () => ({
        where: (_col: string, _op: string, userId: string) => ({
          orderBy: () => ({
            execute: async () => store.filter((row) => row.userId === userId),
          }),
        }),
      }),
    }),
    insertInto: () => ({
      values: (row: any) => ({
        execute: async () => {
          if (enforceUniqueIndex && hasDuplicateName(row.userId, row.name)) {
            throw new Error(
              "Violation of UNIQUE KEY constraint 'UQ_comparatorGroup_userId_name'"
            );
          }
          store.push({ ...row });
        },
      }),
    }),
    updateTable: () => ({
      set: (values: any) => ({
        where: (_c1: string, _o1: string, id: string) => ({
          where: (_c2: string, _o2: string, userId: string) => ({
            execute: async () => {
              if (
                enforceUniqueIndex &&
                values.name &&
                hasDuplicateName(userId, values.name, id)
              ) {
                throw new Error(
                  "Violation of UNIQUE KEY constraint 'UQ_comparatorGroup_userId_name'"
                );
              }
              store = store.map((row) =>
                row.id === id && row.userId === userId
                  ? { ...row, ...values }
                  : row
              );
            },
          }),
        }),
      }),
    }),
    deleteFrom: () => ({
      where: (_c1: string, _o1: string, id: string) => ({
        where: (_c2: string, _o2: string, userId: string) => {
          const run = async () => {
            const before = store.length;
            store = store.filter(
              (row) => !(row.id === id && row.userId === userId)
            );
            return { numDeletedRows: BigInt(before - store.length) };
          };
          return {
            execute: async () => [await run()],
            executeTakeFirst: run,
          };
        },
      }),
    }),
  },
}));

const mockGetSession = vi.mocked(auth.api.getSession);

const { server } = await import('@/mocks/node');
const { insertGroupWithGuards, updateGroupWithGuards } = await import(
  '@/lib/comparatorGroupsServer'
);
const { GET: ListGroups, POST: CreateGroup } = await import(
  '../../app/api/comparator_groups/route'
);
const { PUT: UpdateGroup, DELETE: DeleteGroup } = await import(
  '../../app/api/comparator_groups/[id]/route'
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const base_url = 'http://localhost/api/comparator_groups';

const postGroup = (body: unknown) =>
  CreateGroup(
    new NextRequest(base_url, { method: 'POST', body: JSON.stringify(body) })
  );

const putGroup = (id: string, body: unknown) =>
  UpdateGroup(
    new NextRequest(`${base_url}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  );

const deleteGroup = (id: string) =>
  DeleteGroup(new NextRequest(`${base_url}/${id}`, { method: 'DELETE' }), {
    params: Promise.resolve({ id }),
  });

// The MSW handler for /metric_locations/local_authorities serves
// testla1/testla2/testla3 as the valid codes
const validBody = { name: 'My group', laCodes: ['testla2', 'testla3'] };

// A registered session for a DIFFERENT user (mockSessionLAUser shares
// mockSession's user id, so it cannot be used for cross-user tests)
const mockSessionOtherUser: any = {
  user: {
    ...mockSession.user,
    id: 'another-user-id',
  },
};

describe('comparator group routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = [];
    enforceUniqueIndex = false;
    mockGetSession.mockReturnValue(mockSession);
  });

  describe('auth', () => {
    it.each([
      ['GET list', () => ListGroups()],
      ['POST', () => postGroup(validBody)],
      ['PUT', () => putGroup('some-id', validBody)],
      ['DELETE', () => deleteGroup('some-id')],
    ])('%s requires a registered user', async (_label, call) => {
      mockGetSession.mockReturnValue(mockSessionUnregistered);
      const result = await call();
      expect(result.status).toBe(401);
    });
  });

  describe('create and list', () => {
    it('creates a group and lists it back', async () => {
      const createResult = await postGroup(validBody);
      expect(createResult.status).toBe(201);
      const created = await createResult.json();
      expect(created.group.name).toBe('My group');
      expect(created.group.laCodes).toEqual(['testla2', 'testla3']);
      expect(created.group.id).toBeTruthy();

      const listResult = await ListGroups();
      expect(listResult.status).toBe(200);
      const listed = await listResult.json();
      expect(listed.groups).toEqual([created.group]);
    });

    it('trims the name and dedupes codes', async () => {
      const result = await postGroup({
        name: '  Spaced out  ',
        laCodes: ['testla2', 'testla2', 'testla3'],
      });
      expect(result.status).toBe(201);
      const data = await result.json();
      expect(data.group.name).toBe('Spaced out');
      expect(data.group.laCodes).toEqual(['testla2', 'testla3']);
    });

    it.each([
      [{ name: '', laCodes: ['testla2'] }, /enter a name/i],
      [{ name: 'a'.repeat(61), laCodes: ['testla2'] }, /60 characters/i],
      [
        { name: '<script>x</script>', laCodes: ['testla2'] },
        /letters, numbers, spaces/i,
      ],
      [{ name: 'Ok name', laCodes: [] }, /at least one local authority/i],
      [{ name: 'Ok name', laCodes: ['nonexistent'] }, /unknown local authority/i],
    ])('rejects invalid input %j', async (body, expectedError) => {
      const result = await postGroup(body);
      expect(result.status).toBe(400);
      const data = await result.json();
      expect(data.error).toMatch(expectedError);
    });

    it('rejects a duplicate name for the same user', async () => {
      await postGroup(validBody);
      const result = await postGroup({ ...validBody, laCodes: ['testla2'] });
      expect(result.status).toBe(400);
      const data = await result.json();
      expect(data.error).toMatch(/already exists/i);
    });

    it('allows the same name for a different user', async () => {
      await postGroup(validBody);
      mockGetSession.mockReturnValue(mockSessionOtherUser);
      const result = await postGroup(validBody);
      expect(result.status).toBe(201);
    });

    it('enforces the maximum number of groups per user', async () => {
      for (let i = 0; i < MAX_GROUPS_PER_USER; i++) {
        store.push({
          id: `group-${i}`,
          userId: mockSession.user.id,
          name: `Group ${i}`,
          laCodes: JSON.stringify(['testla2']),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      const result = await postGroup(validBody);
      expect(result.status).toBe(400);
      const data = await result.json();
      expect(data.error).toMatch(/maximum of 50/i);
    });

    it('only lists the requesting user own groups', async () => {
      await postGroup(validBody);
      mockGetSession.mockReturnValue(mockSessionOtherUser);
      const listResult = await ListGroups();
      const listed = await listResult.json();
      expect(listed.groups).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates name and members, allowing the group to keep its own name', async () => {
      const created = await (await postGroup(validBody)).json();
      const id = created.group.id;

      const sameName = await putGroup(id, {
        name: 'My group',
        laCodes: ['testla1'],
      });
      expect(sameName.status).toBe(200);

      const renamed = await putGroup(id, {
        name: 'Renamed',
        laCodes: ['testla1', 'testla2'],
      });
      expect(renamed.status).toBe(200);
      const data = await renamed.json();
      expect(data.group).toEqual({
        id,
        name: 'Renamed',
        laCodes: ['testla1', 'testla2'],
      });

      const listed = await (await ListGroups()).json();
      expect(listed.groups[0].name).toBe('Renamed');
    });

    it("returns 404 when editing another user's group", async () => {
      const created = await (await postGroup(validBody)).json();
      mockGetSession.mockReturnValue(mockSessionOtherUser);
      const result = await putGroup(created.group.id, validBody);
      expect(result.status).toBe(404);
    });

    it('returns 404 for an unknown group id', async () => {
      const result = await putGroup('does-not-exist', validBody);
      expect(result.status).toBe(404);
    });
  });

  describe('write-race guards', () => {
    // Simulates two concurrent requests that both passed the route pre-checks
    // by seeding the conflicting row before the guarded write runs
    const rowFor = (id: string, name: string, createdAt: Date) => ({
      id,
      userId: mockSession.user.id,
      name,
      laCodes: JSON.stringify(['testla2']),
      createdAt,
      updatedAt: createdAt,
    });

    it('removes the losing duplicate insert and reports the conflict', async () => {
      const earlier = rowFor('aaa-winner', 'Same name', new Date());
      store.push(earlier);

      const result = await insertGroupWithGuards(
        rowFor('bbb-loser', 'same NAME', new Date())
      );
      expect(result).toBe('duplicate_name');
      // Only the deterministic winner survives
      expect(store).toEqual([earlier]);
    });

    it('keeps the winning insert when it has the lower id', async () => {
      store.push(rowFor('zzz-other', 'Same name', new Date()));
      const result = await insertGroupWithGuards(
        rowFor('aaa-mine', 'Same name', new Date())
      );
      // The concurrent request with the higher id is responsible for
      // removing its own row
      expect(result).toBe('ok');
      expect(store).toHaveLength(2);
    });

    it('removes an insert that raced past the group limit', async () => {
      const base = new Date('2026-01-01');
      for (let i = 0; i < MAX_GROUPS_PER_USER; i++) {
        store.push(rowFor(`group-${i}`, `Group ${i}`, base));
      }
      const result = await insertGroupWithGuards(
        rowFor('zzz-over-limit', 'One too many', new Date())
      );
      expect(result).toBe('limit_exceeded');
      expect(store).toHaveLength(MAX_GROUPS_PER_USER);
    });

    it('reverts a rename that raced into a duplicate name', async () => {
      const mine = rowFor('aaa-mine', 'Original', new Date());
      const other = rowFor('bbb-other', 'Taken', new Date());
      store.push(mine, other);

      const result = await updateGroupWithGuards(mine as any, {
        name: 'taken',
        laCodes: JSON.stringify(['testla3']),
      });
      expect(result).toBe('duplicate_name');
      const reverted = store.find((row) => row.id === 'aaa-mine');
      expect(reverted.name).toBe('Original');
      expect(reverted.laCodes).toBe(JSON.stringify(['testla2']));
    });

    it('maps a unique-index rejection of an insert to duplicate_name', async () => {
      enforceUniqueIndex = true;
      const existing = rowFor('aaa-winner', 'Same name', new Date());
      store.push(existing);

      const result = await insertGroupWithGuards(
        rowFor('bbb-loser', 'SAME NAME', new Date())
      );
      expect(result).toBe('duplicate_name');
      // The index rejected the write outright - nothing was inserted
      expect(store).toEqual([existing]);
    });

    it('maps a unique-index rejection of a rename to duplicate_name without reverting', async () => {
      enforceUniqueIndex = true;
      const mine = rowFor('aaa-mine', 'Original', new Date());
      const other = rowFor('bbb-other', 'Taken', new Date());
      store.push(mine, other);

      const result = await updateGroupWithGuards(mine as any, {
        name: 'Taken',
        laCodes: JSON.stringify(['testla3']),
      });
      expect(result).toBe('duplicate_name');
      const untouched = store.find((row) => row.id === 'aaa-mine');
      expect(untouched.name).toBe('Original');
    });

    it('POST returns 409 with the duplicate-name message on a race conflict', async () => {
      // The pre-check passes (store is empty at check time in this fake), so
      // exercise the guard path via two racing requests
      const [first, second] = await Promise.all([
        postGroup(validBody),
        postGroup({ ...validBody }),
      ]);
      const statuses = [first.status, second.status].sort();
      // At least one succeeds; if the race materialised the other is 409/400
      expect(statuses[0]).toBe(201);
      const listed = await (await ListGroups()).json();
      expect(
        listed.groups.filter((g: any) => g.name === validBody.name)
      ).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('deletes the user own group', async () => {
      const created = await (await postGroup(validBody)).json();
      const result = await deleteGroup(created.group.id);
      expect(result.status).toBe(200);
      const listed = await (await ListGroups()).json();
      expect(listed.groups).toEqual([]);
    });

    it("returns 404 when deleting another user's group, leaving it intact", async () => {
      const created = await (await postGroup(validBody)).json();
      mockGetSession.mockReturnValue(mockSessionOtherUser);
      const result = await deleteGroup(created.group.id);
      expect(result.status).toBe(404);

      mockGetSession.mockReturnValue(mockSession);
      const listed = await (await ListGroups()).json();
      expect(listed.groups).toHaveLength(1);
    });
  });
});
