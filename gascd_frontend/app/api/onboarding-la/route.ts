import { createNewDBUser } from '@/lib/create-new-user';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: `No user` }, { status: 401 });
  }

  const submittedData = await req.json();

  // Insert into database
  const result = await createNewDBUser(submittedData.email ?? null);

  return NextResponse.json({ result }, { status: 200 });
}
