import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { getAllowedLocationsForUser } from '@/data/locations';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: `No user` }, { status: 401 });
  }

  if (process.env.DATA_API_ROOT) {
    try {
      const locations = await getAllowedLocationsForUser(user);
      return NextResponse.json({ data: locations }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: 'Error fetching data from API' },
        { status: 500 }
      );
    }
  }
}
