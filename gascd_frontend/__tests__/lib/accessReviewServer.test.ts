import {
  DummyDriver,
  Kysely,
  MssqlAdapter,
  MssqlIntrospector,
  MssqlQueryCompiler,
} from 'kysely';
import { completeReview } from '@/lib/accessReviewServer';
import { mockSession } from '@/test-utils/test-utils';

const queries: { sql: string; parameters: readonly unknown[] }[] = [];

// Compiles real SQL Server queries without a database; every update matches no rows
vi.mock('@/lib/auth', () => ({
  authDB: new Kysely<any>({
    dialect: {
      createAdapter: () => new MssqlAdapter(),
      createDriver: () => new DummyDriver(),
      createIntrospector: (db) => new MssqlIntrospector(db),
      createQueryCompiler: () => new MssqlQueryCompiler(),
    },
    log: (event) => {
      if (event.level === 'query') queries.push(event.query);
    },
  }),
}));
vi.mock('server-only', () => ({}));

const context = (basis: string, locations: string[] = []) => ({
  providerCode: 'P1',
  providerName: 'Test Care Provider 1',
  basis,
  providerWide: basis !== 'registered_manager',
  locations: locations.map((code) => ({ code, name: `Home ${code}` })),
});

const statements = (verb: string) =>
  queries.filter((q) => q.sql.startsWith(verb));

beforeEach(() => {
  queries.length = 0;
});

describe('completeReview', () => {
  it('counts an NI check of who has access for the RM locations too', async () => {
    await completeReview(
      mockSession.user as any,
      context('nominated_individual') as any,
      'users'
    );

    const updates = statements('update');
    expect(updates).toHaveLength(2);
    expect(updates[0].parameters).toContain('provider');
    expect(updates[1].sql).toContain('"provider_code" = @');
    expect(updates[1].parameters).toEqual(
      expect.arrayContaining(['users', 'location', 'P1'])
    );
    expect(updates[0].sql).toContain('"deadline_at" = @');

    const inserts = statements('insert');
    expect(inserts.map((q) => q.parameters)).toEqual([
      expect.arrayContaining(['users', 'provider', 'P1']),
      expect.arrayContaining(['user_review_completed']),
    ]);
  });

  it('records an RM check for each of their locations only', async () => {
    await completeReview(
      mockSession.user as any,
      context('registered_manager', ['L1', 'L2']) as any,
      'users'
    );

    const updates = statements('update');
    expect(updates.map((q) => q.parameters)).toEqual([
      expect.arrayContaining(['users', 'location', 'L1']),
      expect.arrayContaining(['users', 'location', 'L2']),
    ]);
    const inserts = statements('insert');
    expect(inserts[0].parameters).toEqual(
      expect.arrayContaining(['users', 'location', 'P1', 'L1'])
    );
    expect(inserts[1].parameters).toEqual(
      expect.arrayContaining(['users', 'location', 'P1', 'L2'])
    );
    expect(inserts[2].parameters).toEqual(
      expect.arrayContaining(['user_review_completed', 'L1,L2'])
    );
  });

  it('records the approver review for the organisation only', async () => {
    await completeReview(
      mockSession.user as any,
      context('nominated_individual') as any,
      'approvers',
      { kept: ['da-1'], removed: [] }
    );

    expect(statements('update')).toHaveLength(1);
    expect(statements('insert').map((q) => q.parameters)).toEqual([
      expect.arrayContaining(['approvers', 'provider', 'P1']),
      expect.arrayContaining([
        'approver_review_completed',
        JSON.stringify({ kept: ['da-1'], removed: [] }),
      ]),
    ]);
  });
});
