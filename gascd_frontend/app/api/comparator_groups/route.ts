import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { MAX_GROUPS_PER_USER } from '@/lib/comparatorGroups';
import {
  insertGroupWithGuards,
  listGroupsForUser,
  toDto,
  validateGroupSubmission,
} from '@/lib/comparatorGroupsServer';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: 'No user' }, { status: 401 });
  }

  const rows = await listGroupsForUser(user.id);
  return NextResponse.json({ groups: rows.map(toDto) });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: 'No user' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const existing = await listGroupsForUser(user.id);
  if (existing.length >= MAX_GROUPS_PER_USER) {
    return NextResponse.json(
      {
        error: `You can save a maximum of ${MAX_GROUPS_PER_USER} comparator groups. Delete a group to create a new one.`,
      },
      { status: 400 }
    );
  }

  const validated = await validateGroupSubmission(
    body,
    existing.map((row) => row.name)
  );
  if (!validated.ok) {
    return validated.response;
  }

  const now = new Date();
  const group = {
    id: crypto.randomUUID(),
    userId: user.id,
    name: validated.name,
    laCodes: JSON.stringify(validated.laCodes),
    createdAt: now,
    updatedAt: now,
  };
  const guardResult = await insertGroupWithGuards(group);
  if (guardResult === 'duplicate_name') {
    return NextResponse.json(
      { error: 'A comparator group with this name already exists' },
      { status: 409 }
    );
  }
  if (guardResult === 'limit_exceeded') {
    return NextResponse.json(
      {
        error: `You can save a maximum of ${MAX_GROUPS_PER_USER} comparator groups. Delete a group to create a new one.`,
      },
      { status: 409 }
    );
  }

  return NextResponse.json(
    { group: { id: group.id, name: validated.name, laCodes: validated.laCodes } },
    { status: 201 }
  );
}
