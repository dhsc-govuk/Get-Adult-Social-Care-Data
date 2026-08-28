import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { authDB } from '@/lib/auth';
import {
  listGroupsForUser,
  updateGroupWithGuards,
  validateGroupSubmission,
} from '@/lib/comparatorGroupsServer';

// Every query is scoped by userId as well as id, and a non-match returns 404
// (not 403) so group ids belonging to other users are not revealed to exist.

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: 'No user' }, { status: 401 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const existing = await listGroupsForUser(user.id);
  const target = existing.find((row) => row.id === id);
  if (!target) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  }

  const validated = await validateGroupSubmission(
    body,
    // The edited group may keep its own name
    existing.filter((row) => row.id !== id).map((row) => row.name)
  );
  if (!validated.ok) {
    return validated.response;
  }

  const guardResult = await updateGroupWithGuards(target, {
    name: validated.name,
    laCodes: JSON.stringify(validated.laCodes),
  });
  if (guardResult === 'duplicate_name') {
    return NextResponse.json(
      { error: 'A comparator group with this name already exists' },
      { status: 409 }
    );
  }

  return NextResponse.json({
    group: { id, name: validated.name, laCodes: validated.laCodes },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: 'No user' }, { status: 401 });
  }
  const { id } = await params;

  const result = await authDB
    .deleteFrom('comparatorGroup')
    .where('id', '=', id)
    .where('userId', '=', user.id)
    .executeTakeFirst();

  if (!result || result.numDeletedRows === 0n) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  }

  return NextResponse.json({ status: 'OK' });
}
