import { activateInvitedGrants } from '@/lib/accessGrantActivation';

// Minimal chainable fake of the Kysely calls activateInvitedGrants makes
const fakeDb = (
  invited: { provider_code: string; location_code: string | null }[]
) => {
  const updates: any[] = [];
  const audits: any[] = [];
  const chain = (result: () => any) => {
    const builder: any = {
      select: () => builder,
      where: () => builder,
      set: (values: any) => {
        updates.push(values);
        return builder;
      },
      values: (rows: any[]) => {
        audits.push(...rows);
        return builder;
      },
      execute: async () => result(),
    };
    return builder;
  };
  const trx = {
    selectFrom: () => chain(() => invited),
    updateTable: () => chain(() => []),
    insertInto: () => chain(() => []),
  };
  const db: any = {
    transaction: () => ({ execute: (fn: any) => fn(trx) }),
  };
  return { db, updates, audits };
};

const user = {
  id: 'u1',
  name: 'tina@example.com',
  registeredName: 'Tina Singh',
  email: 'tina@example.com',
};
const NOW = new Date('2026-10-27T12:00:00Z');

describe('activateInvitedGrants', () => {
  it('does nothing for users with no invited grants', async () => {
    const { db, updates, audits } = fakeDb([]);

    await activateInvitedGrants(db, user, NOW);

    expect(updates).toEqual([]);
    expect(audits).toEqual([]);
  });

  it('activates invited grants and audits one first sign-in per provider', async () => {
    const { db, updates, audits } = fakeDb([
      { provider_code: 'P1', location_code: 'L1' },
      { provider_code: 'P1', location_code: 'L2' },
      { provider_code: 'P2', location_code: null },
    ]);

    await activateInvitedGrants(db, user, NOW);

    expect(updates).toEqual([
      {
        status: 'active',
        status_changed_at: NOW,
        status_changed_by_user_id: 'u1',
      },
    ]);
    expect(audits).toEqual([
      expect.objectContaining({
        action: 'first_sign_in',
        actor_type: 'user',
        actor_id: 'u1',
        actor_name: 'Tina Singh',
        target_user_id: 'u1',
        provider_code: 'P1',
        location_codes: 'L1,L2',
      }),
      expect.objectContaining({ provider_code: 'P2', location_codes: null }),
    ]);
  });
});
