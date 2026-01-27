import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { getAllowedLocations } from '@/data/locations';
import { authDB } from '@/lib/auth';
import logger from '@/utils/logger';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: `No user` }, { status: 401 });
  }

  const queryParams = await req.json();
  const selected_location_id = queryParams.location_id;
  if (!selected_location_id) {
    return NextResponse.json({ error: `Missing location id` }, { status: 400 });
  }

  const allowed_locations = await getAllowedLocations(user);
  const matching_location = allowed_locations.find(
    (loc) => loc.location_id === selected_location_id
  );
  if (!matching_location) {
    logger.error(`Invalid location selected for user: ${selected_location_id}`);
    return NextResponse.json(
      { error: `Invalid location selected for user: ${selected_location_id}` },
      { status: 401 }
    );
  }

  // Update the DB directly to allow these fields to be set
  await authDB
    .updateTable('user')
    .set({
      selectedLocationId: matching_location.location_id,
      selectedLocationDisplayName: matching_location.location_display_name,
    })
    .where('user.id', '=', user.id)
    .execute();

  return NextResponse.json({ status: 'OK' });
}
