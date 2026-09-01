import { createNewDBUser } from '@/lib/create-new-user';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const submittedData = await req.json();

  const result = await createNewDBUser(submittedData.email ?? null);
  console.log('$$$', req.url, submittedData, result);

  return NextResponse.json({ result }, { status: 200 });
}
